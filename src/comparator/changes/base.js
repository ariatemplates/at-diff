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

const idPrefix = `${Date.now().toString(36)}`;
let counter = 0;
function createId() {
    counter++;
    return `${idPrefix}-${counter.toString(36)}`;
}

class Serializable {
    constructor(config) {
        this.config = config;
    }

    setId(id) {
        this.id = id;
    }

    getId() {
        let res = this.id;
        if (!res) {
            res = this.id = createId();
        }
        return res;
    }

    getType() {
        return this.constructor.type;
    }

    store(objectsMap) {
        const id = this.getId();
        const alreadyStored = objectsMap[id];
        if (alreadyStored) {
            if (alreadyStored !== this) {
                throw new Error(`Id conflict for ${id}`);
            }
            return false;
        }
        objectsMap[id] = this;
        return true;
    }

    restore() {}

    toJSON() {
        return {
            type: this.getType(),
            config: this.config
        };
    }
}
abstractConstructors.Serializable = Serializable;

class Change extends Serializable {
    getModifiedFile() {
        return this.config.modifiedFile;
    }
}
abstractConstructors.Change = Change;

class Impact extends Serializable {
    getImpactedFile() {
        return this.config.impactedFile;
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
            this.computeRootChanges({}, rootChanges);
        }
        return this.rootChanges;
    }

    computeRootChanges(visitedObjects, result) {
        this.getCauses().forEach(cause => {
            const changeId = cause.getId();
            if (!visitedObjects[changeId]) {
                visitedObjects[changeId] = true;
                if (cause instanceof Change) {
                    result.push(cause);
                } else {
                    cause.computeRootChanges(visitedObjects, result);
                }
            }
        });
    }

    store(objectsMap) {
        if (super.store(objectsMap)) {
            this.getCauses().map(cause => cause.store(objectsMap));
        }
    }

    restore(objectsMap, storedData) {
        this.causes = storedData.causes.map(causeId => objectsMap[causeId]);
    }

    toJSON() {
        const res = super.toJSON();
        res.causes = this.getCauses().map(cause => cause.getId());
        return res;
    }
}
abstractConstructors.Impact = Impact;

class SameFlexibleHashChange extends Change {}
constructors.SameFlexibleHashChange = SameFlexibleHashChange;

class FileAdded extends Change {}
constructors.FileAdded = FileAdded;

class FileRemoved extends Change {}
constructors.FileRemoved = FileRemoved;

class UnusableFile extends Impact {}
constructors.UnusableFile = UnusableFile;

class UnknownChange extends Change {}
constructors.UnknownChange = UnknownChange;

class FileChangedType extends UnknownChange {}
constructors.FileChangedType = FileChangedType;

class UnknownImpact extends Impact {}
constructors.UnknownImpact = UnknownImpact;

class ImpactsInDependency extends Impact {
    isPropagatable() {
        return false;
    }

    getDependency() {
        return this.getCauses()[0].getImpactedFile();
    }
}
constructors.ImpactsInDependency = ImpactsInDependency;
