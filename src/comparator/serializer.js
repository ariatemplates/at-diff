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

const createDefaultGenerateId = () => {
    let counter = 0;
    return () => {
        counter++;
        return counter.toString(36);
    };
};

const returnGetKey = object => object.getKey();

class Serializer {
    constructor(config) {
        config = config || {};
        this._generateId = config.deterministicOutput ? returnGetKey : createDefaultGenerateId();
        this._ids = new Map();
        this._data = Object.create(null);
    }

    store(object) {
        let id = this._ids.get(object);
        if (!id) {
            id = this._generateId(object);
            if (this._data[id]) {
                throw new Error(`Duplicate id: ${id}.`);
            }
            this._ids.set(object, id);
            this._data[id] = object.toStoredData(this);
        }
        return id;
    }

    getSerializedData() {
        return this._data;
    }
}

module.exports = Serializer;
