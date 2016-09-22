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
const assertFilesEqual = require("../helpers/assertFilesEqual");
const exec = require("../helpers/exec");

module.exports = function (results) {
    const outDir = results.outDir;
    const atDiffExecutable = require.resolve("../../bin/at-diff");

    const filesToCompare = [
        // The .json extension is automatically added
        "version1.parse",
        "version2.parse",
        "user.parse",
        "at.parse",
        "version1to2.diff",
        "filteredVersion1to2.diff",
        "impactsOnUser.diff",
        "filteredImpactsOnUser.diff"
    ];

    filesToCompare.forEach((fileName) => {
        const nonDeterministicFileName = `${fileName}.json`;
        it(nonDeterministicFileName, co.wrap(function *() {
            this.timeout(10000);
            const transformCommand = /\.parse$/.test(fileName) ? "reformat" : "reserialize";
            const deterministicFileName = `${fileName}.deterministic.json`;
            yield exec(atDiffExecutable, [transformCommand, nonDeterministicFileName, "--json-output", deterministicFileName, "--deterministic-output", "--json-beautify"], {
                cwd: outDir
            });
            yield assertFilesEqual(path.join(outDir, deterministicFileName), path.join(__dirname, "..", "expected-output", deterministicFileName));
        }));
    });
};
