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

module.exports = function (results) {

    function checkIdentical(fileName) {
        it(fileName, function () {
            const version1Entry = results.version1.files[fileName];
            const version2Entry = results.version2.files[fileName];
            const diffEntry = results.version1to2.filesMap[fileName];
            assert.strictEqual(version1Entry.strictHash, version2Entry.strictHash);
            assert.deepStrictEqual(version1Entry, version2Entry);
            assert.strictEqual(diffEntry, undefined);
        });
    }

    checkIdentical("x/BinaryUnchanging.js");
};
