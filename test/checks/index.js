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

const co = require("co");
const path = require("path");
const readJson = require("../../src/readJson");
const deserializeDiffData = require("../../src/comparator/deserializeDiffData");
const readdirSync = require("fs").readdirSync;

const filesFilter = /\.check\.js$/i;
const checkFiles = readdirSync(__dirname).filter(file => filesFilter.test(file)).map(fileName => ({name: fileName, fn: require(`./${fileName}`)}));

const readJsonDiff = co.wrap(function * (diffFilePath) {
    const result = deserializeDiffData(yield readJson(diffFilePath));
    const filesMap = result.filesMap = Object.create(null);
    function getFileObject(filePath) {
        let fileObject = filesMap[filePath];
        if (!fileObject) {
            fileObject = filesMap[filePath] = {
                impacts: [],
                changes: []
            };
        }
        return fileObject;
    }
    result.changes.forEach(change => {
        getFileObject(change.getModifiedFile()).changes.push(change);
    });
    result.impacts.forEach(impact => {
        getFileObject(impact.getImpactedFile()).impacts.push(impact);
    });
    return result;
});

module.exports = function (outDir) {
    const results = {};

    before(co.wrap(function * () {
        results.version1 = yield readJson(path.join(outDir, "version1.parse.json"));
        results.version2 = yield readJson(path.join(outDir, "version2.parse.json"));
        results.user = yield readJson(path.join(outDir, "user.parse.json"));
        results.at = yield readJson(path.join(outDir, "at.parse.json"));
        results.version1to2 = yield readJsonDiff(path.join(outDir, "version1to2.diff.json"));
        results.impactsOnUser = yield readJsonDiff(path.join(outDir, "impactsOnUser.diff.json"));
    }));

    checkFiles.forEach(file => {
        describe(file.name, file.fn.bind(null, results));
    });
};
