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
const changeConstructors = require("../../src/comparator/changes").defaultConstructors;

module.exports = function (results) {
    it("x/ClassToBeRemoved.js", function () {
        const version1Entry = results.version1.files["x/ClassToBeRemoved.js"];
        const version2Entry = results.version2.files["x/ClassToBeRemoved.js"];
        const diffEntry = results.version1to2.filesMap["x/ClassToBeRemoved.js"];
        assert.ok(version1Entry);
        assert.ok(!version2Entry);
        assert.strictEqual(diffEntry.changes.length, 1);
        assert.strictEqual(diffEntry.changes[0].constructor, changeConstructors.FileRemoved);
        assert.strictEqual(diffEntry.impacts.length, 1);
        assert.strictEqual(diffEntry.impacts[0].constructor, changeConstructors.UnusableFile);
    });

    it("y/UsesRemovedClass.js", function () {
        const diffEntry = results.impactsOnUser.filesMap["y/UsesRemovedClass.js"];
        assert.strictEqual(diffEntry.impacts.length, 1);
        assert.strictEqual(diffEntry.impacts[0].constructor, changeConstructors.UnusableFile);
    });

    it("y/IndirectlyUsesRemovedClass.js", function () {
        const diffEntry = results.impactsOnUser.filesMap["y/IndirectlyUsesRemovedClass.js"];
        assert.strictEqual(diffEntry.impacts.length, 1);
        assert.strictEqual(diffEntry.impacts[0].constructor, changeConstructors.UnusableFile);
    });

};
