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

const winston = require("winston");
const baseChanges = require("../changes/base").constructors;
const MapOfArraysComparator = require("../mapOfArraysComparator");

class BaseComparison {
    constructor(filePath, version1, version2, getFileComparison) {
        this.filePath = filePath;
        this.version1 = version1;
        this.version2 = version2;
        this.__getFileComparison = getFileComparison;
        this.comparisonDone = false;
        this.changes = []; // description of what changed in this file, this is not influenced by the content of other files
        this.impacts = []; // impacts on this file (caused by changes done on this file or on other files)
        this.warnedDependenciesIssues = Object.create(null);
        this.delayedProcessings = [];
    }

    getDependency(filePath) {
        // do not check that filePath is a dependency, because it could be any transitive dependency!
        return this.__getFileComparison(filePath);
    }

    getDependencyOrWarn(dependency, expectedType) {
        if (dependency) {
            let dependencyComparison = this.getDependency(dependency);
            if (!dependencyComparison) {
                if (!this.warnedDependenciesIssues[dependency]) {
                    winston.warn(`Cannot access ${dependency} which is needed for a correct comparison of ${this.filePath}.`);
                    this.warnedDependenciesIssues[dependency] = true;
                }
            } else if (expectedType && !(dependencyComparison instanceof expectedType)) {
                let warnedDependencyIssues = this.warnedDependenciesIssues[dependency];
                if (!warnedDependencyIssues) {
                    warnedDependencyIssues = this.warnedDependenciesIssues[dependency] = new Set();
                }
                if (!warnedDependencyIssues.has(expectedType)) {
                    warnedDependencyIssues.add(expectedType);
                    winston.error(`${this.filePath} has a dependency on ${dependency}, which has an unexpected comparison type (${dependencyComparison.constructor.name} instead of ${expectedType.name}). Please check that the dependency was successfully parsed and is used correctly.`);
                }
                dependencyComparison = null;
            }
            return dependencyComparison;
        }
    }

    getVersion(versionIndex) {
        if (versionIndex == 1) {
            return this.version1;
        } else if (versionIndex == 2) {
            return this.version2;
        }
        throw new Error(`Invalid version selector: ${versionIndex}`);
    }

    getChanges() {
        return this.changes;
    }

    addChange(changeConstructor, config) {
        const change = new changeConstructor(Object.assign({
            modifiedFile: this.filePath
        }, config));
        this.changes.push(change);
        return change;
    }

    getImpacts() {
        return this.impacts;
    }

    addImpact(impactConstructor, config) {
        const impact = new impactConstructor(Object.assign({
            impactedFile: this.filePath
        }, config));
        this.impacts.push(impact);
        return impact;
    }

    addUniqueImpact(impactConstructor, config, impactTest) {
        return this.impacts.find(existingImpact => {
            if (existingImpact instanceof impactConstructor) {
                return impactTest ? impactTest(existingImpact, config) : true;
            }
        }) || this.addImpact(impactConstructor, config);
    }

    addCause(impact, cause) {
        if (impact) {
            impact.addCause(cause);
        }
    }

    compare() {
        if (!this.comparisonDone) {
            const version1 = this.version1;
            const version2 = this.version2;
            if (version2 && !version1) {
                this.addChange(baseChanges.FileAdded);
            } else if (version1 && !version2) {
                this.addUniqueImpact(baseChanges.UnusableFile).addCause(this.addChange(baseChanges.FileRemoved));
            } else if (!version1 && !version2) {
                // should never happen
                throw new Error("Assertion failed: !version1 && !version2");
            } else if (version1 === version2 || version1.strictHash === version2.strictHash) {
                // nothing changed
            } else if (version1.flexibleHash && version1.flexibleHash === version2.flexibleHash) {
                this.addChange(baseChanges.SameFlexibleHashChange);
            } else if (version1.type !== version2.type) {
                this.compareDifferentTypes();
            } else {
                this.compareSameType();
            }
            this.runDelayedProcessings();
            this.comparisonDone = true;
        }
    }

    compareDifferentTypes() {
        this.addUniqueImpact(baseChanges.UnknownImpact).addCause(this.addChange(baseChanges.FileChangedType));
    }

    compareSameType() {
        this.addUniqueImpact(baseChanges.UnknownImpact).addCause(this.addChange(baseChanges.UnknownChange));
    }

    propagateImpact(impact) {
        const initialLength = this.impacts.length;
        this.processIncomingImpact(impact);
        this.runDelayedProcessings();
        return this.impacts.slice(initialLength);
    }

    getCommonDependencyUsages(dependencyFilePath) {
        if (!this.dependenciesComparator) {
            this.dependenciesComparator = new MapOfArraysComparator(this, version => version.dependencies, usage => `${usage.type}:${usage.hash}`);
        }
        return this.dependenciesComparator.getCommonValues(dependencyFilePath);
    }

    processIncomingImpact(impact) {
        const impactedFile = impact.getImpactedFile();
        const dependencyUsages = this.getCommonDependencyUsages(impactedFile);
        if (dependencyUsages) {
            if (impact instanceof baseChanges.UnusableFile) {
                // a dependency is unusable, so this file is unusable as well
                this.addUniqueImpact(baseChanges.UnusableFile).addCause(impact);
            } else if (dependencyUsages.length === 0) {
                // when the usage of the dependency is unknown, adds an ImpactsInDependency impact
                this.addUniqueImpact(baseChanges.ImpactsInDependency, null, (existingImpact) => impactedFile === existingImpact.getDependency()).addCause(impact);
            } else {
                dependencyUsages.forEach(usage => {
                    const type = usage.type;
                    const key = `processImpactFrom${type[0].toUpperCase()}${type.slice(1)}`;
                    const fn = this[key];
                    if (fn) {
                        fn.call(this, impact, usage);
                    }
                });
            }
        }
    }

    runDelayedProcessings() {
        const delayedProcessings = this.delayedProcessings;
        while (delayedProcessings.length > 0) {
            const processing = delayedProcessings.shift();
            processing();
        }
    }

}

module.exports = BaseComparison;
