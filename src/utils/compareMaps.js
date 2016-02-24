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

const defaultSortFn = require("./defaultSortFn");
const emptyArray = [];

module.exports = function (map1, map2, compareFn, keySortFn) {
    if (!keySortFn) {
        keySortFn = defaultSortFn;
    }
    const keys1 = map1 ? Object.keys(map1).sort(keySortFn) : emptyArray;
    const keys2 = map2 ? Object.keys(map2).sort(keySortFn) : emptyArray;
    const length1 = keys1.length;
    const length2 = keys2.length;
    for (let i1 = 0, i2 = 0, hasKey1, hasKey2, key1, key2, keyDiff, isKey1, isKey2, key;

        hasKey1 = i1 < length1, hasKey2 = i2 < length2,
        key1 = hasKey1 ? keys1[i1] : null,
        key2 = hasKey2 ? keys2[i2] : null,
        keyDiff = hasKey1 ? hasKey2 ? keySortFn(key1, key2) : -1 : 1,
        isKey1 = keyDiff <= 0, isKey2 = keyDiff >= 0,
        key = isKey1 ? key1 : key2,
        hasKey1 || hasKey2;

        isKey1 ? i1++ : null,
        isKey2 ? i2++ : null
    ) {
        compareFn(key, isKey1 ? map1[key1] : null, isKey2 ? map2[key2] : null);
    }
};
