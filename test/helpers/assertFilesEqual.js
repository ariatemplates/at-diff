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

const assert = require("assert");
const fs = require("graceful-fs");
const co = require("co");
const promisify = require("pify");
const readFile = promisify(fs.readFile);

const lineEnd = /\r?\n/g;
const readTextFile = co.wrap(function * (fileName) {
    const fileContent = yield readFile(fileName, "utf-8");
    return fileContent.replace(lineEnd, "\n");
});

module.exports = co.wrap(function * (file1, file2) {
    const file1Content = yield readTextFile(file1);
    const file2Content = yield readTextFile(file2);
    assert.strictEqual(file1Content, file2Content, `${file1} and ${file2} are different.`);
});
