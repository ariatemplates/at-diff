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
const sortAndRemoveDuplicates = require("../../../utils/sortAndRemoveDuplicates");
const readASTPath = require("../../../utils/uglify/readASTPath");
const readDotExpression = require("../../../utils/uglify/readDotExpression");

const macroNameRegexp = /[_\w]+/;
function readMacroName(macroNameNode) {
    if (macroNameNode instanceof UglifyJS.AST_String) {
        const value = macroNameNode.value;
        return macroNameRegexp.test(value) ? value : undefined;
    }
}

function readContainer(scopeNode) {
    const dotExpression = readDotExpression(scopeNode);
    let leftPart = dotExpression.leftPart;
    const properties = dotExpression.properties;
    if (leftPart instanceof UglifyJS.AST_This) {
        if (properties.length == 0) {
            return "this";
        } else {
            leftPart = new UglifyJS.AST_SymbolRef({
                name: properties.shift()
            });
        }
    }
    if (leftPart instanceof UglifyJS.AST_SymbolRef && properties.length === 0) {
        return leftPart.name;
    }
}

function readMacro (macroNode) {
    let macroName = readMacroName(macroNode);
    let container = null;
    if (!macroName) {
        macroName = readMacroName(readASTPath(macroNode, "name"));
        const scopeNode = readASTPath(macroNode, "scope");
        if (scopeNode) {
            container = readContainer(scopeNode);
            if (container == null) {
                // container contains an unknown variable
                return;
            } else if (container == "this") {
                container = null;
            }
        }
    }
    if (macroName) {
        return {
            name: macroName,
            container: container
        };
    }
}

class CollectInfo {
    constructor() {
        this.macrosCallsMap = Object.create(null);
        this.callsArray = null;
    }

    "on-call"(statement) {
        this.addMacro(statement.properties);
    }

    "on-repeater"(statement) {
        this.readAndAddMacro(statement.paramBlockAST, "childSections.macro");
    }

    "on-section"(statement) {
        this.readAndAddMacro(statement.paramBlockAST, "macro");
    }

    readAndAddMacro(astNode, path) {
        const macro = readMacro(readASTPath(astNode, path));
        if (macro) {
            this.addMacro(macro);
        }
    }

    addMacro(macro) {
        this.callsArray.push(`this.${macro.container ? `${macro.container}.` : ""}macro_${macro.name}`);
    }

    "begin-macro"() {
        this.callsArray = [];
    }

    "end-macro"(statement) {
        this.macrosCallsMap[`this.macro_${statement.properties.name}`] = sortAndRemoveDuplicates(this.callsArray);
        this.callsArray = null;
    }
}

module.exports = CollectInfo;
