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
const deserializeDiffData = require("./deserializeDiffData");
const Serializer = require("./serializer");
const createFilter = require("./createFilter");

module.exports = function (config, diffInfo) {
    if (!diffInfo) {
        diffInfo = config;
        config = {};
    }
    const diffData = deserializeDiffData(diffInfo, config.changeConstructors);
    const serializer = new Serializer({
        deterministicOutput: !!config.deterministicOutput
    });
    const filter = createFilter(config);
    const result = fileFormat.createDiffData();
    const changes = result.changes = [];
    const impacts = result.impacts = [];
    diffData.changes.forEach(change => {
        if (filter.isChangeIncluded(change)) {
            changes.push(serializer.store(change));
        }
    });
    diffData.impacts.forEach(impact => {
        if (filter.isImpactIncluded(impact)) {
            impacts.push(serializer.store(impact));
        }
    });
    if (config.deterministicOutput) {
        result.changes.sort();
        result.impacts.sort();
    }
    result.objects = serializer.getSerializedData();
    return result;
};
