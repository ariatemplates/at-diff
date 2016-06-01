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
    it("y/overridesParentDependency/ChildTemplate.tpl", function () {
        const diffEntry = results.impactsOnUser.filesMap["y/overridesParentDependency/ChildTemplate.tpl"];
        const impacts = diffEntry.impacts;
        assert.strictEqual(impacts.length, 4);
        let curImpact = impacts[0];
        assert.strictEqual(curImpact.constructor, changeConstructors.OverriddenParentDependencyMemberAdded);
        assert.strictEqual(curImpact.getMemberName(), "this.myMacroLib.macro_myMacroToBeAdded");
        assert.strictEqual(curImpact.getOverridingMember1Name(), "this.myMacroLib");
        assert.strictEqual(curImpact.getOverridingMember2Name(), "this.myMacroLib");
        curImpact = impacts[1];
        assert.strictEqual(curImpact.constructor, changeConstructors.OverriddenParentDependencyMemberRemoved);
        assert.strictEqual(curImpact.getMemberName(), "this.myMacroLib.macro_myMacroToBeRemoved");
        assert.strictEqual(curImpact.getOverridingMember1Name(), "this.myMacroLib");
        assert.strictEqual(curImpact.getOverridingMember2Name(), "this.myMacroLib");
        curImpact = impacts[2];
        assert.strictEqual(curImpact.constructor, changeConstructors.OverriddenParentDependencyMemberImplementationChanged);
        assert.strictEqual(curImpact.getMemberName(), "this.myMacroLib.macro_myMacroToChangeImplementation");
        assert.strictEqual(curImpact.getOverridingMember1Name(), "this.myMacroLib");
        assert.strictEqual(curImpact.getOverridingMember2Name(), "this.myMacroLib");
        curImpact = impacts[3];
        assert.strictEqual(curImpact.constructor, changeConstructors.OverriddenParentDependencyMemberSignatureChanged);
        assert.strictEqual(curImpact.getMemberName(), "this.myMacroLib.macro_myMacroToChangeSignature");
        assert.strictEqual(curImpact.getOverridingMember1Name(), "this.myMacroLib");
        assert.strictEqual(curImpact.getOverridingMember2Name(), "this.myMacroLib");
    });
};
