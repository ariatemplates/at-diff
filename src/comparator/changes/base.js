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

    getKey() {
        return `${super.getKey()}|${this.getDependency()}`;
    }
}
constructors.ImpactsInDependency = ImpactsInDependency;
