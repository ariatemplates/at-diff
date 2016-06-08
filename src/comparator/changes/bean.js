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

class BeanAdded extends BeanImpact {}
constructors.BeanAdded = BeanAdded;

class BeanRemoved extends BeanImpact {}
constructors.BeanRemoved = BeanRemoved;

class InheritFromDifferentBean extends BeanImpact {}
constructors.InheritFromDifferentBean = InheritFromDifferentBean;

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

class RemovedBeanStillUsed extends SpecialBeanImpact {}
constructors.RemovedBeanStillUsed = RemovedBeanStillUsed;

class AddedBeanAlreadyOverridden extends SpecialBeanImpact {}
constructors.AddedBeanAlreadyOverridden = AddedBeanAlreadyOverridden;

class OverridingChangingBean extends SpecialBeanImpact {}
constructors.OverridingChangingBean = OverridingChangingBean;

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
