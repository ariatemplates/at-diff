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

function sortByMacroName (statement1, statement2) {
    const name1 = statement1.properties.name;
    const name2 = statement2.properties.name;
    if (name1 > name2) {
        return 1;
    } else if (name1 < name2) {
        return -1;
    } else {
        return 0;
    }
}

module.exports = function (tree) {
    const content = tree.content[0].content;
    const macros = [];
    const other = [];
    content.forEach(function (statement) {
        if (statement.name == "macro") {
            macros.push(statement);
        } else if (statement.name !== "#TEXT#") {
            other.push(statement);
        }
    });
    macros.sort(sortByMacroName);
    tree.content[0].content = other.concat(macros);
};
