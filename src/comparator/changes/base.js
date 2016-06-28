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

const constructors = exports.constructors = {};
const abstractConstructors = exports.abstractConstructors = {};

class Serializable {
    constructor(config) {
        this.config = config;
    }

    getType() {
        return this.constructor.type;
    }

    getKey() {
        return this.getType();
    }

    toStoredData(/* serializer */) {
        return {
            type: this.getType(),
            config: this.config
        };
    }

    fromStoredData(/* deserializer, storedData */) {}
}
abstractConstructors.Serializable = Serializable;

class Change extends Serializable {
    getModifiedFile() {
        return this.config.modifiedFile;
    }

    getKey() {
        return `${this.getModifiedFile()}|${super.getKey()}`;
    }
}
abstractConstructors.Change = Change;

class Impact extends Serializable {
    getImpactedFile() {
        return this.config.impactedFile;
    }

    getKey() {
        return `${this.getImpactedFile()}|${super.getKey()}`;
    }

    isPropagatable() {
        return true;
    }

    addCause(cause) {
        this.getCauses().push(cause);
    }

    getCauses() {
        let res = this.causes;
        if (!res) {
            res = this.causes = [];
        }
        return res;
    }

    getRootChanges() {
        if (!this.rootChanges) {
            const rootChanges = this.rootChanges = [];
            this.computeRootChanges(new Set(), rootChanges);
        }
        return this.rootChanges;
    }

    computeRootChanges(visitedObjects, result) {
        this.getCauses().forEach(cause => {
            if (!visitedObjects.has(cause)) {
                visitedObjects.add(cause);
                if (cause instanceof Change) {
                    result.push(cause);
                } else {
                    cause.computeRootChanges(visitedObjects, result);
                }
            }
        });
    }

    toStoredData(serializer) {
        const res = super.toStoredData(serializer);
        res.causes = this.getCauses().map(cause => serializer.store(cause));
        return res;
    }

    fromStoredData(deserializer, storedData) {
        this.causes = storedData.causes.map(causeId => deserializer.restore(causeId));
    }
}
abstractConstructors.Impact = Impact;

/**
 * A `SameFlexibleHashChange` change is generated on a file when the file only contains changes which do not affect its meaning.
 * For example, reformatting the file or adding / removing comments will produce a SameFlexibleHashChange change if there is
 * no other change in the file.
 *
 * This type of change does not cause any impact. It is only generated on Javascript files and Aria Templates templates. It cannot be generated on binary files.
 * @atdiff-change
 */
class SameFlexibleHashChange extends Change {}
constructors.SameFlexibleHashChange = SameFlexibleHashChange;

/**
 * A `FileAdded` change is generated for each new file.
 *
 * This type of change does not cause any impact.
 * @atdiff-change
 */
class FileAdded extends Change {}
constructors.FileAdded = FileAdded;

/**
 * A `FileRemoved` change is generated for each deleted file.
 *
 * This change causes the `UnusableFile` impact on the deleted file and any other file which depends on it.
 * @atdiff-change
 */
class FileRemoved extends Change {}
constructors.FileRemoved = FileRemoved;

/**
 * An `UnusableFile` impact is generated for each deleted file and for each file which directly
 * or indirectly depends on the deleted files.
 *
 * @atdiff-impact
 */
class UnusableFile extends Impact {}
constructors.UnusableFile = UnusableFile;

/**
 * An `UnknownChange` change is generated for each file which changed and for which no comparator is implemented.
 * This includes all binary files, and also the Javascript files which do not contain an Aria Templates definition
 * or which contain an Aria Templates definition for which support is limited (such as `Aria.resourcesDefinition`
 * and `Aria.interfaceDefinition`).
 *
 * This change causes the `UnknownImpact` impact.
 * @atdiff-change
 */
class UnknownChange extends Change {}
constructors.UnknownChange = UnknownChange;

/**
 * A `FileChangedType` change is generated for each file whose type changed.
 *
 * Here are the different types:
 *  * `classDefinition`
 *  * `tplScriptDefinition`
 *  * `beansDefinition`
 *  * `interfaceDefinition`
 *  * `resourcesDefinition`
 *  * `js`
 *  * `template`
 *
 * For example, removing the `Aria.classDefinition` definition from a Javascript file makes
 * it pass from the `classDefinition` specific type to the `js` general type, which generates a
 * `FileChangedType` change.
 *
 * A `FileChangedType` change causes the `UnknownImpact` impact.
 * @atdiff-change
 */
class FileChangedType extends UnknownChange {}
constructors.FileChangedType = FileChangedType;

/**
 * An `UnknownImpact` impact is generated on files for which an `UnknownChange` or a `FileChangedType` change has been generated.
 * @atdiff-impact
 */
class UnknownImpact extends Impact {}
constructors.UnknownImpact = UnknownImpact;

/**
 * An `ImpactsInDependency` impact is generated on files which have a dependency which has one or more impacts
 * when the impact of those impacts on the dependent file is unknown.
 * @atdiff-impact
 */
class ImpactsInDependency extends Impact {
    isPropagatable() {
        return false;
    }

    getDependency() {
        return this.getCauses()[0].getImpactedFile();
    }

    getKey() {
        return `${super.getKey()}|${this.getDependency()}`;
    }
}
constructors.ImpactsInDependency = ImpactsInDependency;
