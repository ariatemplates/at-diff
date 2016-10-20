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
const compareMaps = require("../../utils/compareMaps");
const sortAndRemoveDuplicates = require("../../utils/sortAndRemoveDuplicates");
const compareSortedArrays = require("../../utils/compareSortedArrays");
const mapObject = require("../../utils/mapObject");
const MapOfArraysComparator = require("../mapOfArraysComparator");
const beanChanges = require("../changes/bean");

const emptyFunction = () => {};

const buildBeanName = (prefix, lastPart) => prefix ? `${prefix}.${lastPart}` : lastPart;
const splitBeanName = (fullName) => {
    const lastDot = fullName.lastIndexOf(".");
    return lastDot > -1 ? {
        prefix: fullName.slice(0, lastDot),
        lastPart: fullName.slice(lastDot + 1)
    } : null ;
};

class BeansComparison extends BaseComparison {
    compareSameType() {
        this.compareAllBeans();
    }

    getOwnBeans(versionIndex) {
        let res = this[`beans${versionIndex}`];
        if (!res) {
            const filePath = this.filePath;
            res = this[`beans${versionIndex}`] = mapObject(this.getVersion(versionIndex).content.beans, (bean, beanName) => ({
                filePath: filePath,
                beanName: beanName,
                bean: bean
            }));
        }
        return res;
    }

    getDirectBean(versionIndex, beanName) {
        const beans = this.getOwnBeans(versionIndex);
        return beans[beanName];
    }

    getOwnBean(versionIndex, beanName) {
        let curBean = this.getDirectBean(versionIndex, beanName);
        if (!curBean) {
            const splitInfo = splitBeanName(beanName);
            if (splitInfo) {
                const containerBean = this.getOwnBean(versionIndex, splitInfo.prefix);
                if (containerBean) {
                    curBean = this.getBeanMember(versionIndex, containerBean, splitInfo.lastPart);
                }
            }
        }
        return curBean;
    }

    getBean(versionIndex, filePath, beanName) {
        if (filePath === this.filePath) {
            return this.getOwnBean(versionIndex, beanName);
        } else {
            const dependency = this.getDependencyOrWarn(filePath, BeansComparison);
            return dependency ? dependency.getOwnBean(versionIndex, beanName) : null;
        }
    }

    findFirstMatchingAncestor(versionIndex, bean, fn) {
        const res = fn(bean);
        if (!res) {
            const parentBean = this.getParentBean(versionIndex, bean);
            if (parentBean) {
                this.findFirstMatchingAncestor(versionIndex, parentBean, fn);
            }
        }
    }

    getBeanAttribute(versionIndex, bean, attributeName) {
        let res;
        this.findFirstMatchingAncestor(versionIndex, bean, (curBean) => {
            res = curBean.bean.attributes[attributeName];
            if (res !== undefined) {
                return true;
            }
        });
        return res;
    }

    getFullBeanInfo(versionIndex, bean) {
        const res = {
            attributes: {}
        };
        this.findFirstMatchingAncestor(versionIndex, bean, (curBean) => {
            if (curBean.bean.$properties) {
                if (!res.$properties) {
                    res.$properties = curBean.bean.$properties;
                } else {
                    res.$properties = sortAndRemoveDuplicates(res.$properties.concat(curBean.bean.$properties));
                }
            }
            if (curBean.bean.$contentTypes && !res.$contentTypes) {
                res.$contentTypes = curBean.bean.$contentTypes;
            }
            if (curBean.bean.$contentType && !res.$contentType) {
                res.$contentType = curBean.bean.$contentType;
            }
            if (curBean.bean.$keyType && res.$keyType) {
                res.$keyType = curBean.bean.$keyType;
            }
            Object.keys(curBean.bean.attributes).forEach((key) => {
                if (res.attributes[key] === undefined) {
                    res.attributes[key] = curBean.bean.attributes[key];
                }
            });
        });
        return {
            bean: res,
            beanName: bean.beanName,
            filePath: bean.filePath
        };
    }

    getParentBean(versionIndex, bean) {
        const type = this.readBeanName(bean.bean.attributes.$type);
        return this.getBean(versionIndex, type.filePath, type.beanName);
    }

    getBeanMember(versionIndex, bean, lastPart) {
        if (bean.filePath === this.filePath) {
            return this.getOwnBeanMember(versionIndex, bean, lastPart);
        } else {
            const dependency = this.getDependencyOrWarn(bean.filePath, BeansComparison);
            return dependency ? dependency.getOwnBeanMember(versionIndex, bean, lastPart) : null;
        }
    }

    getOwnBeanMember(versionIndex, bean, lastPart) {
        const memberBeanName = buildBeanName(bean.beanName, lastPart);
        let memberBean = this.getDirectBean(versionIndex, memberBeanName);
        if (!memberBean && !bean.bean.$contentTypes) {
            const parentBean = this.getParentBean(versionIndex, bean);
            if (parentBean === bean) {
                // parentBean === bean happens for root beans
                // other beans should not be recursive
                // TODO: add a better check for recursive beans
                return;
            }
            if (parentBean) {
                memberBean = this.getBeanMember(versionIndex, parentBean, lastPart);
            }
        }
        return memberBean;
    }

    readBeanName(beanName) {
        const colon = beanName.indexOf(":");
        return colon > -1 ? {
            filePath: beanName.slice(0, colon),
            beanName: beanName.slice(colon + 1)
        } : {
            filePath: this.filePath,
            beanName: beanName
        };
    }

    getBeanChangeInfo(beanName) {
        let beanChangeInfo = this.beanChangeInfo;
        if (!beanChangeInfo) {
            beanChangeInfo = this.beanChangeInfo = Object.create(null);
        }
        if (beanName) {
            let info = beanChangeInfo[beanName];
            if (!info) {
                info = beanChangeInfo[beanName] = {};
            }
            return info;
        } else {
            return beanChangeInfo;
        }
    }

    addBeanImpact(impactType, beanName, config) {
        config = Object.assign({
            beanName: beanName
        }, config);

        const beanChangeInfo = this.getBeanChangeInfo(beanName);
        const beanChangeInfoKey = impactType === beanChanges.constructors.BeanAttributeChanged ? config.attributeName : "";
        if (beanChangeInfo[beanChangeInfoKey]) {
            throw new Error(`Assertion failed: in ${this.filePath} ${beanName} already has an impact for ${beanChangeInfoKey}: ${beanChangeInfo[beanChangeInfoKey].constructor.type}`);
        }
        const impact = beanChangeInfo[beanChangeInfoKey] = this.addImpact(impactType, config);
        if (impact.isPropagatable()) {
            this.delayedProcessings.push(() => {
                this.processBeanUsages(impact);
            });
        }
        return impact;
    }

    processBeanUsages(impact) {
        if (!(impact instanceof beanChanges.abstractConstructors.BeanImpact)) {
            return;
        }
        const impactedFile = impact.getImpactedFile();
        const beanName = impact.getBeanName();
        const isAttributeChange = impact instanceof beanChanges.constructors.BeanAttributeChanged;
        const isBeanAdded = impact instanceof beanChanges.constructors.BeanAdded;
        const isBeanRemoved = impact instanceof beanChanges.constructors.BeanRemoved;
        const isInheritFromDifferentBean = impact instanceof beanChanges.constructors.InheritFromDifferentBean;
        if (isBeanRemoved) {
            this.forEachCommonBeanMemberUsage(impactedFile, beanName, (userBeanName) => {
                this.addBeanImpact(beanChanges.constructors.RemovedBeanStillUsed, userBeanName).addCause(impact);
            });
        }
        const usages = this.getCommonBeanUsages(impactedFile, beanName);
        usages.forEach(usage => {
            if (impact.findBeanRecursion(this.filePath, usage.userBeanName)) {
                return;
            }
            if (usage.overridden) {
                if (isBeanAdded) {
                    this.addBeanImpact(beanChanges.constructors.AddedBeanAlreadyOverridden, usage.beanName).addCause(impact);
                } else if (isInheritFromDifferentBean) {
                    this.addBeanImpact(beanChanges.constructors.OverridingChangingBean, usage.beanName).addCause(impact);
                }
                // if isBeanRemoved, it means that the bean was overridden,
                // but that also means it was also extended (this is mandatory for things to work)
                return;
            }
            const beanChangeInfo = this.getBeanChangeInfo(usage.beanName);

            const beanChangeInfoKey = isAttributeChange ? impact.getAttributeName() : "";
            if (beanChangeInfo[beanChangeInfoKey]) {
                return;
            }
            if (isAttributeChange) {
                const attributeName = impact.getAttributeName();
                const attributeInheritedIn1 = (!usage.bean1 || usage.bean1.attributes[attributeName] === undefined);
                const attributeInheritedIn2 = (!usage.bean2 || usage.bean2.attributes[attributeName] === undefined);
                const attributeInheritedInBoth = attributeInheritedIn1 && attributeInheritedIn2;
                const attributeOverriddenInBoth = !attributeInheritedIn1 && !attributeInheritedIn2;
                if (attributeInheritedInBoth || attributeOverriddenInBoth) {
                    this.addBeanImpact(attributeInheritedInBoth ? impact.constructor : beanChanges.constructors.OverriddenParentBeanAttributeChanged, usage.beanName, {
                        attributeName: attributeName,
                        value1: impact.getAttributeValue1(),
                        value2: impact.getAttributeValue2(),
                        userBeanName: usage.userBeanName
                    }).addCause(impact);
                }
            } else if (isBeanAdded || isBeanRemoved || isInheritFromDifferentBean) {
                if (usage.userBeanName === usage.beanName) {
                    if (isBeanRemoved) {
                        this.addBeanImpact(beanChanges.constructors.RemovedBeanStillUsed, usage.beanName).addCause(impact);
                    }
                    // if isBeanAdded, it means that a new bean was already used (even if it did not exist!!)
                } else {
                    this.addBeanImpact(impact.constructor, usage.beanName, {
                        bean1: impact.getBean1(),
                        bean2: impact.getBean2(),
                        userBeanName: usage.userBeanName
                    }).addCause(impact);
                }
            }
        });
    }

    compareBeanMember(beanName, nameInBean, in1, in2, cause) {
        const memberBeanName = buildBeanName(beanName, nameInBean);
        const directBean1 = in1 ? this.getDirectBean(1, memberBeanName) : null;
        const directBean2 = in2 ? this.getDirectBean(2, memberBeanName) : null;
        if (directBean1 || directBean2) {
            // changes to such beans are already processed by compareAllBeans
            return;
        }
        const bean1 = in1 ? this.getOwnBean(1, memberBeanName) : null;
        const bean2 = in2 ? this.getOwnBean(2, memberBeanName) : null;
        this.compareBean(memberBeanName, bean1, bean2, cause);
    }

    compareFullBeans(beanName, bean1, bean2, cause) {
        // Compare content:
        this.compareBeanMember(beanName, "$keyType", bean1.$keyType, bean2.$keyType, cause);
        this.compareBeanMember(beanName, "$contentType", bean1.$contentType, bean2.$contentType, cause);
        compareSortedArrays(bean1.bean.$properties || [], bean2.bean.$properties || [], (nameInBean, in1, in2) => {
            this.compareBeanMember(beanName, nameInBean, in1, in2, cause);
        });
        compareSortedArrays(bean1.bean.$contentTypes || [], bean2.bean.$contentTypes || [], (nameInBean, in1, in2) => {
            this.compareBeanMember(beanName, nameInBean, in1, in2, cause);
        });
        this.compareAttributes(beanName, bean1, bean2, cause, emptyFunction);
    }

    compareAttributes(beanName, bean1, bean2, cause, getBeanAttribute) {
        compareMaps(bean1.bean.attributes, bean2.bean.attributes, (attributeName, value1, value2) => {
            if (value1 !== value2) {
                value1 = value1 === undefined ? getBeanAttribute.call(this, 1, bean1, attributeName) : value1;
                value2 = value2 === undefined ? getBeanAttribute.call(this, 2, bean2, attributeName) : value2;
                if (value1 !== value2) {
                    this.addBeanImpact(beanChanges.constructors.BeanAttributeChanged, beanName, {
                        attributeName: attributeName,
                        value1: value1,
                        value2: value2
                    }).addCause(cause);
                }
            }
        });
    }

    compareAllBeans() {
        let ignoreBeansPrefix;
        compareMaps(this.getOwnBeans(1), this.getOwnBeans(2), (beanName, directBean1, directBean2) => {
            if (!directBean1 || !directBean2 || directBean1.bean.hash !== directBean2.bean.hash) {
                const bean1 = directBean1 || this.getOwnBean(1, beanName);
                const bean2 = directBean2 || this.getOwnBean(2, beanName);
                if ((bean1 && !bean2) || (!bean1 && bean2)) {
                    // if a bean is added or removed and has other beans inside it
                    // we only generate changes and impacts for the container and not for each bean inside it
                    if (ignoreBeansPrefix && beanName.startsWith(ignoreBeansPrefix)) {
                        return;
                    }
                    ignoreBeansPrefix = `${beanName}.`;
                }
                const change = this.addChange(beanChanges.constructors.BeanChange, {
                    beanName: beanName,
                    bean1: directBean1 ? directBean1.bean : null,
                    bean2: directBean2 ? directBean2.bean : null
                });
                this.compareBean(beanName, bean1, bean2, change);
            }
        });
    }

    compareBean(beanName, bean1, bean2, cause) {
        if (bean1 && !bean2) {
            this.addBeanImpact(beanChanges.constructors.BeanRemoved, beanName, {
                bean1: bean1,
                bean2: bean2
            }).addCause(cause);
        } else if (!bean1 && bean2) {
            this.addBeanImpact(beanChanges.constructors.BeanAdded, beanName, {
                bean1: bean1,
                bean2: bean2
            }).addCause(cause);
        } else if (bean1 && bean2) {
            if (bean1.filePath !== bean2.filePath || bean1.beanName !== bean2.beanName) {
                this.addBeanImpact(beanChanges.constructors.InheritFromDifferentBean, beanName, {
                    bean1: bean1,
                    bean2: bean2
                }).addCause(cause);
            }
            if (bean1.bean.hash !== bean2.bean.hash) {
                if (bean1.bean.attributes.$type !== bean2.bean.attributes.$type) {
                    this.compareFullBeans(beanName, this.getFullBeanInfo(1, bean1), this.getFullBeanInfo(2, bean2), cause);
                } else {
                    this.compareAttributes(beanName, bean1, bean2, cause, this.getBeanAttribute);
                }
            }
        }
    }

    processImpactFromNamespace(impact) {
        this.processBeanUsages(impact);
    }

    getBeanUsagesComparator(filePath) {
        const comparatorKey = `namespace-comparator-${filePath}`;
        let comparator = this[comparatorKey];
        if (!comparator) {
            comparator = this[comparatorKey] = new MapOfArraysComparator(
                this,
                filePath === this.filePath ? version => version.content.beansUsages : version => version.content.namespacesUsages[filePath],
                item => item
            );
        }
        return comparator;
    }

    forEachCommonBeanMemberUsage (filePath, beanName, fn) {
        const prefix = `${beanName}.`;
        const comparator = this.getBeanUsagesComparator(filePath);
        comparator.forEachCommonValue((beanName) => beanName.startsWith(prefix), fn);
    }

    getCommonBeanUsages (filePath, beanName) {
        const beanUsagesKey = `bean-usages-${filePath}:${beanName}`;
        let result = this[beanUsagesKey];
        if (!result) {
            result = this[beanUsagesKey] = [];
            const comparator = this.getBeanUsagesComparator(filePath);
            const ownUsages = comparator.getCommonValues(beanName);
            if (ownUsages) {
                ownUsages.forEach(userBeanName => {
                    result.push({
                        beanName: userBeanName,
                        userBeanName: userBeanName,
                        bean1: this.getDirectBean(1, userBeanName).bean,
                        bean2: this.getDirectBean(2, userBeanName).bean,
                        overridden: false
                    });
                });
            }

            const splitInfo = splitBeanName(beanName);
            if (splitInfo) {
                const lastPart = splitInfo.lastPart;
                this.getCommonBeanUsages(filePath, splitInfo.prefix).forEach(usage => {
                    if (usage.overridden || (usage.bean1 && usage.bean1.$contentTypes || usage.bean2 && usage.bean2.$contentTypes)) {
                        // if the member is overridden, it is not useful to go further
                        // if $contentTypes is specified, the inheritance is not applied for any $contentTypes defined in the parent
                        return;
                    }
                    const usageBeanName = buildBeanName(usage.beanName, lastPart);
                    const bean1 = this.getDirectBean(1, usageBeanName);
                    const bean2 = this.getDirectBean(2, usageBeanName);
                    result.push({
                        beanName: usageBeanName,
                        userBeanName: usage.userBeanName,
                        overridden: !!(bean1 || bean2)
                    });
                });
            }
        }
        return result;
    }

}

module.exports = BeansComparison;
