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

const path = require("path");
const co = require("co");
const promisify = require("pify");
const readFile = promisify(require("graceful-fs").readFile);
const fileFormat = require("./fileFormat");

module.exports = co.wrap(function * (extractor, cwd, filesList, result) {
    if (!result) {
        result = fileFormat.createExtractedData();
        result.files = {};
    }
    const filesMap = result.files;
    yield Promise.all(filesList.map(co.wrap(function * (filePath) {
        const fileContent = yield readFile(path.join(cwd, filePath));
        filesMap[filePath] = extractor.parseFile(fileContent, filePath);
    })));
    return result;
});
