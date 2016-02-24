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

const assert = require("assert");

module.exports = function (results) {

    function checkErrors(data, knownErrors) {
        const files = data.files;
        Object.keys(files).forEach(fileName => {
            const fileInfo = files[fileName];
            const hasError = fileInfo.type === "error";
            if (hasError && (!knownErrors || knownErrors.indexOf(fileName) === -1)) {
                assert.fail(fileName, knownErrors, `${fileName} was not parsed successfully (${fileInfo.content.error})`);
            }
        });
    }

    it("all Aria Templates files are parsed successfully (with a few known exceptions)", function () {
        checkErrors(results.at, ["aria/core/log/DefaultAppender.js", "aria/node.js", "aria/utils/json/JsonSerializer.js"]);
    });

    it("all sample files are parsed successfully", function () {
        checkErrors(results.version1);
        checkErrors(results.version2);
        checkErrors(results.user);
    });
};
