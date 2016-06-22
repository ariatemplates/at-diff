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

const fs = require("graceful-fs");
const path = require("path");
const libs = require("./libs");

const removeClosingScriptsInJSON = function(data) {
    return data.replace(/<\/script/g, "<\\/script").replace(/<!--/g, "<\\!--");
};

const atdiffJS = fs.readFileSync(path.join(__dirname, "..", "..", "build", "ui", "browser", "at-diff.js"), "utf-8");

module.exports = function (output) {
    const mode = process.env.NODE_ENV !== "development" ? "production" : "development";
    const setMode = mode === "development" ? "\n<script>window.development = true;</script>" : "";
    return `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>at-diff results</title>
        ${libs[mode]}${setMode}
    </head>
    <body>
        <atdiff-app></atdiff-app>
        <script id="atdiff-data">var atdiffData=${removeClosingScriptsInJSON(output)};</script>
        <script>${atdiffJS}</script>
    </body>
</html>`;

};
