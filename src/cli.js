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

const minimist = require("minimist");
const camelCase = require("camelcase");
const co = require("co");
const promisify = require("pify");
const Comparator = require("./comparator");
const parseFiles = require("./parseFiles");
const createExtractor = require("./createExtractor");
const readJson = require("./readJson");
const processOutput = require("./processOutput");
const glob = promisify(require("glob"));
const open = require("./utils/open");
const reserializeDiffData = require("./comparator/reserializeDiffData");

const globParseFiles = co.wrap(function * (extractor, pattern, options) {
    options = options || {};
    if (options.cwd == null) {
        options.cwd = process.cwd();
    }
    options.nodir = true;
    const filesList = yield glob(pattern, options);
    return parseFiles(extractor, options.cwd, filesList);
});

const commands = {
    * parse (config, directory) {
        const extractor = yield createExtractor(config);
        const data = yield globParseFiles(extractor, config.filter || "**/*", {
            cwd: directory,
            ignore: config.ignore
        });
        yield processOutput(config, data);
    },
    * compare (config, file1, file2) {
        const data = yield Promise.all([file1, file2].map(fileName => readJson(fileName)));
        const comparator = new Comparator(config);
        const diff = comparator.compareFiles(data[0], data[1]);
        yield processOutput(config, diff);
    },
    * evalimpacts (config, diffFile, filesMap) {
        const data = yield Promise.all([diffFile, filesMap].map(fileName => readJson(fileName)));
        const comparator = new Comparator(config);
        const diff = comparator.evaluateImpacts(data[0], data[1]);
        yield processOutput(config, diff);
    },
    * ["parse+compare"] (config, directory1, directory2) {
        const extractor = yield createExtractor(config);
        const data = yield Promise.all([directory1, directory2].map(directory => globParseFiles(extractor, config.filter || "**/*", {
            cwd: directory,
            ignore: config.ignore
        })));
        const comparator = new Comparator(config);
        const diff = comparator.compareFiles(data[0], data[1]);
        yield processOutput(config, diff);
    },
    * ["parse+evalimpacts"] (config, diffFile, directory) {
        const extractor = yield createExtractor(config);
        const data = yield Promise.all([readJson(diffFile), globParseFiles(extractor, config.filter || "**/*", {
            cwd: directory,
            ignore: config.ignore
        })]);
        const comparator = new Comparator(config);
        const diff = comparator.evaluateImpacts(data[0], data[1]);
        yield processOutput(config, diff);
    },
    * reformat (config, diffFile) {
        const diff = yield readJson(diffFile);
        yield processOutput(config, diff);
    },
    * reserialize (config, diffFile) {
        const diff = yield readJson(diffFile);
        const reserialized = reserializeDiffData(config, diff);
        yield processOutput(config, reserialized);
    }
};

module.exports = co.wrap(function * (argv) {
    const minimistConfig = minimist(argv, {
        "boolean": ["help", "version", "json-beautify", "open", "console-output", "deterministic-output"]
    });
    if (minimistConfig.help) {
        yield open("http://at-diff.ariatemplates.com");
        return;
    }
    if (minimistConfig.version) {
        console.log(require("../package.json").version);
        return;
    }
    const args = minimistConfig._;
    const config = {};
    Object.keys(minimistConfig).forEach(name => {
        if (name !== "_") {
            config[camelCase(name)] = minimistConfig[name];
        }
    });
    const command = args.shift();
    args.unshift(config);
    if (commands.hasOwnProperty(command)) {
        const fn = commands[command];
        if (fn.length !== args.length) {
            throw new Error(`Expected exactly ${fn.length - 1} parameter(s).`);
        }
        yield co.wrap(fn).apply(null, args);
    } else {
        throw new Error(`Unknown command: ${command}`);
    }
});
