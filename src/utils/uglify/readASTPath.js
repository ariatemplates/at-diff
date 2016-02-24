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

function getProperty (node, propertyName) {
    var properties = node.properties;
    for (var i = 0, l = properties.length; i < l; i++) {
        var curKeyValue = properties[i];
        if (curKeyValue instanceof UglifyJS.AST_ObjectKeyVal && curKeyValue.key === propertyName) {
            return curKeyValue.value;
        }
    }
}

module.exports = function (node, path) {
    const pathParts = path.split(".");
    let curNode = node;
    for (const pathPart of pathParts) {
        if (curNode instanceof UglifyJS.AST_Object) {
            curNode = getProperty(curNode, pathPart);
        } else {
            return null;
        }
    }
    return curNode;
};
