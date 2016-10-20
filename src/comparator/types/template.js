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

const BaseClassComparison = require("./baseClass");
const TplScriptDefinitionComparison = require("./tplScriptDefinition");
const baseClassChanges = require("../changes/baseClass");
const templateChanges = require("../changes/template");
const compareMaps = require("../../utils/compareMaps");

class TemplateComparison extends BaseClassComparison {

    isSameSignatureForMacro(memberName, member1, member2) {
        return this.isSameSignatureForFunction(memberName, member1, member2);
    }

    isSameSignatureForLib(libName, member1, member2) {
        this.delayedProcessings.push(() => {
            const changeLibMemberImpact = this.getMemberChangeInfo(libName).impact;
            if (!changeLibMemberImpact || changeLibMemberImpact.getMember1() !== member1 || changeLibMemberImpact.getMember2() !== member2) {
                return;
            }
            const lib1 = this.getDependencyOrWarn(member1.member.path, TemplateComparison);
            const lib2 = this.getDependencyOrWarn(member2.member.path, TemplateComparison);
            if (lib1 && lib2) {
                compareMaps(lib1.getAllMembers(1), lib2.getAllMembers(2), (memberName, member1, member2) => {
                    if (!this.isSameMember(memberName, member1, member2)) {
                        this.addCause(this.processLibMemberChange(libName, memberName, member1, member2), changeLibMemberImpact);
                    }
                });
            }
        });
        return true;
    }

    processImpactFromLib(impact, usage) {
        if (impact instanceof baseClassChanges.abstractConstructors.MemberImpact) {
            this.addCause(this.processLibMemberChange(usage.member, impact.getMemberName(), impact.getMember1(), impact.getMember2(), impact.constructor), impact);
        }
    }

    processLibMemberChange(libName, memberNameInLib, member1, member2, impactType) {
        if (memberNameInLib.startsWith("this.")) {
            return this.addMemberImpact(`${libName}${memberNameInLib.slice(4)}`, member1, member2, impactType);
        }
    }

    getScript(versionIndex) {
        return this.getVersion(versionIndex).content.script;
    }

    getOwnMembers(versionIndex) {
        // considers template script items as own members
        let res = this[`templateMembers${versionIndex}`];
        if (!res) {
            res = super.getOwnMembers(versionIndex);
            const script = this.getDependencyOrWarn(this.getScript(versionIndex), TplScriptDefinitionComparison);
            if (script) {
                const scriptMembers = script.getOwnMembers(versionIndex);
                Object.assign(res, scriptMembers);
            }
            this[`templateMembers${versionIndex}`] = res;
        }
        return res;
    }

    addMemberChange(memberName, member1, member2) {
        const script1 = this.getScript(1);
        const script2 = this.getScript(2);
        const member1InScript = script1 && member1 && member1.filePath === script1;
        const member2InScript = script2 && member2 && member2.filePath === script2;
        if (member1InScript || member2InScript) {
            if (script1 && script2) {
                const script = this.getDependencyOrWarn(script1, TplScriptDefinitionComparison);
                if (script) {
                    // make sure the 2 versions of the script were compared:
                    script.compare();
                    // look in the script changes to find the correct one
                    return script.scriptMemberChange[memberName];
                }
            } else {
                return this.scriptChange;
            }
        }
        return super.addMemberChange(memberName, member1, member2);
    }

    compareMembers() {
        if (!this.membersComparisonDone) {
            const script1 = this.getScript(1);
            const script2 = this.getScript(2);
            if (script1 !== script2) {
                this.scriptChange = this.addChange(templateChanges.constructors.ScriptChange, {
                    script1: script1,
                    script2: script2
                });
            }
            super.compareMembers();
            this.membersComparisonDone = true;
        }
    }

    processImpactFromScript(impact) {
        if (impact instanceof baseClassChanges.abstractConstructors.MemberImpact) {
            // Change in script
            // make sure we compared members (especially in case the template itself did not change):
            this.compareMembers();
        }
    }
}

module.exports = TemplateComparison;
