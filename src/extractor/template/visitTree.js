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

module.exports = function (tree, visitorConfigs) {
    if (!Array.isArray(visitorConfigs)) {
        visitorConfigs = [visitorConfigs];
    }

    function callVisitor(phase, statement) {
        let statementName = statement.name;
        if (statementName[0] == "@") {
            statementName = "@";
        }
        visitorConfigs.forEach(function (visitor) {
            const fn = visitor[`${phase}-${statementName}`] || visitor[`${phase}-default`];
            if (fn) {
                fn.call(visitor, statement);
            }
        });
    }

    function iterate (statement) {
        const content = statement.content;
        if (content) {
            callVisitor("begin", statement);
            content.forEach(iterate);
            callVisitor("end", statement);
        } else {
            callVisitor("on", statement);
        }
    }

    iterate(tree);
};
