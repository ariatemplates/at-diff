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

/**
 * A `ParentChange` change is generated when the `$extends` property changed in a class.
 * @atdiff-change
 */
class ParentChange extends baseChanges.abstractConstructors.Change {
    getParent1() {
        return this.config.parent1;
    }

    getParent2() {
        return this.config.parent2;
    }
}
constructors.ParentChange = ParentChange;

/**
 * A `MemberChange` change is generated when a member of a class is directly modified
 * (the member may have been added, removed, its signature may have changed or only the implementation
 * may have changed).
 *
 * Depending on the type of change, and on the inherited members from the parent, a `MemberChange` change
 * can generate different kinds of impacts, including `MemberAdded`, `MemberRemoved`, `MemberSignatureChanged`
 * and `MemberImplementationChanged`.
 * @atdiff-change
 */
class MemberChange extends baseChanges.abstractConstructors.Change {
    getMemberName() {
        return this.config.memberName;
    }

    getKey() {
        return `${super.getKey()}|${this.getMemberName()}`;
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

    getKey() {
        return `${super.getKey()}|${this.getMemberName()}`;
    }

    getMember1() {
        return this.config.member1;
    }

    getMember2() {
        return this.config.member2;
    }
}
abstractConstructors.MemberImpact = MemberImpact;

/**
 * A `MemberAdded` impact is generated when a member is added in a class.
 * @atdiff-impact
 */
class MemberAdded extends MemberImpact {}
constructors.MemberAdded = MemberAdded;

/**
 * A `MemberRemoved` impact is generated when a member is removed in a class.
 *
 * This impact can cause the `RemovedMemberStillUsed` impact if it can be detected that the removed member is still used.
 * @atdiff-impact
 */
class MemberRemoved extends MemberImpact {}
constructors.MemberRemoved = MemberRemoved;

/**
 * A `MemberSignatureChanged` impact is generated when the signature of a member changed.
 *
 * This impact can cause the `UsedMemberChangedSignature` impact if it can be detected that the member which changed signature is used.
 * @atdiff-impact
 */
class MemberSignatureChanged extends MemberImpact {}
constructors.MemberSignatureChanged = MemberSignatureChanged;

/**
 * A `MemberImplementationChanged` impact is generated when the implementation of a member changed.
 * @atdiff-impact
 */
class MemberImplementationChanged extends MemberImpact {}
constructors.MemberImplementationChanged = MemberImplementationChanged;

class SpecialMemberImpact extends baseChanges.abstractConstructors.Impact {
    getMemberName() {
        return this.config.memberName;
    }

    getKey() {
        return `${super.getKey()}|${this.getMemberName()}`;
    }

    isPropagatable() {
        return false;
    }
}
abstractConstructors.SpecialMemberImpact = SpecialMemberImpact;

/**
 * The `RemovedMemberStillUsed` impact is generated when it is detected that a class
 * member which has been removed is still used.
 * @atdiff-impact
 */
class RemovedMemberStillUsed extends SpecialMemberImpact {}
constructors.RemovedMemberStillUsed = RemovedMemberStillUsed;

/**
 * The `UsedMemberChangedSignature` impact is generated when it is detected that a class
 * member whose signature changed is used.
 * @atdiff-impact
 */
class UsedMemberChangedSignature extends SpecialMemberImpact {}
constructors.UsedMemberChangedSignature = UsedMemberChangedSignature;

class OverriddenMemberImpact extends SpecialMemberImpact {
    getOverridingMember1() {
        return this.config.overridingMember1;
    }

    getOverridingMember2() {
        return this.config.overridingMember2;
    }

    getMember1() {
        return this.config.member1;
    }

    getMember2() {
        return this.config.member2;
    }
}
abstractConstructors.OverriddenMemberImpact = OverriddenMemberImpact;

class OverriddenParentMemberImpact extends OverriddenMemberImpact {}
abstractConstructors.OverriddenParentMemberImpact = OverriddenParentMemberImpact;

/**
 * An `OverriddenParentMemberAdded` impact is generated on a class member when it overrides
 * a class member of its parent which has been added. This looks like a name collision
 * (a parent class added a member which has the same name as a member of a child class).
 * @atdiff-impact
 */
class OverriddenParentMemberAdded extends OverriddenParentMemberImpact {}
constructors.OverriddenParentMemberAdded = OverriddenParentMemberAdded;

/**
 * An `OverriddenParentMemberRemoved` impact is generated on a class member when it overrides
 * a class member of its parent which has been removed.
 * @atdiff-impact
 */
class OverriddenParentMemberRemoved extends OverriddenParentMemberImpact {}
constructors.OverriddenParentMemberRemoved = OverriddenParentMemberRemoved;

/**
 * An `OverriddenParentMemberSignatureChanged` impact is generated on a class member when it overrides
 * a class member of its parent whose signature has been changed.
 * @atdiff-impact
 */
class OverriddenParentMemberSignatureChanged extends OverriddenParentMemberImpact {}
constructors.OverriddenParentMemberSignatureChanged = OverriddenParentMemberSignatureChanged;

/**
 * An `OverriddenParentMemberSignatureChanged` impact is generated on a class member when it overrides
 * a class member of its parent whose implementation has been changed.
 * @atdiff-impact
 */
class OverriddenParentMemberImplementationChanged extends OverriddenParentMemberImpact {}
constructors.OverriddenParentMemberImplementationChanged = OverriddenParentMemberImplementationChanged;

class OverriddenParentDependencyMemberImpact extends OverriddenMemberImpact {
    getOverridingMember1Name() {
        return this.config.overridingMember1Name;
    }

    getOverridingMember2Name() {
        return this.config.overridingMember2Name;
    }
}
abstractConstructors.OverriddenParentDependencyMemberImpact = OverriddenParentDependencyMemberImpact;

/**
 * An `OverriddenParentDependencyMemberAdded` impact is generated on a class member when it overrides
 * a member of its parent on which a member was added.
 *
 * For example, if template `A` uses a macro library `M` as its `myLib` member, and template `B`, which
 * inherits from `A`, overrides the `myLib` member to use macro library `N`. If `M` has a new macro `myMacro`,
 * an `OverriddenParentDependencyMemberAdded` will be generated on `B.myLib.myMacro`. This can be a breaking
 * change if the macro library `N` does not inherit from `M` and if the new macro is called.
 * @atdiff-impact
 */
class OverriddenParentDependencyMemberAdded extends OverriddenParentDependencyMemberImpact {}
constructors.OverriddenParentDependencyMemberAdded = OverriddenParentDependencyMemberAdded;

/**
 * An `OverriddenParentDependencyMemberRemoved` impact is generated on a class member when it overrides
 * a member of its parent on which a member was removed.
 *
 * For example, if template `A` uses a macro library `M` as its `myLib` member, and template `B`, which
 * inherits from `A`, overrides the `myLib` member to use macro library `N`. If the macro `myMacro` was removed
 * from `M`, an `OverriddenParentDependencyMemberRemoved` will be generated on `B.myLib.myMacro`.
 * @atdiff-impact
 */
class OverriddenParentDependencyMemberRemoved extends OverriddenParentDependencyMemberImpact {}
constructors.OverriddenParentDependencyMemberRemoved = OverriddenParentDependencyMemberRemoved;

/**
 * An `OverriddenParentDependencyMemberSignatureChanged` impact is generated on a class member when it overrides
 * a member of its parent on which the signature of a member changed.
 *
 * For example, if template `A` uses a macro library `M` as its `myLib` member, and template `B`, which
 * inherits from `A`, overrides the `myLib` member to use macro library `N`. If `M` has a macro `myMacro` whose
 * signature changed, an `OverriddenParentDependencyMemberAdded` will be generated on `B.myLib.myMacro`. This can
 * be a breaking change if the signature of `N.myMacro` is not compatible with the new signature of `M.myMacro`.
 * @atdiff-impact
 */
class OverriddenParentDependencyMemberSignatureChanged extends OverriddenParentDependencyMemberImpact {}
constructors.OverriddenParentDependencyMemberSignatureChanged = OverriddenParentDependencyMemberSignatureChanged;

/**
 * An `OverriddenParentDependencyMemberImplementationChanged` impact is generated on a class member when it overrides
 * a member of its parent on which the implementation of a member changed.
 *
 * For example, if template `A` uses a macro library `M` as its `myLib` member, and template `B`, which
 * inherits from `A`, overrides the `myLib` member to use macro library `N`. If `M` has a macro `myMacro` whose
 * implementation changed, an `OverriddenParentDependencyMemberImplementationChanged` will be generated on `B.myLib.myMacro`.
 * @atdiff-impact
 */
class OverriddenParentDependencyMemberImplementationChanged extends OverriddenParentDependencyMemberImpact {}
constructors.OverriddenParentDependencyMemberImplementationChanged = OverriddenParentDependencyMemberImplementationChanged;
