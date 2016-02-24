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

const uglifyParse = require("../../utils/uglify/parse");
const jsRegExp = /\.js$/i;
const ATInfoExtractor = require("./atInfoExtractor");

class AriaTemplatesDefinitionExtractor {
    parseFile (fileContent, logicalPath) {
        if (!jsRegExp.test(logicalPath)) {
            return false; // use the next extractor
        }
        const textContent = fileContent.toString("utf-8");
        const ast = uglifyParse(textContent);
        ast.figure_out_scope();
        var infoExtractor = new ATInfoExtractor();
        return infoExtractor.processNode(ast, logicalPath);
    }
}

module.exports = AriaTemplatesDefinitionExtractor;
