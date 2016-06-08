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
const astToHash = require("../../utils/uglify/astToHash");
const hashJson = require("../../utils/hashJson");
const UglifyJS = require("uglify-js");
const beanNameRegExp = /^[a-zA-Z_\$][\w\$]*$/;

function buildBeanName (prefix, shortName, dontCheck) {
    if (!(dontCheck || beanNameRegExp.test(shortName))) {
        throw new Error(`Invalid bean name ${shortName} ${prefix ? `in ${prefix}` : ""}`);
    }
    return prefix ? `${prefix}.${shortName}` : shortName;
}

function restrictPossibleBaseTypes(beanName, possibleBaseTypes) {
    const possibleBaseTypesMap = this.possibleBaseTypes;
    let curBeanBaseTypes = possibleBaseTypesMap[beanName];
    if (curBeanBaseTypes) {
        curBeanBaseTypes = curBeanBaseTypes.filter(baseType => possibleBaseTypes.indexOf(baseType) > -1);
        if (curBeanBaseTypes.length === 0) {
            throw new Error(`${beanName} contains incompatible properties (some properties reserved for type ${possibleBaseTypesMap[beanName].join(" or ")} and some properties reserved for type ${possibleBaseTypes.join(" or ")}`);
        }
    } else {
        curBeanBaseTypes = possibleBaseTypes;
    }
    possibleBaseTypesMap[beanName] = curBeanBaseTypes;
}

const beanProperties = {
    // cf aria.core.BaseTypes

    // General properties:
    "$description"(beanName, beanInfo, value) {
        beanInfo.attributes.$description = astToHash(value);
    },
    "$type"(beanName, beanInfo, value) {
        if (!(value instanceof UglifyJS.AST_String)) {
            throw new Error(`Expected an string literal in ${beanName}.$type`);
        }
        const typeName = value.value;
        const colon = typeName.indexOf(":");
        let typeInNamespace;
        let namespaceObject;
        let namespaceDependency;
        if (colon == -1) {
            typeInNamespace = typeName;
            namespaceObject = this.atDefinition.beansUsages;
        } else {
            // reference to an external type
            const namespaceKey = typeName.slice(0, colon);
            typeInNamespace = typeName.slice(colon + 1);
            namespaceDependency = this.namespaces[namespaceKey];
            if (!namespaceDependency) {
                throw new Error(`Undefined namespace ${namespaceKey}`);
            }
            namespaceObject = this.atDefinition.namespacesUsages[namespaceDependency];
        }
        let typeUsages = namespaceObject[typeInNamespace];
        if (!typeUsages) {
            typeUsages = namespaceObject[typeInNamespace] = [];
        }
        typeUsages.push(beanName);
        beanInfo.attributes.$type = `${namespaceDependency ? `${namespaceDependency}:` : "" }${typeInNamespace}`;
    },
    "$sample"(beanName, beanInfo, value) {
        beanInfo.attributes.$sample = astToHash(value);
    },
    "$default"(beanName, beanInfo, value) {
        beanInfo.attributes.$default = astToHash(value);
    },
    "$mandatory"(beanName, beanInfo, value) {
        if (!(value instanceof UglifyJS.AST_Boolean)) {
            throw new Error(`Expected a boolean literal in ${beanName}.$mandatory`);
        }
        beanInfo.attributes.$mandatory = value.value;
    },

    // For type String
    "$regExp"(beanName, beanInfo, value) {
        restrictPossibleBaseTypes.call(this, beanName, ["String"]);
        beanInfo.attributes.$regExp = astToHash(value);
    },

    // For types Integer and Float:
    "$minValue"(beanName, beanInfo, value) {
        restrictPossibleBaseTypes.call(this, beanName, ["Integer", "Float"]);
        beanInfo.attributes.$minValue = astToHash(value);
    },
    "$maxValue"(beanName, beanInfo, value) {
        restrictPossibleBaseTypes.call(this, beanName, ["Integer", "Float"]);
        beanInfo.attributes.$maxValue = astToHash(value);
    },

    // For type ObjectRef:
    "$classpath"(beanName, beanInfo, value) {
        restrictPossibleBaseTypes.call(this, beanName, ["ObjectRef"]);
        beanInfo.attributes.$classpath = astToHash(value);
    },

    // For type Enum:
    "$enumValues"(beanName, beanInfo, value) {
        if (!(value instanceof UglifyJS.AST_Array)) {
            throw new Error(`Expected an array literal in ${beanName}.$enumValues`);
        }
        restrictPossibleBaseTypes.call(this, beanName, ["Enum"]);
        beanInfo.attributes.$enumValues = hashJson(value.elements.map((node, index) => {
            if (!value instanceof UglifyJS.AST_String) {
                throw new Error(`Expected a string literal in ${beanName}.$enumValues[${index}]`);
            }
            return node.value;
        }).sort());
    },

    // For type Object:
    "$properties"(beanName, beanInfo, value) {
        restrictPossibleBaseTypes.call(this, beanName, ["Object"]);
        beanInfo.$properties = processPropertiesMap.call(this, beanName, value);
    },
    "$restricted"(beanName, beanInfo, value) {
        if (!(value instanceof UglifyJS.AST_Boolean)) {
            throw new Error(`Expected a boolean literal in ${beanName}.$restricted`);
        }
        restrictPossibleBaseTypes.call(this, beanName, ["Object"]);
        beanInfo.attributes.$restricted = value.value;
    },

    // For types Array and Map:
    "$contentType"(beanName, beanInfo, value) {
        restrictPossibleBaseTypes.call(this, beanName, ["Array", "Map"]);
        processBean.call(this, buildBeanName.call(this, beanName, "$contentType", true), value);
        beanInfo.$contentType = true;
    },

    // For type Map:
    "$keyType"(beanName, beanInfo, value) {
        restrictPossibleBaseTypes.call(this, beanName, ["Map"]);
        processBean.call(this, buildBeanName.call(this, beanName, "$keyType", true), value);
        beanInfo.$keyType = true;
    },

    // For type MultiTypes:
    "$contentTypes"(beanName, beanInfo, value) {
        if (!(value instanceof UglifyJS.AST_Array)) {
            throw new Error(`Expected an array literal in ${beanName}.$contentTypes`);
        }
        restrictPossibleBaseTypes.call(this, beanName, ["MultiTypes"]);
        beanInfo.$contentTypes = value.elements.map((element, index) => {
            const shortName = `$contentTypes[${index}]`;
            processBean.call(this, buildBeanName.call(this, beanName, shortName, true), element);
            return shortName;
        });
    }

};

function processBean (beanName, objectNode) {
    if (!(objectNode instanceof UglifyJS.AST_Object)) {
        throw new Error(`Expected an object literal in ${beanName}`);
    }
    const beanInfo = {
        attributes: {}
    };
    this.atDefinition.beans[beanName] = beanInfo;

    objectNode.properties.forEach(propertyNode => {
        if (!propertyNode instanceof UglifyJS.AST_ObjectKeyVal) {
            throw new Error("Expected a property");
        }
        const key = propertyNode.key;
        const handler = beanProperties[key];
        if (handler) {
            handler.call(this, beanName, beanInfo, propertyNode.value);
        } else {
            winston.warn(`Invalid ${key} in ${beanName} in ${this.logicalPath}`);
        }
        if (beanInfo.attributes.$default && beanInfo.attributes.$mandatory) {
            throw new Error(`${beanName} both has a default value and is mandatory.`);
        }
        if (beanInfo.attributes.$default) {
            beanInfo.attributes.$mandatory = false;
        }
    });
    beanInfo.hash = hashJson(beanInfo.attributes);
}

function processPropertiesMap (prefix, objectNode) {
    if (!(objectNode instanceof UglifyJS.AST_Object)) {
        throw new Error("Expected an object literal");
    }
    const properties = [];
    objectNode.properties.map((propertyNode) => {
        if (!(propertyNode instanceof UglifyJS.AST_ObjectKeyVal)) {
            throw new Error("Expected a property");
        }
        processBean.call(this, buildBeanName.call(this, prefix, propertyNode.key), propertyNode.value);
        properties.push(propertyNode.key);
    });
    properties.sort();
    return properties;
}

exports.processAtDefinition = function () {
    const atDefinition = this.atDefinition;
    atDefinition.beans = {};
    atDefinition.beansUsages = Object.create(null);
    const namespacesUsages = atDefinition.namespacesUsages = Object.create(null);
    this.possibleBaseTypes = Object.create(null);
    this.namespaces = Object.create(null);

    // namespaces
    if (this.namespacesNode) {
        this.namespacesNode.properties.forEach(propertyNode => {
            if (!(propertyNode instanceof UglifyJS.AST_ObjectKeyVal)) {
                throw new Error("Expected a property");
            }
            const dependency = this.readDependencyString(".js", propertyNode.value);
            const key = propertyNode.key;
            this.namespaces[key] = dependency;
            const namespaceObject = namespacesUsages[dependency];
            if (!namespaceObject) {
                namespacesUsages[dependency] = Object.create(null);
                this.dependencies[dependency].push({
                    type: "namespace"
                });
            }
        });
    }

    // beans:
    if (this.beansNode) {
        processPropertiesMap.call(this, "", this.beansNode);
    }
};

exports.processBeans = function (propertyNode) {
    if (!(propertyNode instanceof UglifyJS.AST_ObjectKeyVal)) {
        throw new Error("Expected a property");
    }
    this.beansNode = propertyNode.value;
};

exports.processNamespaces = function (propertyNode) {
    if (!(propertyNode instanceof UglifyJS.AST_ObjectKeyVal)) {
        throw new Error("Expected a property");
    }
    const valueNode = propertyNode.value;
    if (!(valueNode instanceof UglifyJS.AST_Object)) {
        throw new Error("Expected dependencies map.");
    }
    this.namespacesNode = valueNode;
};
