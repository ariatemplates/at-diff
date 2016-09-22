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

const path = require("path");
const gulp = require("gulp");
const promisify = require("pify");
const rimraf = promisify(require("rimraf"));
const webpack = require("webpack");

const checkWebpackErrors = function (done) {
    return (inputErr, result) => {
        let outputErr = inputErr;
        if (!outputErr) {
            const stats = result.toJson();
            if (stats.errors.length > 0) {
                outputErr = stats.errors;
            }
        }
        if (Array.isArray(outputErr)) {
            outputErr = outputErr.join("\n\n");
        }
        done(outputErr);
    };
};

gulp.task("clean", function() {
    return rimraf(path.join(__dirname, "build"));
});

gulp.task("clean-doc", function() {
    return rimraf(path.join(__dirname, "doc-output"));
});

gulp.task("build", function(done) {
    webpack({
        entry: [path.join(__dirname, "src/ui/atdiff.ts")],
        output: {
            path: path.join(__dirname, "build/ui/browser"),
            filename: "at-diff.js"
        },
        resolve: {
            extensions: ["", ".webpack.js", ".web.js", ".ts", ".js"]
        },
        module: {
            loaders: [{
                loader: "awesome-typescript-loader"
            }]
        },
        externals: {
            "@angular/core": "var ng.core",
            "@angular/forms": "var ng.forms",
            "@angular/platform-browser": "var ng.platformBrowser",
            "@angular/platform-browser-dynamic": "var ng.platformBrowserDynamic"
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                output: {
                    inline_script: true,
                    ascii_only: true
                }
            })
        ]
    }).run(checkWebpackErrors(done));
});

gulp.task("build-doc-copy", function() {
    return gulp.src(["doc/**/*", "!doc/*.md", "!doc/*.json", "!doc/*.html"]).pipe(gulp.dest("doc-output"));
});

gulp.task("build-doc", ["build-doc-copy"]);
