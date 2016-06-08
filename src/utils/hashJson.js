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

/*const crypto = {
    createHash: function () {
        const out = [];
        return {
            update: (item) => out.push(item),
            digest: () => {
                console.log(out.join(""));
                return "";
            }
        }
    }
}*/

module.exports = function (json) {
    const hashObject = crypto.createHash("sha256");

    function processObj(obj) {
        if (Array.isArray(obj)) {
            hashObject.update("[", "utf8");
            obj.forEach((value, index) => {
                if (index > 0) {
                    hashObject.update(",", "utf8");
                }
                processObj(value);
            });
            hashObject.update("]", "utf8");
        } else if (typeof obj === "object") {
            hashObject.update("{", "utf8");
            const keys = Object.keys(obj).sort();
            keys.forEach((key, index) => {
                if (index > 0) {
                    hashObject.update(",", "utf8");
                }
                hashObject.update(JSON.stringify(key), "utf8");
                hashObject.update(":", "utf8");
                processObj(obj[key]);
            });
            hashObject.update("}", "utf8");
        } else {
            hashObject.update(JSON.stringify(obj), "utf8");
        }
    }

    processObj(json);
    return hashObject.digest("hex");
};
