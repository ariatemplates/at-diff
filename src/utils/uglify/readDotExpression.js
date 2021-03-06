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

const UglifyJS = require("uglify-js");

module.exports = function (node) {
    let currentNode = node;
    let foundLeftPart = !(currentNode instanceof UglifyJS.AST_Dot);
    let parts = [];
    while (!foundLeftPart) {
        parts.unshift(currentNode.property);
        currentNode = currentNode.expression;
        foundLeftPart = !(currentNode instanceof UglifyJS.AST_Dot);
    }
    return {
        leftPart: currentNode,
        properties: parts
    };
};
