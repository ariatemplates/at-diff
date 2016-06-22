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

const fileFormat = require("../fileFormat");
const Deserializer = require("./deserializer");

module.exports = function (data, changeConstructors) {
    data = fileFormat.checkDiffData(data);
    const deserializer = new Deserializer(data.objects, changeConstructors);
    return {
        impacts: data.impacts.map(id => deserializer.restore(id)),
        changes: data.changes.map(id => deserializer.restore(id))
    };
};
