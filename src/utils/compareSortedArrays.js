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

module.exports = function (array1, array2, compareFn, sortFn) {
    if (!sortFn) {
        sortFn = defaultSortFn;
    }
    const length1 = array1.length;
    const length2 = array2.length;
    for (let i1 = 0, i2 = 0, hasValue1, hasValue2, value1, value2, valueDiff, isValue1, isValue2, value;

        hasValue1 = i1 < length1, hasValue2 = i2 < length2,
        value1 = hasValue1 ? array1[i1] : null,
        value2 = hasValue2 ? array2[i2] : null,
        valueDiff = hasValue1 ? hasValue2 ? sortFn(value1, value2) : -1 : 1,
        isValue1 = valueDiff <= 0, isValue2 = valueDiff >= 0,
        value = isValue1 ? value1 : value2,
        hasValue1 || hasValue2;

        isValue1 ? i1++ : null,
        isValue2 ? i2++ : null
    ) {
        compareFn(value, isValue1, isValue2);
    }
};
