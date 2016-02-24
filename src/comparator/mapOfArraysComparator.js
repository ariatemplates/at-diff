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

const compareMaps = require("../utils/compareMaps");
const emptyObject = {};

class MapOfArraysComparator {
    constructor(fileComparison, mapGetter, arrayItemHashGetter) {
        this.fileComparison = fileComparison;
        this.mapGetter = mapGetter;
        this.arrayItemHashGetter = arrayItemHashGetter;
    }

    _compareMaps() {
        let commonParts = this.commonParts;
        if (!commonParts) {
            const fileComparison = this.fileComparison;
            const mapGetter = this.mapGetter;
            const version1 = fileComparison.version1;
            const version2 = fileComparison.version2;
            if (version1 && version2) {
                if (version1 === version2 ||
                    version1.strictHash === version2.strictHash ||
                    version1.flexibleHash === version2.flexibleHash) {
                    commonParts = mapGetter(version2) || emptyObject;
                } else {
                    const arrayItemHashGetter = this.arrayItemHashGetter;
                    commonParts = {};
                    compareMaps(mapGetter(version1), mapGetter(version2), (key, array1, array2) => {
                        if (array1 && array2) {
                            const curCommonArray = commonParts[key] = [];
                            const comparisonMap = {};
                            array1.forEach(arrayItem => {
                                const hash = arrayItemHashGetter(arrayItem);
                                if (!comparisonMap[hash]) {
                                    comparisonMap[hash] = 0;
                                }
                                comparisonMap[hash]++;
                            });
                            array2.forEach(arrayItem => {
                                const hash = arrayItemHashGetter(arrayItem);
                                if (comparisonMap[hash] > 0) {
                                    curCommonArray.push(arrayItem);
                                    comparisonMap[hash]--;
                                }
                            });
                        }
                    });
                }
            } else {
                commonParts = emptyObject;
            }
            this.commonParts = commonParts;
        }
        return commonParts;
    }

    getCommonValues(key) {
        const commonParts = this._compareMaps();
        const values = commonParts[key];
        if (Array.isArray(values)) {
            return values;
        }
    }

    forEachCommonValue(keyFilter, fn) {
        const commonParts = this._compareMaps();
        const keys = Object.keys(commonParts).filter(keyFilter);
        keys.forEach(key => {
            commonParts[key].forEach(value => {
                fn(key, value);
            });
        });
    }
}
module.exports = MapOfArraysComparator;
