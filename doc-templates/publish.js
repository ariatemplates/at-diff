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

const co = require("co");
const fs = require("graceful-fs");
const path = require("path");
const marked = require("marked");
const hljs = require("highlight.js");
const promisify = require("pify");
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const pagesOrder = Object.keys(require("../doc/pages.json"));
const _ = require("lodash");

hljs.configure({
    classPrefix: ""
});

marked.setOptions({
    gfm: true,
    highlight: function(content, language) {
        if (language) {
            return hljs.highlight(language, content).value;
        } else {
            return content;
        }
    }
});

const sortPages = (a, b) => pagesOrder.indexOf(a.name) - pagesOrder.indexOf(b.name);
const sortChangesImpacts = (a, b) => a.name === b.name ? 0 : a.name > b.name ? 1 : -1;

exports.publish = co.wrap(function * (data, opts, tutorials) {
    data({undocumented:true}).remove();
    const impactsTemplateSrc = yield readFile(path.join(__dirname, "impactsTemplate.html"));
    const impactsTemplateFn = _.template(impactsTemplateSrc);
    const docs = data().get();
    const changesAndImpacts = {
        changes: [],
        impacts: []
    };
    docs.forEach(doc => {
        if (doc.tags) {
            doc.tags.forEach(tag => {
                doc[`tag-${tag.title}`] = tag;
            });
        }
        if (doc["tag-atdiff-change"]) {
            changesAndImpacts.changes.push(doc);
        }
        if (doc["tag-atdiff-impact"]) {
            changesAndImpacts.impacts.push(doc);
        }
    });
    changesAndImpacts.changes.sort(sortChangesImpacts);
    changesAndImpacts.impacts.sort(sortChangesImpacts);
    tutorials.children.sort(sortPages);
    tutorials.children.push({
        longname: "impacts",
        name: "impacts",
        title: "List of changes/impacts",
        content: impactsTemplateFn(changesAndImpacts),
        type: 1,
        parent: tutorials
    });
    const pagesTemplateSrc = yield readFile(path.join(__dirname, "pagesTemplate.html"));
    const pagesTemplateFn = _.template(pagesTemplateSrc);
    const destination = opts.destination;
    yield mkdir(destination);
    yield Promise.all(tutorials.children.map(co.wrap(function * (tutorial) {
        if (tutorial.type == 2) {
            tutorial.content = marked(tutorial.content).
                                replace(/<pre><code/g, "<div class='snippet'><pre><code").
                                replace(/<\/code><\/pre>/g, "</code></pre></div>");
        }
        const content = pagesTemplateFn(tutorial);
        const outputFile = path.join(destination, `${tutorial.name}.html`);
        yield writeFile(outputFile, content);
    })));
});
