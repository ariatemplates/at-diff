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
const changeConstructors = require("../../src/comparator/changes");

module.exports = function (results) {
    it("x/MacroLibWithMemberRemoved.tml", function () {
        const diffEntry = results.version1to2.filesMap["x/MacroLibWithMemberRemoved.tml"];
        assert.strictEqual(diffEntry.changes.length, 1);
        assert.strictEqual(diffEntry.changes[0].constructor, changeConstructors.MemberChange);
        assert.strictEqual(diffEntry.impacts.length, 1);
        assert.strictEqual(diffEntry.impacts[0].constructor, changeConstructors.MemberRemoved);
    });

    it("y/UsesMacroLibWithMemberRemoved1.tpl", function () {
        // Does not use the removed macro, but the member was still removed...
        const diffEntry = results.impactsOnUser.filesMap["y/UsesMacroLibWithMemberRemoved1.tpl"];
        assert.strictEqual(diffEntry.impacts.length, 1);
        const impact1 = diffEntry.impacts[0];
        assert.strictEqual(impact1.constructor, changeConstructors.MemberRemoved);
        assert.strictEqual(impact1.getMemberName(), "this.myMacroLib.macro_myMacro2");
    });

    it("y/UsesMacroLibWithMemberRemoved2.tpl", function () {
        // Uses the removed macro, so 2 impacts
        const diffEntry = results.impactsOnUser.filesMap["y/UsesMacroLibWithMemberRemoved2.tpl"];
        assert.strictEqual(diffEntry.impacts.length, 2);
        const impact1 = diffEntry.impacts[0];
        assert.strictEqual(impact1.constructor, changeConstructors.MemberRemoved);
        assert.strictEqual(impact1.getMemberName(), "this.myMacroLib.macro_myMacro2");
        const impact2 = diffEntry.impacts[1];
        assert.strictEqual(impact2.constructor, changeConstructors.RemovedMemberStillUsed);
        assert.strictEqual(impact2.getMemberName(), "this.macro_main");
        assert.deepStrictEqual(impact2.getCauses(), [impact1]);
    });
};
