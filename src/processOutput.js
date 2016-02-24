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
const fs = require("graceful-fs");
const promisify = require("pify");
const defaultWriteFile = promisify(fs.writeFile);
const generateReport = require("./ui");
const open = require("./utils/open");

module.exports = co.wrap(function * (config, data, writeFile) {
    writeFile = writeFile || defaultWriteFile;
    if (config.jsonOutput) {
        const output = JSON.stringify(data, null, config.jsonBeautify ? " ": null);
        yield writeFile(config.jsonOutput, output);
    }
    if (config.htmlOutput) {
        const htmlReport = generateReport(data);
        yield writeFile(config.htmlOutput, htmlReport);
        if (config.open) {
            yield open(config.htmlOutput);
        }
    }
    if (config.consoleOutput) {
        console.log(JSON.stringify(data, null, " "));
    }
});
