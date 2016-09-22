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

module.exports = function (grunt) {
    grunt.loadTasks("../../tasks");

    grunt.initConfig({
        "at-diff-parse": {
            at: {
                options: {
                    jsonOutput: "out/at.parse.json"
                },
                filter: "isFile",
                cwd: "../../node_modules/ariatemplates/src",
                src: ["aria/**"]
            },
            version1: {
                options: {
                    jsonOutput: "out/version1.parse.json"
                },
                filter: "isFile",
                cwd: "../files/version1",
                src: ["**"]
            },
            version2: {
                options: {
                    jsonOutput: "out/version2.parse.json"
                },
                filter: "isFile",
                cwd: "../files/version2",
                src: ["**"]
            },
            user: {
                options: {
                    jsonOutput: "out/user.parse.json"
                },
                filter: "isFile",
                cwd: "../files/user",
                src: ["**"]
            }
        },
        "at-diff-compare": {
            version1to2: {
                options: {
                    version1: "out/version1.parse.json",
                    version2: "out/version2.parse.json",
                    jsonOutput: "out/version1to2.diff.json",
                    htmlOutput: "out/version1to2.diff.html"
                }
            },
            filteredVersion1to2: {
                options: {
                    version1: "out/version1.parse.json",
                    version2: "out/version2.parse.json",
                    jsonOutput: "out/filteredVersion1to2.diff.json",
                    htmlOutput: "out/filteredVersion1to2.diff.html",
                    filterImpacts: (impact) => impact.getType() === "MemberRemoved",
                    filterChanges: ["FileRemoved"]
                },
            }
        },
        "at-diff-evalimpacts": {
            impactsOnUser: {
                options: {
                    versionsDiff: "out/version1to2.diff.json",
                    impactedFiles: "out/user.parse.json",
                    jsonOutput: "out/impactsOnUser.diff.json",
                    htmlOutput: "out/impactsOnUser.diff.html"
                }
            },
            filteredImpactsOnUser: {
                options: {
                    versionsDiff: "out/version1to2.diff.json",
                    impactedFiles: "out/user.parse.json",
                    jsonOutput: "out/filteredImpactsOnUser.diff.json",
                    htmlOutput: "out/filteredImpactsOnUser.diff.html",
                    filterImpacts: [
                        "RemovedBeanStillUsed",
                        "RemovedMemberStillUsed"
                    ]
                }
            }
        }
    });

    grunt.registerTask("default", ["at-diff-parse", "at-diff-compare", "at-diff-evalimpacts"]);
};
