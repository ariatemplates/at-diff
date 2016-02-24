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

const crypto = require("crypto");
/*
const crypto = {

    createHash: function () {
        const out = [];
        return {
            update(text, encoding) {
                out.push(new Buffer(text, encoding));
            },
            digest(encoding) {
                console.log(out.join(''));
                return "0000000000000000";
            }
        }
    }
}
*/
class HashTemplate {
    constructor() {
        this.symbol = Symbol();
        this.hashObjectsStack = [];
    }

    updateHash(phase, statementName, param) {
        if (this.hashObjectsStack.length) {
            const hashObject = this.hashObjectsStack[this.hashObjectsStack.length - 1];
            hashObject.update(`\n${phase}${statementName}:${param.length}:`, "utf-8");
            hashObject.update(param, "utf-8");
        }
    }

    "on-default"(statement) {
        this.updateHash("-", statement.name, statement.paramBlock);
    }

    "begin-default"(statement) {
        const hashObject = crypto.createHash("sha256");
        this.hashObjectsStack.push(hashObject);
        this.updateHash("-", statement.name, statement.paramBlock);
    }

    "end-default"(statement) {
        const hashObject = this.hashObjectsStack.pop();
        const hash = hashObject.digest("hex");
        statement[this.symbol] = hash;
        this.updateHash(">", statement.name, hash);
    }
}

module.exports = HashTemplate;
