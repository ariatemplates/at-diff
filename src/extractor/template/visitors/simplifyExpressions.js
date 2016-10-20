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

const uglifyParse = require("../../../utils/uglify/parse");
const parseExpression = require("../../../utils/uglify/parseExpression");
const astToString = require("../../../utils/uglify/astToString");

function checkUndefinedParamBlock(statement) {
    if (!statement.paramBlock) {
        statement.paramBlock = "undefined";
    }
}

function parseJS(js, statement) {
    try {
        return uglifyParse(js);
    } catch (e) {
        throw new Error(`Line ${statement.lineNumber}, in statement ${statement.name}: ${e.message || e}\nJS code: ${js}`);
    }
}

function simplifyExpression(expression, statement, storeName) {
    try {
        const ast = parseExpression(expression);
        if (storeName) {
            statement[storeName] = ast;
        }
        return astToString(ast);
    } catch (e) {
        throw new Error(`Line ${statement.lineNumber}, in statement ${statement.name}: ${e.message || e}\nExpression: ${expression}`);
    }
}

function simplifyList(list, statement) {
    return simplifyExpression(`[${list}]`, statement).slice(1,-1);
}

function simplifyParamBlock(statement) {
    statement.paramBlock = simplifyExpression(statement.paramBlock, statement, "paramBlockAST");
}

/**
 * This class rewrites the properties and paramBlock of most statements to their simplest expression
 * so that minor changes not affecting the meaning (such as white space changes)
 * are not reported as changes.
 */
class SimplifyExpressions {
    "on-#EXPRESSION#"(statement) {
        const properties = statement.properties;
        properties.expression = simplifyExpression(properties.expression, statement);
        const result = [properties.expression].concat(properties.modifiers.map(modifier => {
            let args = "";
            if (modifier.args) {
                modifier.args = simplifyList(modifier.args, statement);
                args = `:${modifier.args}`;
            }
            return `${modifier.name}${args}`;
        }));
        statement.paramBlock = result.join("|");
    }

    "on-id"(statement) {
        const properties = statement.properties;
        properties.id = simplifyExpression(properties.id, statement);
        statement.paramBlock = properties.id;
    }

    "on-on"(statement) {
        const properties = statement.properties;
        properties.callback = simplifyExpression(properties.callback, statement);
        statement.paramBlock = `${properties.eventName} ${properties.callback}`;
    }

    "begin-if"(statement) {
        simplifyParamBlock(statement);
    }

    "on-elseif"(statement) {
        simplifyParamBlock(statement);
    }

    "on-createView"(statement) {
        const properties = statement.properties;
        const parametersAST = parseExpression(properties.parameters);
        properties.parameters = astToString(parametersAST);
        const parametersString = parametersAST.elements.map(function (parameter) {
            return `[${astToString(parameter)}]`;
        }).join("");
        statement.paramBlock = `${properties.view.baseName}${parametersString} on ${simplifyExpression(properties.array, statement)}`;
    }

    "begin-for"(statement) {
        const forStatement = parseJS(`for (${statement.paramBlock}){}`, statement);
        statement.paramBlock = astToString(forStatement).replace(/^for\((.*)\)\{\}$/, "$1");
    }

    "begin-foreach"(statement) {
        const properties = statement.properties;
        properties.iteratedObject = simplifyExpression(properties.iteratedObject, statement);
        statement.paramBlock = `${properties.variable} ${properties.inKeyWord} ${properties.iteratedObject}`;
    }

    "on-repeater"(statement) {
        simplifyParamBlock(statement);
    }

    "begin-macro"(statement) {
        const properties = statement.properties;
        statement.paramBlock = `${properties.name}(${properties.args.join(",")})`;
    }

    "on-call"(statement) {
        const properties = statement.properties;
        const container = properties.container ? `${properties.container}.` : "";
        properties.args = simplifyList(properties.args, statement);
        statement.paramBlock = `${container}${properties.name}(${properties.args})`;
    }

    "on-section"(statement) {
        simplifyParamBlock(statement);
    }

    "begin-section"(statement) {
        // statement as a container
        simplifyParamBlock(statement);
    }

    "on-var"(statement) {
        const properties = statement.properties;
        properties.value = simplifyExpression(properties.value, statement);
        statement.paramBlock = `${properties.name}=${properties.value}`;
    }

    "on-set"(statement) {
        const properties = statement.properties;
        properties.value = simplifyExpression(properties.value, statement);
        statement.paramBlock = `${properties.name}${properties.operator}${properties.value}`;
    }

    "on-checkDefault"(statement) {
        const properties = statement.properties;
        properties.value = simplifyExpression(properties.value, statement);
        statement.paramBlock = `${properties.name}=${properties.value}`;
    }

    "on-@"(statement) {
        // simple widget
        checkUndefinedParamBlock(statement);
        simplifyParamBlock(statement);
    }

    "begin-@"(statement) {
        // container widget
        checkUndefinedParamBlock(statement);
        simplifyParamBlock(statement);
    }

    "begin-Template"(statement) {
        simplifyParamBlock(statement);
    }

    "begin-Library"(statement) {
        simplifyParamBlock(statement);
    }

    "begin-CSSTemplate"(statement) {
        simplifyParamBlock(statement);
    }

    "begin-CSSLibrary"(statement) {
        simplifyParamBlock(statement);
    }

    "begin-TextTemplate"(statement) {
        simplifyParamBlock(statement);
    }
}

module.exports = SimplifyExpressions;
