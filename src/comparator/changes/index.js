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

const defaultConstructors = exports.defaultConstructors = Object.assign({}, require("./base").constructors, require("./baseClass").constructors, require("./template").constructors);

// set the type property on each constructor:
Object.keys(defaultConstructors).forEach(type => defaultConstructors[type].type = type);

exports.serialize = function (map) {
    return JSON.parse(JSON.stringify(map));
};

exports.deserialize = function (map, constructors) {
    if (!constructors) {
        constructors = defaultConstructors;
    }
    const keys = Object.keys(map);
    const result = {};
    // first pass: create each object
    for (let key of keys) {
        const storedData = map[key];
        const instance = result[key] = new constructors[storedData.type](storedData.config);
        instance.setId(key);
    }
    // second pass: restore links between objects:
    for (let key of keys) {
        result[key].restore(result, map[key]);
    }
    return result;
};
