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
const promisify = require("pify");
const rimraf = promisify(require("rimraf"));
const mkdir = promisify(require("graceful-fs").mkdir);
const exec = require("./helpers/exec");
const check = require("./checks");

describe("command line tool test", function () {
    const outDir = path.join(__dirname, "cli-out");

    before(co.wrap(function * () {
        this.timeout(30000);
        const atDiffExecutable = require.resolve("../bin/at-diff");
        yield rimraf(outDir);
        yield mkdir(outDir);
        yield exec(atDiffExecutable, ["parse", path.join(__dirname, "../node_modules/ariatemplates/src"), "--filter", "aria/**", "--json-output", "at.parse.json"], {
            cwd: outDir
        });
        yield exec(atDiffExecutable, ["parse", path.join(__dirname, "files/version1"), "--json-output", "version1.parse.json"], {
            cwd: outDir
        });
        yield exec(atDiffExecutable, ["parse", path.join(__dirname, "files/version2"), "--json-output", "version2.parse.json"], {
            cwd: outDir
        });
        yield exec(atDiffExecutable, ["parse", path.join(__dirname, "files/user"), "--json-output", "user.parse.json"], {
            cwd: outDir
        });
        yield exec(atDiffExecutable, ["compare", "version1.parse.json", "version2.parse.json", "--json-output", "version1to2.diff.json", "--html-output", "version1to2.diff.html"], {
            cwd: outDir
        });
        yield exec(atDiffExecutable, ["compare", "version1.parse.json", "version2.parse.json", "--filter-changes", "FileRemoved", "--filter-impacts", "MemberRemoved", "--json-output", "filteredVersion1to2.diff.json", "--html-output", "filteredVersion1to2.diff.html"], {
            cwd: outDir
        });
        yield exec(atDiffExecutable, ["evalimpacts", "version1to2.diff.json", "user.parse.json", "--json-output", "impactsOnUser.diff.json", "--html-output", "impactsOnUser.diff.html"], {
            cwd: outDir
        });
        yield exec(atDiffExecutable, ["evalimpacts", "version1to2.diff.json", "user.parse.json", "--filter-impacts", "RemovedBeanStillUsed,RemovedMemberStillUsed", "--json-output", "filteredImpactsOnUser.diff.json", "--html-output", "filteredImpactsOnUser.diff.html"], {
            cwd: outDir
        });
    }));

    check(outDir);
});
