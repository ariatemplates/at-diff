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

const path = require("path").posix;
const winston = require("winston");
const UglifyJS = require("uglify-js");
const getLogicalPath = require("../../utils/getLogicalPath");
const astToHash = require("../../utils/uglify/astToHash");
const sortAndRemoveDuplicates = require("../../utils/sortAndRemoveDuplicates");
const addClassMember = require("../addClassMember");
const beansExtractor = require("./beansExtractor");

// TODO (maybe): process $resources parameter

const acceptedAriaMethods = {
    "classDefinition" : {
        $classpath : ["processClasspath"],
        $extends : ["processExtends"],
        $singleton : ["processSingleton"],
        $dependencies : ["processDependenciesArray", ".js", null],
        $resources : true,
        $events : true,
        $onload : true,
        $onunload : true,
        $implements : ["processDependenciesArray", ".js", "implements"],
        $css : ["processDependenciesArray", ".tpl.css", null],
        $templates : ["processDependenciesArray", ".tpl", null],
        $texts : ["processDependenciesMap", ".tpl.txt", null],
        $macrolibs : ["processDependenciesArray", ".tml", null],
        $csslibs : ["processDependenciesArray", ".cml", null],
        $prototype : ["processMembersMap", "this"],
        $statics : ["processMembersMap", "statics"],
        $constructor : ["processMember", "constructor"],
        $destructor : ["processMember", "destructor"]
    },
    "interfaceDefinition" : {
        $classpath : ["processClasspath"],
        $extends : ["processExtends"],
        $events : true,
        $interface : true
    },
    "beanDefinitions" : {
        $package: ["processClasspath"],
        $dependencies : ["processDependenciesArray", ".js", null],
        $namespaces : ["processNamespaces"],
        $beans : ["processBeans"],
        $description : true
    },
    "tplScriptDefinition" : {
        $classpath : ["processClasspath"],
        $dependencies : ["processDependenciesArray", ".js", null],
        $resources : true,
        $statics : ["processMembersMap", "statics"],
        $texts : ["processDependenciesMap", ".tpl.txt", null],
        $prototype : ["processMembersMap", "this"],
        $constructor : ["processMember", "constructor"],
        $destructor : ["processMember", "destructor"]
    },
    "resourcesDefinition" : {
        $classpath : ["processClasspath"],
        $resources : true
    }
};

const relativePathTest = /^\.\.?\//;
const ariaLogicalPathTest = /^aria(?:templates)?\/Aria(?:\.js)?$/;

class ATInfoExtractor {
    constructor() {
        this.logicalPath = null;
        this.atDefinitionNode = null;
        this.atDefinition = null;
        this.dependencies = {};
        this.requireDependencies = 0;
        this.oldSyntaxDependencies = 0;
        this.moduleExportsNode = null;
        this.type = "js";
    }

    resolveExpression(expression) {
        if (expression instanceof UglifyJS.AST_SymbolRef) {
            const def = expression.thedef.init;
            if (def && def.end.endpos < expression.start.pos) {
                return this.resolveExpression(def);
            }
        } else if (expression instanceof UglifyJS.AST_Assign && expression.operator == "=") {
            return this.resolveExpression(expression.right);
        }
        return expression;
    }

    resolvePath(relativeOrAbsolutePath) {
        let result = relativeOrAbsolutePath;
        if (relativePathTest.test(relativeOrAbsolutePath)) {
            result = path.join(this.logicalPath, "..", relativeOrAbsolutePath);
        }
        if (!path.extname(result)) {
            result += ".js";
        }
        return result;
    }

    readRequire(node) {
        if (node instanceof UglifyJS.AST_Call && node.args.length == 1) {
            const requireVar = node.expression;
            if (requireVar instanceof UglifyJS.AST_SymbolRef && requireVar.name == "require" && requireVar.thedef.undeclared) {
                const param = node.args[0];
                if (param instanceof UglifyJS.AST_String) {
                    return this.resolvePath(param.value);
                }
            }
        }
        return null;
    }

    readString(node) {
        if (node instanceof UglifyJS.AST_String) {
            return node.value;
        } else {
            throw new Error("Expected string literal.");
        }
    }

    readDependencyString(extension, node) {
        let logicalPath;
        if (node instanceof UglifyJS.AST_String) {
            const classpath = node.value;
            logicalPath = getLogicalPath(classpath, extension);
            this.oldSyntaxDependencies++;
        } else {
            const resolvedExpr = this.resolveExpression(node);
            logicalPath = this.readRequire(resolvedExpr);
            if (!logicalPath) {
                throw new Error("Expected dependency.");
            }
        }
        if (!Array.isArray(this.dependencies[logicalPath])) {
            this.dependencies[logicalPath] = [];
        }
        return logicalPath;
    }

    readDependenciesArray(extension, node) {
        if (node instanceof UglifyJS.AST_Array) {
            return node.elements.map(this.readDependencyString.bind(this, extension));
        } else {
            throw new Error("Expected dependencies array.");
        }
    }

    readDependenciesMap(extension, node) {
        if (node instanceof UglifyJS.AST_Object) {
            const res = {};
            node.properties.forEach(propertyNode => {
                if (!(propertyNode instanceof UglifyJS.AST_ObjectKeyVal)) {
                    throw new Error("Expected a property");
                }
                res[propertyNode.key] = this.readDependencyString(extension, propertyNode.value);
            });
            return res;
        } else {
            throw new Error("Expected dependencies map.");
        }
    }

    checkATDefinition(node) {
        const ariaXDefinition = node.expression;
        const definitionType = ariaXDefinition ? ariaXDefinition.property : null;
        if (! (node instanceof UglifyJS.AST_Call &&
            ariaXDefinition instanceof UglifyJS.AST_Dot &&
            acceptedAriaMethods.hasOwnProperty(definitionType) &&
            this.isAria(ariaXDefinition.expression)
        )) {
            return;
        }
        if (this.atDefinitionNode) {
            throw new Error("Multiple Aria definitions!");
        }
        this.atDefinitionNode = node;
        this.atDefinition = {};
        this.type = definitionType;
        if (definitionType === "classDefinition" || definitionType === "tplScriptDefinition") {
            this.atDefinition.members = {};
        }
        const ariaMethodInfo = acceptedAriaMethods[definitionType];
        const definition = node.args[0];
        if (!(definition instanceof UglifyJS.AST_Object)) {
            throw new Error(`Expected object literal in Aria.${definitionType}`);
        }
        definition.properties.forEach(propertyNode => {
            if (propertyNode instanceof UglifyJS.AST_ObjectKeyVal) {
                const key = propertyNode.key;
                const methodInfo = ariaMethodInfo[key];
                if (Array.isArray(methodInfo)) {
                    const args = methodInfo.slice(1);
                    args.push(propertyNode);
                    this[methodInfo[0]].apply(this, args);
                } else if (methodInfo !== true) {
                    winston.warn(`Invalid ${key} in Aria.${definitionType} in ${this.logicalPath}`);
                }
            }
        });
        if (definitionType === "beanDefinitions") {
            beansExtractor.processAtDefinition.call(this);
        }
    }

    processClasspath(propertyNode) {
        const classpath = this.atDefinition.classpath = this.readString(propertyNode.value);
        const members = this.atDefinition.members;
        if (members) {
            addClassMember(members, classpath);
        }
    }

    processExtends(propertyNode) {
        const parent = this.atDefinition.parent = this.readDependencyString(".js", propertyNode.value);
        this.dependencies[parent].push({type:"parent"});
    }

    processDependenciesArray(extension, storeName, propertyNode) {
        const dependencies = this.readDependenciesArray(extension, propertyNode.value);
        if (storeName) {
            this.atDefinition[storeName] = sortAndRemoveDuplicates(dependencies);
        }
    }

    processDependenciesMap(extension, storeName, propertyNode) {
        const dependencies = this.readDependenciesMap(extension, propertyNode.value);
        if (storeName) {
            this.atDefinition[storeName] = dependencies;
        }
    }

    processSingleton(propertyNode) {
        if (propertyNode.value instanceof UglifyJS.AST_Constant) {
            if (propertyNode.value.value) {
                this.atDefinition.singleton = true;
            }
        } else {
            throw new Error("Expected a boolean");
        }
    }

    processNamespaces(propertyNode) {
        beansExtractor.processNamespaces.call(this, propertyNode);
    }

    processBeans(propertyNode) {
        beansExtractor.processBeans.call(this, propertyNode);
    }

    processMember(methodKey, propertyNode) {
        const propertyNodeValue = propertyNode.value;
        if (!(propertyNode instanceof UglifyJS.AST_ObjectKeyVal) ||
                propertyNodeValue instanceof UglifyJS.AST_Constant ||
                propertyNodeValue instanceof UglifyJS.AST_Array ||
                propertyNodeValue instanceof UglifyJS.AST_Object
            ) {
            // do not include constants, arrays or objects
            return;
        }
        const membersMap = this.atDefinition.members;
        const hash = astToHash(propertyNode);
        const memberInfo = membersMap[methodKey] = {
            hash: hash
        };
        if (!(propertyNodeValue instanceof UglifyJS.AST_Function)) {
            memberInfo.type = "unknown";
            return;
        }
        propertyNodeValue.atDiffMemberInfo = memberInfo;
        memberInfo.type = "function";
        memberInfo.args = propertyNodeValue.argnames.map(arg => arg.name);
    }

    processMembersMap(prefix, propertyNode) {
        const map = propertyNode.value;
        if (!(map instanceof UglifyJS.AST_Object)) {
            throw new Error("Expected object literal");
        }
        map.properties.forEach(propertyNode => {
            if (propertyNode instanceof UglifyJS.AST_ObjectKeyVal) {
                this.processMember(`${prefix}.${propertyNode.key}`, propertyNode);
            }
        });
    }

    isAria(expression) {
        const resolvedExpr = this.resolveExpression(expression);
        if (resolvedExpr instanceof UglifyJS.AST_SymbolRef && resolvedExpr.name == "Aria" && resolvedExpr.thedef.undeclared) {
            // Aria global variable
            return true;
        }
        const requireValue = this.readRequire(resolvedExpr);
        const res = requireValue && ariaLogicalPathTest.test(requireValue);
        return res;
    }

    isModule(expression) {
        const resolvedExpr = this.resolveExpression(expression);
        return (resolvedExpr instanceof UglifyJS.AST_SymbolRef && resolvedExpr.name == "module" && resolvedExpr.thedef.undeclared);
    }

    processCall(node) {
        const requireValue = this.readRequire(node);
        if (requireValue) {
            this.requireDependencies++;
            if (!Array.isArray(this.dependencies[requireValue])) {
                this.dependencies[requireValue] = [];
            }
            return;
        }
        this.checkATDefinition(node);
    }

    processAssignment(node) {
        const left = node.left;
        if (node.operator == "=" && left instanceof UglifyJS.AST_Dot && left.property == "exports" && this.isModule(left.expression)) {
            if (this.moduleExportsNode) {
                throw new Error("Multiple module.exports assignments!");
            }
            this.moduleExportsNode = this.resolveExpression(node.right);
        }
    }

    processNode(ast, logicalPath) {
        this.logicalPath = logicalPath;
        const walker = new UglifyJS.TreeWalker(node => {
            if (node instanceof UglifyJS.AST_Call) {
                this.processCall(node);
            } else if (node instanceof UglifyJS.AST_Assign) {
                this.processAssignment(node);
            }
        });
        ast.walk(walker);
        const result = {
            type: this.type,
            flexibleHash: astToHash(ast),
            content: this.atDefinition,
            dependencies: this.dependencies
        };
        if (!this.atDefinitionNode) {
            // nothing to do
        } else if (this.requireDependencies > 0) {
            // new syntax with require
            if (result.type == "resourcesDefinition") {
                throw new Error("New dependencies syntax (with require) is not supported for resource definitions.");
            }
            if (this.oldSyntaxDependencies > 0) {
                throw new Error("New dependencies syntax (using require) should not be mixed with the old one (using $dependencies and similar).");
            }
            if (this.moduleExportsNode !== this.atDefinitionNode) {
                throw new Error("module.exports should contain the result of the Aria definition.");
            }
        } else {
            // old style
            if (this.moduleExportsNodes != null) {
                throw new Error("module.exports should not be set when using the old dependencies syntax.");
            }
        }
        if (result.content && result.type !== "resourcesDefinition" && getLogicalPath(result.content.classpath, ".js") !== logicalPath) {
            winston.warn(`${result.content.classpath} was found inside ${logicalPath}, which is unexpected.`);
        }
        return result;
    }
}

module.exports = ATInfoExtractor;
