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

const baseChanges = require("./base");
const constructors = exports.constructors = {};
const abstractConstructors = exports.abstractConstructors = {};

class ParentChange extends baseChanges.abstractConstructors.Change {
    getParent1() {
        return this.config.parent1;
    }

    getParent2() {
        return this.config.parent2;
    }
}
constructors.ParentChange = ParentChange;

class MemberChange extends baseChanges.abstractConstructors.Change {
    getMemberName() {
        return this.config.memberName;
    }

    getMember1() {
        return this.config.member1;
    }

    getMember2() {
        return this.config.member2;
    }
}
constructors.MemberChange = MemberChange;

class MemberImpact extends baseChanges.abstractConstructors.Impact {
    getMemberName() {
        return this.config.memberName;
    }

    getMember1() {
        return this.config.member1;
    }

    getMember2() {
        return this.config.member2;
    }
}
abstractConstructors.MemberImpact = MemberImpact;

class MemberAdded extends MemberImpact {}
constructors.MemberAdded = MemberAdded;

class MemberRemoved extends MemberImpact {}
constructors.MemberRemoved = MemberRemoved;

class MemberSignatureChanged extends MemberImpact {}
constructors.MemberSignatureChanged = MemberSignatureChanged;

class MemberImplementationChanged extends MemberImpact {}
constructors.MemberImplementationChanged = MemberImplementationChanged;

class SpecialMemberImpact extends baseChanges.abstractConstructors.Impact {
    getMemberName() {
        return this.config.memberName;
    }

    isPropagatable() {
        return false;
    }
}
abstractConstructors.SpecialMemberImpact = SpecialMemberImpact;

class RemovedMemberStillUsed extends SpecialMemberImpact {}
constructors.RemovedMemberStillUsed = RemovedMemberStillUsed;

class UsedMemberChangedSignature extends SpecialMemberImpact {}
constructors.UsedMemberChangedSignature = UsedMemberChangedSignature;

class OverriddenParentMemberChanged extends SpecialMemberImpact {}
constructors.OverriddenParentMemberChanged = OverriddenParentMemberChanged;
