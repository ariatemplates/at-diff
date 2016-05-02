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
    it("y/OverridesParent.tml", function () {
        const diffEntry = results.impactsOnUser.filesMap["y/OverridesParent.tml"];
        const impacts = diffEntry.impacts;
        assert.strictEqual(impacts.length, 4);
        let curImpact = impacts[0];
        assert.strictEqual(curImpact.constructor, changeConstructors.OverriddenParentMemberAdded);
        assert.strictEqual(curImpact.getMemberName(), "this.macro_myMacroToBeAdded");
        curImpact = impacts[1];
        assert.strictEqual(curImpact.constructor, changeConstructors.OverriddenParentMemberRemoved);
        assert.strictEqual(curImpact.getMemberName(), "this.macro_myMacroToBeRemoved");
        curImpact = impacts[2];
        assert.strictEqual(curImpact.constructor, changeConstructors.OverriddenParentMemberImplementationChanged);
        assert.strictEqual(curImpact.getMemberName(), "this.macro_myMacroToChangeImplementation");
        curImpact = impacts[3];
        assert.strictEqual(curImpact.constructor, changeConstructors.OverriddenParentMemberSignatureChanged);
        assert.strictEqual(curImpact.getMemberName(), "this.macro_myMacroToChangeSignature");
    });
};
