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
const Comparator = require("../src/comparator");
const parseFiles = require("../src/parseFiles");
const createExtractor = require("../src/createExtractor");
const readJson = require("../src/readJson");
const processOutput = require("../src/processOutput");

module.exports = function (grunt) {
    const writeFile = co.wrap(function * (fileName, content) {
        grunt.file.write(fileName, content);
    });

    function cotask(generator) {
        const fn = co.wrap(generator);
        return function () {
            const done = this.async();
            fn.call(this).then(() => done(), (error) => done(error instanceof Error ? error : new Error(error)));
        };
    }

    const extractorCache = Object.create(null);

    grunt.registerMultiTask("at-diff-parse", "Extracts relevant information from a set of source files.", cotask(function * () {
        const options = this.options({
            cache: "default"
        });
        const extractorCacheName = options.cache;
        let extractor = extractorCacheName === "none" ? null : extractorCache[extractorCacheName];
        if (!extractor) {
            extractor = yield createExtractor(options);
            if (extractorCacheName !== "none") {
                extractorCache[extractorCacheName] = extractor;
            }
        }
        let data = null;
        for (const curFile of this.files) {
            const cwd = curFile.cwd || process.cwd();
            data = yield parseFiles(extractor, cwd, curFile.src, data);
        }
        if (data) {
            yield processOutput(options, data, writeFile);
        }
    }));

    grunt.registerMultiTask("at-diff-compare", "Compares two versions of a set of source files (from the extracted information provided by at-diff-parse) and produces a report of differences/impacts.", cotask(function * () {
        const options = this.options();
        const data = yield Promise.all([options.version1, options.version2].map(fileName => readJson(fileName)));
        const comparator = new Comparator();
        const diff = comparator.compareFiles(data[0], data[1]);
        yield processOutput(options, diff, writeFile);
    }));

    grunt.registerMultiTask("at-diff-evalimpacts", "Uses a report of differences/impacts (provided by at-diff-compare) to evaluate the impacts of those changes on a set of source files (whose relevant information has been extracted by at-diff-parse) and produces a report of differences/impacts.", cotask(function * () {
        const options = this.options();
        const data = yield Promise.all([options.versionsDiff, options.impactedFiles].map(fileName => readJson(fileName)));
        const comparator = new Comparator();
        const diff = comparator.evaluateImpacts(data[0], data[1]);
        yield processOutput(options, diff, writeFile);
    }));
};
