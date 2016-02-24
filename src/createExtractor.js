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
const promisify = require("pify");
const fs = require("graceful-fs");
const readFile = promisify(fs.readFile);
const readJson = require("./readJson");
const Extractor = require("./extractor");
const getATContext = require("./extractor/getATContext");

module.exports = co.wrap(function * (config) {
    const extractorConfig = {};
    let atSetupFiles = config.atSetup;
    if (atSetupFiles) {
        if (!Array.isArray(atSetupFiles)) {
            atSetupFiles = [atSetupFiles];
        }
        const atContext = getATContext(extractorConfig);
        const filesContent = yield Promise.all(atSetupFiles.map(file => readFile(file, "utf-8")));
        filesContent.forEach((content) => {
            atContext.Aria["eval"](content);
            atContext.execTimeouts();
        });
    }
    const extractor = new Extractor(extractorConfig);
    let cacheFiles = config.loadParserCache;
    if (cacheFiles) {
        if (!Array.isArray(cacheFiles)) {
            cacheFiles = [cacheFiles];
        }
        yield Promise.all(cacheFiles.map(co.wrap(function * (fileName) {
            const jsonContent = yield readJson(fileName);
            extractor.fillCache(jsonContent);
        })));
    }
    return extractor;
});
