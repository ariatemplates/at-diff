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
 * A `BeanChange` change is generated when a bean is directly modified
 * (the bean may have been added, removed, or one of its attribute may have changed).
 *
 * Depending on the type of change, and on the inherited attributes from the parent, a `BeanChange` change
 * can generate different kinds of impacts, including `BeanAdded`, `BeanRemoved` and `BeanAttributeChanged`.
 * @atdiff-change
 */
class BeanChange extends baseChanges.abstractConstructors.Change {
    getBeanName() {
        return this.config.beanName;
    }
    getKey() {
        return `${super.getKey()}|${this.getBeanName()}`;
    }
    getBean1() {
        return this.config.bean1;
    }
    getBean2() {
        return this.config.bean2;
    }
}
constructors.BeanChange = BeanChange;

class BeanImpact extends baseChanges.abstractConstructors.Impact {
    getBeanName() {
        return this.config.beanName;
    }
    getKey() {
        return `${super.getKey()}|${this.getBeanName()}`;
    }
    getBean1() {
        return this.config.bean1;
    }
    getBean2() {
        return this.config.bean2;
    }
    getUserBeanName() {
        return this.config.userBeanName || this.getBeanName();
    }
    findBeanRecursion(filePath, userBeanName) {
        if (this.getImpactedFile() === filePath && this.getUserBeanName() === userBeanName) {
            return true;
        }
        return this.getCauses().some(cause => cause instanceof BeanImpact && cause.findBeanRecursion(filePath, userBeanName));
    }
}
abstractConstructors.BeanImpact = BeanImpact;

/**
 * A `BeanAdded` impact is generated when a bean has been added.
 * @atdiff-impact
 */
class BeanAdded extends BeanImpact {}
constructors.BeanAdded = BeanAdded;

/**
 * A `BeanRemoved` impact is generated when a bean has been removed.
 * @atdiff-impact
 */
class BeanRemoved extends BeanImpact {}
constructors.BeanRemoved = BeanRemoved;

/**
 * An `InheritFromDifferentBean` impact is generated when the direct parent of a bean changed.
 *
 * For example, suppose that bean `C` extends bean `B` which extends bean `A`, and bean `A` has
 * a `myProperty` property which is not overridden in `B`. The direct parent of `C.myProperty` is
 * `A.myProperty`. Now, if in a new version, `myProperty` is overridden in `B`, then the direct parent of
 * `C.myProperty` becomes `B.myProperty`. This generates an `InheritFromDifferentBean` impact on `C.myProperty`.
 * @atdiff-impact
 */
class InheritFromDifferentBean extends BeanImpact {}
constructors.InheritFromDifferentBean = InheritFromDifferentBean;

/**
 * A `BeanAttributeChanged` impact is generated when an attribute of a bean has been modified.
 * @atdiff-impact
 */
class BeanAttributeChanged extends BeanImpact {
    getAttributeName() {
        return this.config.attributeName;
    }
    getKey() {
        return `${super.getKey()}|${this.getAttributeName()}`;
    }
    getAttributeValue1() {
        return this.config.value1;
    }
    getAttributeValue2() {
        return this.config.value2;
    }
    isPropagatable() {
        // the type attribute cannot be inherited directly (even if it has an impact on inheritance)
        return this.getAttributeName() !== "$type";
    }
}
constructors.BeanAttributeChanged = BeanAttributeChanged;

class SpecialBeanImpact extends baseChanges.abstractConstructors.Impact {
    getBeanName() {
        return this.config.beanName;
    }
    getKey() {
        return `${super.getKey()}|${this.getBeanName()}`;
    }
    isPropagatable() {
        return false;
    }
}
abstractConstructors.SpecialBeanImpact = SpecialBeanImpact;

/**
 * The `RemovedBeanStillUsed` impact is generated when it is detected that a bean which has been removed is still used.
 * @atdiff-impact
 */
class RemovedBeanStillUsed extends SpecialBeanImpact {}
constructors.RemovedBeanStillUsed = RemovedBeanStillUsed;

/**
 * The `AddedBeanAlreadyOverridden` impact is generated when it is detected that a bean which has just been added is
 * already overridden. This is a name collision.
 *
 * This is usually a breaking change, as the overriding bean cannot inherit from the new bean (because, as it is new,
 * it cannot already know it).
 * @atdiff-impact
 */
class AddedBeanAlreadyOverridden extends SpecialBeanImpact {}
constructors.AddedBeanAlreadyOverridden = AddedBeanAlreadyOverridden;

/**
 * The `OverridingChangingBean` impact is generated on a bean when it overrides a bean that
 * has an `InheritFromDifferentBean` impact.
 * This can be a breaking change if the overriding bean does not inherit from the new direct parent.
 * @atdiff-impact
 */
class OverridingChangingBean extends SpecialBeanImpact {}
constructors.OverridingChangingBean = OverridingChangingBean;

/**
 * The `OverriddenParentBeanAttributeChanged` impact is generated on a bean which overrides an attribute of
 * its parent, if that attribute changed in the parent.
 * @atdiff-impact
 */
class OverriddenParentBeanAttributeChanged extends SpecialBeanImpact {
    getAttributeName() {
        return this.config.attributeName;
    }
    getKey() {
        return `${super.getKey()}|${this.getAttributeName()}`;
    }
    getAttributeValue1() {
        return this.config.value1;
    }
    getAttributeValue2() {
        return this.config.value2;
    }
}
constructors.OverriddenParentBeanAttributeChanged = OverriddenParentBeanAttributeChanged;
