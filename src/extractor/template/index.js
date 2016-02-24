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

const winston = require("winston");
const getATContext = require("../getATContext");
const getLogicalPath = require("../../utils/getLogicalPath");
const reverseMap = require("../../utils/reverseMap");
const visitTree = require("./visitTree");
const SimplifyExpressions = require("./visitors/simplifyExpressions");
const HashTemplate = require("./visitors/hashTemplate");
const CollectInfo = require("./visitors/collectInfo");
const reorderGlobalStatements = require("./reorderGlobalStatements");
const hashString = require("../../utils/hashString");
const addClassMember = require("../addClassMember");

const classGenerators = {
    ".tpl" : "aria.templates.TplClassGenerator",
    ".tpl.css" : "aria.templates.CSSClassGenerator",
    ".tml" : "aria.templates.TmlClassGenerator",
    ".tpl.txt" : "aria.templates.TxtClassGenerator",
    ".cml" : "aria.templates.CmlClassGenerator"
};

const firstComment = /^\s*\/\*[\s\S]*?\*\//;
const alreadyGeneratedRegExp = /^\s*(?:var\s+|Aria\.classDefinition\()/;

class TemplateExtractor {

    constructor (config) {
        this.atContext = getATContext(config);
    }

    parseFile (fileContent, filePath) {
        const extension = this.getExtension(filePath);
        if (!classGenerators.hasOwnProperty(extension)) {
            return false; // use the next extractor
        }
        const templateText = fileContent.toString("utf-8");
        const tree = this.parseTemplate(templateText, extension);
        const result = this.processTree(tree, extension);

        if (getLogicalPath(result.content.classpath, extension) !== filePath) {
            winston.warn(`${result.content.classpath} was found inside ${filePath}, which is unexpected.`);
        }
        return result;
    }

    getExtension (filePath) {
        var withoutPath = filePath.replace(/^(.*\/)?([^/]*)$/, "$2");
        var dot = withoutPath.indexOf(".");
        if (dot > -1) {
            return withoutPath.substr(dot);
        }
        return "";
    }

    isTemplateCompiled (templateText) {
        templateText = templateText.replace(firstComment, ""); // removes first comment
        return alreadyGeneratedRegExp.test(templateText);
    }

    parseTemplate (fileContent, extension) {
        if (this.isTemplateCompiled(fileContent)) {
            throw new Error("Compiled templates are not supported. Please use this tool on source code before compiling templates.");
        }
        const classGeneratorClasspath = classGenerators[extension];
        const atContext = this.atContext;
        let classGenerator = atContext.Aria.getClassRef(classGeneratorClasspath);
        if (!classGenerator) {
            atContext.Aria.load({
                classes: [classGeneratorClasspath]
            });
            atContext.execTimeouts();
            classGenerator = atContext.Aria.getClassRef(classGeneratorClasspath);
        }
        let result;
        classGenerator.parseTemplate(fileContent, {
            parseOnly: true,
            dontLoadWidgetLibs: true,
            skipLogError: true
        }, function (res) {
            result = res;
        });
        const errors = result.errors;
        if (errors) {
            if (Array.isArray(errors)) {
                const msgs = errors.map(function (error) {
                    return atContext.aria.core.Log.prepareLoggedMessage(error.msgId, error.msgArgs, error.errorContext);
                });
                throw new Error(msgs.join("\n"));
            } else {
                throw errors;
            }
        }
        return result.tree;
    }

    processTree (tree, extension) {
        reorderGlobalStatements(tree);

        const headerProperties = tree.content[0].properties;
        const hash = new HashTemplate();
        const info = new CollectInfo();
        visitTree(tree, [new SimplifyExpressions(), hash, info]);

        const macrosInfoMap = tree.properties.macros;
        const members = {};
        Object.keys(macrosInfoMap).forEach(macroName => {
            const macroStatement = macrosInfoMap[macroName].definition;
            const macroProperties = macroStatement.properties;
            members[`this.macro_${macroProperties.name}`] = {
                type: "macro",
                args: macroProperties.args,
                hash: macroStatement[hash.symbol]
            };
        });
        addClassMember(members, headerProperties.$classpath);

        const result = {
            type: "template",
            flexibleHash: tree.content[0][hash.symbol],
            content: {
                classpath: headerProperties.$classpath,
                members: members,
                membersUsages: reverseMap(info.macrosCallsMap)
            }
        };

        this.processDependencies(headerProperties, extension, result);
        return result;
    }

    processDependencies (headerProperties, extension, result) {
        const dependencies = {};

        const addClasspath = (extension, classpath, fn) => {
            const logicalPath = getLogicalPath(classpath, extension);
            let dep = dependencies[logicalPath];
            if (!Array.isArray(dep)) {
                dep = dependencies[logicalPath] = [];
            }
            if (fn) {
                fn(logicalPath, dep);
            }
            return logicalPath;
        };

        const addArray = (array, extension) => {
            if (array && array.length) {
                array.forEach(classpath => addClasspath(extension, classpath));
            }
        };

        const addObject = (object, extension, fn) => {
            if (object) {
                Object.keys(object).forEach(key => addClasspath(extension, object[key], fn ? fn.bind(null, key) : null));
            }
        };

        const processLib = (key, logicalPath, dep) => {
            const memberKey = `this.${key}`;
            result.content.members[memberKey] = {
                type: "lib",
                hash: hashString(logicalPath),
                path: logicalPath
            };
            dep.push({
                type: "lib",
                hash: hashString(memberKey),
                member: memberKey
            });
        };

        // TODO (maybe): add resources support

        if (headerProperties.$extends) {
            result.content.parent = addClasspath(extension, headerProperties.$extends, (logicalPath, dep) => dep.push({type:"parent"}));
        }
        if (headerProperties.$hasScript) {
            result.content.script = addClasspath(".js", headerProperties.$classpath + "Script", (logicalPath, dep) => dep.push({type:"script"}));
        }
        addArray(headerProperties.$dependencies, ".js");
        addArray(headerProperties.$templates, ".tpl");
        addArray(headerProperties.$css, ".tpl.css");
        if (headerProperties.$macrolibs) {
            addObject(headerProperties.$macrolibs, ".tml", processLib);
        }
        if (headerProperties.$csslibs) {
            addObject(headerProperties.$csslibs, ".cml", processLib);
        }
        addObject(headerProperties.$texts, ".tpl.txt");
        addObject(headerProperties.$wlibs, ".js");

        result.dependencies = dependencies;
    }
}

module.exports = TemplateExtractor;
