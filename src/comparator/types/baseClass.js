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

const BaseComparison = require("./base");
const baseClassChanges = require("../changes/baseClass");
const compareMaps = require("../../utils/compareMaps");
const mapObject = require("../../utils/mapObject");
const MapOfArraysComparator = require("../mapOfArraysComparator");

class BaseClassComparison extends BaseComparison {
    compareSameType() {
        this.compareMembers();
        // Are there any other changes than members?
        // Maybe we should call the parent method in that case (which adds an
        // UnknownImpact for an UnknownChange):
        // super.compareSameType();
    }

    getOwnMembers(versionIndex) {
        let res = this[`members${versionIndex}`];
        if (!res) {
            const filePath = this.filePath;
            res = this[`members${versionIndex}`] = mapObject(this.getVersion(versionIndex).content.members, member => ({
                filePath: filePath,
                member: member
            }));
        }
        return res;
    }

    getOwnMember(versionIndex, memberName) {
        const members = this.getOwnMembers(versionIndex);
        if (members) {
            return members[memberName];
        }
    }

    getParent(versionIndex) {
        return this.getVersion(versionIndex).content.parent;
    }

    getParentAllMembers(versionIndex) {
        const parentComparison = this.getDependencyOrWarn(this.getParent(versionIndex), BaseClassComparison);
        if (parentComparison) {
            return parentComparison.getAllMembers(versionIndex);
        }
        return Object.create(null);
    }

    getAllMembers(versionIndex) {
        let res = this[`allMembers${versionIndex}`];
        if (!res) {
            const parentMembers = this.getParentAllMembers(versionIndex);
            const ownMembers = this.getOwnMembers(versionIndex);
            res = Object.assign(Object.create(null), parentMembers, ownMembers);
        }
        return res;
    }

    getParentMember(versionIndex, memberName) {
        const parentComparison = this.getDependencyOrWarn(this.getParent(versionIndex), BaseClassComparison);
        if (parentComparison) {
            return parentComparison.getMember(versionIndex, memberName);
        }
    }

    getMember(versionIndex, memberName) {
        const allMembers = this[`allMembers${versionIndex}`];
        if (allMembers) {
            return allMembers[memberName];
        } else {
            return this.getOwnMember(versionIndex, memberName) || this.getParentMember(versionIndex, memberName);
        }
    }

    compareMembers() {
        // Check if parent changed:
        const parent1 = this.getParent(1);
        const parent2 = this.getParent(2);
        let parent1Members, parent2Members, parentChange;
        if (parent1 !== parent2) {
            // pre-compute all parent members:
            parent1Members = this.getParentAllMembers(1);
            parent2Members = this.getParentAllMembers(2);
            parentChange = this.addChange(baseClassChanges.constructors.ParentChange, {
                parent1: parent1,
                parent2: parent2
            });
        }

        // compare own members (without looking in parents)
        compareMaps(this.getOwnMembers(1), this.getOwnMembers(2), (memberName, member1, member2) => {
            if (!this.isSameMember(memberName, member1, member2)) {
                const ownChange = this.addMemberChange(memberName, member1, member2);
                // look in parents in case the member was added or removed:
                member1 = member1 || this.getMember(1, memberName);
                member2 = member2 || this.getMember(2, memberName);
                this.addCause(this.addMemberImpact(memberName, member1, member2), ownChange);
            }
        });

        // Look for changes due to the change of parent:
        if (parentChange) {
            compareMaps(parent1Members, parent2Members, (memberName, member1, member2) => {
                if (!this.isSameMember(memberName, member1, member2)) {
                    this.addCause(this.processParentMemberChange(memberName, member1, member2), parentChange);
                }
            });
        }

    }

    isSameMember(memberName, member1, member2) {
        return member1 && member2 && member1.filePath === member2.filePath && member1.member.type === member2.member.type && member1.member.hash === member2.member.hash;
    }

    isSameSignature(memberName, member1, member2) {
        const member1Member = member1.member;
        const member2Member = member2.member;
        const member1Type = member1Member.type;
        if (member1Type !== member2Member.type) {
            return false;
        }
        const fn = this[`isSameSignatureFor${member1Type[0].toUpperCase()}${member1Type.slice(1)}`];
        if (fn) {
            return fn.call(this, memberName, member1, member2);
        }
        return true;
    }

    isSameSignatureForFunction(memberName, member1, member2) {
        const args1 = member1.member.args;
        const args2 = member2.member.args;
        return args1.length === args2.length ? args1.every((name,index) => name === args2[index]) : false;
    }

    getMemberChangeInfo(memberName) {
        let memberChangeInfo = this.memberChangeInfo;
        if (!memberChangeInfo) {
            memberChangeInfo = this.memberChangeInfo = Object.create(null);
        }
        if (memberName) {
            let info = memberChangeInfo[memberName];
            if (!info) {
                info = memberChangeInfo[memberName] = {};
            }
            return info;
        } else {
            return memberChangeInfo;
        }
    }

    addMemberChange(memberName, member1, member2) {
        return this.addChange(baseClassChanges.constructors.MemberChange, {
            memberName: memberName,
            member1: member1 ? member1.member : null,
            member2: member2 ? member2.member : null
        });
    }

    computeMemberImpactType(memberName, member1, member2) {
        if (member1 && !member2) {
            return baseClassChanges.constructors.MemberRemoved;
        } else if (!member1 && member2) {
            return baseClassChanges.constructors.MemberAdded;
        } else if (member1 && member2) {
            const sameSignature = this.isSameSignature(memberName, member1, member2);
            return sameSignature ? baseClassChanges.constructors.MemberImplementationChanged : baseClassChanges.constructors.MemberSignatureChanged;
        } else {
            throw new Error("Assertion failed: !member1 && !member2");
        }
    }

    addMemberImpact(memberName, member1, member2, impactType) {
        const changeInfo = this.getMemberChangeInfo(memberName);
        if (changeInfo.impact) {
            throw new Error(`Assertion failed: in ${this.filePath} ${memberName} already has an impact: ${changeInfo.impact.constructor.type}`);
        }
        if (!impactType) {
            impactType = this.computeMemberImpactType(memberName, member1, member2);
        }
        const impact = changeInfo.impact = this.addImpact(impactType, {
            memberName: memberName,
            member1: member1,
            member2: member2
        });
        this.delayedProcessings.push(() => {
            this.processMemberUsages(impact);
        });
        return impact;
    }

    forEachCommonMemberUsage(memberName, fn) {
        if (!this.membersUsagesComparator) {
            this.membersUsagesComparator = new MapOfArraysComparator(this, version => version.content.membersUsages, item => item);
        }
        const memberNameLength = memberName.length;
        return this.membersUsagesComparator.forEachCommonValue(memberUsed => (memberUsed.startsWith(memberName) && (memberNameLength === memberUsed.length || memberUsed[memberNameLength] === ".")), fn);
    }

    processMemberUsages(impact) {
        const memberName = impact.getMemberName();
        let newImpactType = null;
        if (impact instanceof baseClassChanges.constructors.MemberRemoved) {
            newImpactType = baseClassChanges.constructors.RemovedMemberStillUsed;
        } else if (impact instanceof baseClassChanges.constructors.MemberSignatureChanged) {
            newImpactType = baseClassChanges.constructors.UsedMemberChangedSignature;
        }
        if (newImpactType) {
            this.forEachCommonMemberUsage(memberName, (usedMember, userMember) => {
                this.addImpact(newImpactType, {
                    memberName: userMember
                }).addCause(impact);
            });
        }
    }

    processImpactFromParent(impact) {
        if (impact instanceof baseClassChanges.abstractConstructors.MemberImpact) {
            this.addCause(this.processParentMemberChange(impact.getMemberName(), impact.getMember1(), impact.getMember2(), impact.constructor), impact);
        }
    }

    getContainerOwnMember(versionIndex, memberName) {
        const splitMemberName = memberName.split(".");
        while (splitMemberName.length > 0) {
            const curMemberName = splitMemberName.join(".");
            const ownMember = this.getOwnMember(versionIndex, curMemberName);
            if (ownMember) {
                return {
                    memberName: curMemberName,
                    member: ownMember
                };
            }
            splitMemberName.pop();
        }
    }

    processParentMemberChange(memberName, member1, member2, impactType) {
        const ownMember1 = this.getContainerOwnMember(1, memberName);
        const ownMember2 = this.getContainerOwnMember(2, memberName);
        if (ownMember1 && ownMember2) {
            if (!impactType) {
                impactType = this.computeMemberImpactType(memberName, member1, member2);
            }
            const newImpactConfig = {
                memberName: memberName,
                member1: member1,
                member2: member2,
                overridingMember1: ownMember1.member,
                overridingMember2: ownMember2.member
            };
            let newImpactTypeName;
            if (ownMember1.memberName === memberName && ownMember2.memberName === memberName) {
                newImpactTypeName = `OverriddenParent${impactType.type}`;
            } else {
                newImpactTypeName = `OverriddenParentDependency${impactType.type}`;
                newImpactConfig.overridingMember1Name = ownMember1.memberName;
                newImpactConfig.overridingMember2Name = ownMember2.memberName;
            }
            return this.addImpact(baseClassChanges.constructors[newImpactTypeName], newImpactConfig);
        } else if (ownMember1 || ownMember2) {
            // change both in parent and in child about the same member
            // the change in child is already reported, the change in parent does not need to be reported
        } else {
            // parent changed and the member is not overridden, let's just propagate the change:
            return this.addMemberImpact(memberName, member1, member2, impactType);
        }
    }

}

module.exports = BaseClassComparison;
