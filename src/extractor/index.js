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
const defaultExtractors = [require("./template"), require("./atDefinition"), require("./binary")];
const fileFormat = require("../fileFormat");

class Extractor {
    constructor(config, extractors) {
        config = config || {};
        this.config = config;
        this.extractors = (extractors || defaultExtractors.map(ExtractorConstructor => new ExtractorConstructor(config)));
        this.cache = Object.create(null);
    }

    fillCache (filesInfo) {
        filesInfo = fileFormat.checkExtractedData(filesInfo);
        const map = filesInfo.files;
        const cache = this.cache;
        Object.keys(map).forEach(function (filePath) {
            const fileInfo = map[filePath];
            cache[`${fileInfo.strictHash}:${filePath}`] = fileInfo;
        });
    }

    computeHash (fileContent) {
        const hash = crypto.createHash("sha256");
        hash.update(fileContent);
        return hash.digest("hex");
    }

    /**
     * The extractor parses a file and returns a structure containing the pieces of
     * information from this file that are interesting from this tool's point of view.
     */
    parseFile (fileContent, filePath) {
        const strictHash = this.computeHash(fileContent);
        const cacheKey = `${strictHash}:${filePath}`;
        let result = this.cache[cacheKey];
        if (!result) {
            const extractors = this.extractors;
            try {
                for (let i = 0, l = extractors.length; i < l; i++) {
                    const extractor = extractors[i];
                    const info = extractor.parseFile(fileContent, filePath);
                    if (info) {
                        result = {
                            strictHash: strictHash,
                            type: info.type,
                            flexibleHash: info.flexibleHash || undefined,
                            dependencies: info.dependencies || {},
                            content: info.content || undefined
                        };
                        break;
                    }
                }
            } catch (e) {
                // TODO: better log the error correctly
                console.log(`Parse error in ${filePath} : ${e}`);
                result = {
                    strictHash: strictHash,
                    type: "error",
                    dependencies: {},
                    content: {
                        error: e + ""
                    }
                };
            }
            this.cache[cacheKey] = result;
        }
        return result;
    }
}

module.exports = Extractor;
