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
    function checkImpacts(impacts, prefix) {
        assert.strictEqual(impacts.length, 4);
        let curImpact = impacts[0];
        assert.strictEqual(curImpact.constructor, changeConstructors.MemberImplementationChanged);
        assert.strictEqual(curImpact.getMemberName(), `${prefix}`);
        curImpact = impacts[1];
        assert.strictEqual(curImpact.constructor, changeConstructors.MemberRemoved);
        assert.strictEqual(curImpact.getMemberName(), `${prefix}.$MacroLib1`);
        curImpact = impacts[2];
        assert.strictEqual(curImpact.constructor, changeConstructors.MemberAdded);
        assert.strictEqual(curImpact.getMemberName(), `${prefix}.$MacroLib2`);
        curImpact = impacts[3];
        assert.strictEqual(curImpact.constructor, changeConstructors.MemberImplementationChanged);
        assert.strictEqual(curImpact.getMemberName(), `${prefix}.macro_myChildMacro`);
    }

    it("x/changingMacroLib/MacroLibUser.tml", function () {
        const diffEntry = results.version1to2.filesMap["x/changingMacroLib/MacroLibUser.tml"];
        assert.strictEqual(diffEntry.changes.length, 1);
        const memberChangeInstance = diffEntry.changes[0];
        assert.strictEqual(memberChangeInstance.constructor, changeConstructors.MemberChange);
        assert.strictEqual(memberChangeInstance.getMemberName(), "this.myMacroLib");
        checkImpacts(diffEntry.impacts, "this.myMacroLib");
    });

    it("x/changingMacroLib/ExtendsMacroLibxUser.tml", function () {
        const diffEntry = results.version1to2.filesMap["x/changingMacroLib/ExtendsMacroLibxUser.tml"];
        assert.strictEqual(diffEntry.changes.length, 1);
        assert.strictEqual(diffEntry.changes[0].constructor, changeConstructors.ParentChange);
        const impacts = diffEntry.impacts;
        let curImpact = impacts[0];
        assert.strictEqual(curImpact.constructor, changeConstructors.MemberRemoved);
        assert.strictEqual(curImpact.getMemberName(), "this.$MacroLib1User");
        curImpact = impacts[1];
        assert.strictEqual(curImpact.constructor, changeConstructors.MemberAdded);
        assert.strictEqual(curImpact.getMemberName(), "this.$MacroLib2User");
        checkImpacts(impacts.slice(2), "this.myMacroLib");
    });

    it("x/changingMacroLib/UsesMacroLibxUser.tpl", function () {
        const diffEntry = results.version1to2.filesMap["x/changingMacroLib/UsesMacroLibxUser.tpl"];
        assert.strictEqual(diffEntry.changes.length, 1);
        const memberChangeInstance = diffEntry.changes[0];
        assert.strictEqual(memberChangeInstance.constructor, changeConstructors.MemberChange);
        assert.strictEqual(memberChangeInstance.getMemberName(), "this.mLib");
        const impacts = diffEntry.impacts;
        let curImpact = impacts[0];
        assert.strictEqual(curImpact.constructor, changeConstructors.MemberImplementationChanged);
        assert.strictEqual(curImpact.getMemberName(), "this.mLib");
        curImpact = impacts[1];
        assert.strictEqual(curImpact.constructor, changeConstructors.MemberRemoved);
        assert.strictEqual(curImpact.getMemberName(), "this.mLib.$MacroLib1User");
        curImpact = impacts[2];
        assert.strictEqual(curImpact.constructor, changeConstructors.MemberAdded);
        assert.strictEqual(curImpact.getMemberName(), "this.mLib.$MacroLib2User");
        checkImpacts(impacts.slice(3), "this.mLib.myMacroLib");
    });

    it("y/changingMacroLib/ExtendsMacroLibUser.tml", function () {
        const diffEntry = results.impactsOnUser.filesMap["y/changingMacroLib/ExtendsMacroLibUser.tml"];
        checkImpacts(diffEntry.impacts, "this.myMacroLib");
    });

    it("y/changingMacroLib/UsesMacroLibUser.tpl", function () {
        const diffEntry = results.impactsOnUser.filesMap["y/changingMacroLib/UsesMacroLibUser.tpl"];
        checkImpacts(diffEntry.impacts, "this.mLib.myMacroLib");
    });
};
