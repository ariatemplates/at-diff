/*
 * Copyright 2016 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

const co = require("co");
const sax = require("sax");
const fs = require("graceful-fs");
const promisify = require("pify");
const readFile = promisify(fs.readFile);

const jsonRegExp = /^\s*\{/;
const htmlRegExp = /^\s*\</;
const atDiffData = /^\s*var\s+atdiffData\s*=\s*(.*[^;])\s*;?\s*$/;

function parseHTML(html) {
    let rightTag = false;
    let jsonText = null;
    const parser = sax.parser(false);
    parser.onopentag = function (node) {
        rightTag = (node.name === "SCRIPT" && node.attributes.ID === "atdiff-data");
    };
    parser.onscript = function (text) {
        if (rightTag) {
            const match = atDiffData.exec(text);
            if (match) {
                jsonText = match[1];
            }
        }
    };
    parser.write(html).close();
    if (!jsonText) {
        throw new Error("Could not find the expected JSON data inside the html file.");
    }
    return JSON.parse(jsonText);
}

module.exports = co.wrap(function * (fileName) {
    const fileContent = yield readFile(fileName, "utf-8");
    try {
        if (jsonRegExp.test(fileContent)) {
            return JSON.parse(fileContent);
        } else if (htmlRegExp.test(fileContent)) {
            return parseHTML(fileContent);
        }
    } catch (e) {
        throw new Error(`${fileName} could not be parsed successfully\n${e}`);
    }
    throw new Error(`${fileName} has an unknown format.`);
});
