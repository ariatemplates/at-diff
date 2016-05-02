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

const check = require("./checks");
const co = require("co");
const path = require("path");
const promisify = require("pify");
const rimraf = promisify(require("rimraf"));
const exec = require("./helpers/exec");

describe("grunt tasks test", function () {
    const outDir = path.join(__dirname, "grunt", "out");

    before(co.wrap(function * () {
        this.timeout(30000);
        yield rimraf(outDir);
        yield exec(require.resolve("grunt/bin/grunt"), [], {
            cwd: path.join(__dirname, "grunt")
        });
    }));

    check(outDir);
});
