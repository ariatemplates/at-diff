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

const BaseComparison = require("./types/base");
const compareMaps = require("../utils/compareMaps");
const defaultChangeConstructors = require("./changes");
const defaultComparisonConstructors = Object.assign(Object.create(null), {
    "template": require("./types/template"),
    "classDefinition": require("./types/classDefinition"),
    "tplScriptDefinition": require("./types/tplScriptDefinition")
});
const fileFormat = require("../fileFormat");
const deserializeDiffData = require("./deserializeDiffData");
const Serializer = require("./serializer");
const reverseMap = require("../utils/reverseMap");

function computeReverseDependencies(map) {
    return reverseMap(map, object => Object.keys(object.dependencies));
}

class Comparator {

    constructor (config) {
        config = config || {};
        this.comparisonConstructors = config.comparisonConstructors || defaultComparisonConstructors;
        this.changeConstructors = config.changeConstructors || defaultChangeConstructors;
        this.deterministicOutput = !!config.deterministicOutput;
    }

    createFileComparison(filePath, version1, version2, getFileComparison) {
        const type = (version2 || version1).type;
        const Constructor = this.comparisonConstructors[type] || BaseComparison;
        return new Constructor(filePath, version1, version2, getFileComparison);
    }

    compareFiles(filesInfo1, filesInfo2) {
        filesInfo1 = fileFormat.checkExtractedData(filesInfo1);
        filesInfo2 = fileFormat.checkExtractedData(filesInfo2);
        const map1 = filesInfo1.files;
        const map2 = filesInfo2.files;
        const impactsQueue = [];
        // First phase: compare each file with its previous version, optionally accessing other files to measure the impact:
        const fileComparisonsMap = this._initFileComparisonsMap(map1, map2, impactsQueue);
        // Second phase: once the own impacts in each file are listed, those impacts are forwarded to the files depending on them
        if (impactsQueue.length > 0) {
            this._processImpactsQueue(impactsQueue, computeReverseDependencies(map2), filePath => fileComparisonsMap[filePath]);
        }
        return this._postProcessFileComparisonsMap(fileComparisonsMap);
    }

    _initFileComparisonsMap(map1, map2, impactsQueue) {
        const fileComparisonsMap = Object.create(null);
        const getFileComparison = (filePath) => fileComparisonsMap[filePath];
        compareMaps(map1, map2, (filePath, value1, value2) => {
            fileComparisonsMap[filePath] = this.createFileComparison(filePath, value1, value2, getFileComparison);
        });
        for (let filePath of Object.keys(fileComparisonsMap)) {
            const fileComparison = fileComparisonsMap[filePath];
            fileComparison.compare();
            const impacts = fileComparison.getImpacts();
            impactsQueue.push.apply(impactsQueue, impacts);
        }
        return fileComparisonsMap;
    }

    _postProcessFileComparisonsMap(fileComparisonsMap) {
        const result = fileFormat.createDiffData();
        const serializer = new Serializer({
            deterministicOutput: this.deterministicOutput
        });
        const changes = result.changes = [];
        const impacts = result.impacts = [];
        const addChange = (change) => {
            changes.push(serializer.store(change));
        };
        const addImpact = (impact) => {
            impacts.push(serializer.store(impact));
        };
        Object.keys(fileComparisonsMap).forEach(filePath => {
            const curFile = fileComparisonsMap[filePath];
            curFile.getChanges().forEach(addChange);
            curFile.getImpacts().forEach(addImpact);
        });
        if (this.deterministicOutput) {
            changes.sort();
            impacts.sort();
        }
        result.objects = serializer.getSerializedData();
        return result;
    }

    evaluateImpacts(diffInfo, filesInfo) {
        const diffData = deserializeDiffData(diffInfo, this.changeConstructors);
        filesInfo = fileFormat.checkExtractedData(filesInfo);
        const filesMap = filesInfo.files;
        const impactsQueue = diffData.impacts.filter(impact => impact.isPropagatable());
        const fileComparisonsMap = Object.create(null);
        if (impactsQueue.length > 0) {
            const getFileComparison = filePath => {
                let res = fileComparisonsMap[filePath];
                if (!res) {
                    const fileInfo = filesMap[filePath];
                    if (fileInfo) {
                        res = fileComparisonsMap[filePath] = this.createFileComparison(filePath, fileInfo, fileInfo, getFileComparison);
                    }
                }
                return res;
            };
            this._processImpactsQueue(impactsQueue, computeReverseDependencies(filesMap), getFileComparison);
        }
        return this._postProcessFileComparisonsMap(fileComparisonsMap);
    }

    _processImpactsQueue(impactsQueue, reverseDependencies, getFileComparison) {
        while (impactsQueue.length > 0) {
            const currentImpact = impactsQueue.shift();
            if (! currentImpact.isPropagatable()) {
                continue;
            }
            const dependentFiles = reverseDependencies[currentImpact.getImpactedFile()];
            if (dependentFiles) {
                for (let dependentFile of dependentFiles) {
                    const impacts = getFileComparison(dependentFile).propagateImpact(currentImpact);
                    impactsQueue.push.apply(impactsQueue, impacts);
                }
            }
        }
    }
}

module.exports = Comparator;
