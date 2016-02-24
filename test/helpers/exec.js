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

const child_process = require("child_process");

module.exports = function (js, args, options) {
    return new Promise((resolve, reject) => {
        console.log(`executing: ${js} ${args.join(" ")}`);
        const proc = child_process.fork(js, args, options);
        proc.on("close", code => {
            if (code === 0) {
                resolve();
            } else {
                const error = new Error(`${js} exited with code ${code}`);
                error.exitCode = code;
                reject(error);
            }
        });
        proc.on("error", (error) => reject(new Error(`${js} could not be started successfully: ${error}`)));
    });
};
