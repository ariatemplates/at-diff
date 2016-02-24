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

const VERSION = exports.VERSION = "0.1";
const TYPE_EXTRACTED_DATA = exports.TYPE_EXTRACTED_DATA = "at-diff:extracted-data";
const TYPE_DIFF_DATA = exports.TYPE_DIFF_DATA = "at-diff:diff-data";

exports.checkExtractedData = function (data) {
    if (data.type !== TYPE_EXTRACTED_DATA) {
        throw new Error(`Unexpected data type: ${data.type} (expected: ${TYPE_EXTRACTED_DATA})`);
    }
    if (data.version !== VERSION) {
        throw new Error(`Unexpected data version: ${data.version} (expected: ${VERSION})`);
    }
    return data;
};

exports.checkDiffData = function (data) {
    if (data.type !== TYPE_DIFF_DATA) {
        throw new Error(`Unexpected data type: ${data.type} (expected: ${TYPE_DIFF_DATA})`);
    }
    if (data.version !== VERSION) {
        throw new Error(`Unexpected data version: ${data.version} (expected: ${VERSION})`);
    }
    return data;
};

exports.createExtractedData = function () {
    return {
        type: TYPE_EXTRACTED_DATA,
        version: VERSION
    };
};

exports.createDiffData = function () {
    return {
        type: TYPE_DIFF_DATA,
        version: VERSION
    };
};
