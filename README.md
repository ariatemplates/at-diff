# at-diff

[![Build Status](https://travis-ci.org/ariatemplates/at-diff.svg?branch=master)](https://travis-ci.org/ariatemplates/at-diff)

*at-diff* is a tool to compare different versions of a source code which uses the [Aria Templates](http://ariatemplates.com) framework.

Unlike the traditional [*diff*](https://en.wikipedia.org/wiki/Diff_utility) utility which mainly compares lines without interpreting them, *at-diff* mainly compares class methods and takes into account class inheritance. By listing possible impacts, it aims at detecting breaking changes, and at helping a developer to update some source code when one of the libraries it uses changed.

Note that you should not rely only on *at-diff* to find possible breaking changes. *at-diff* does not replace tests. It cannot detect all breaking changes.

*at-diff* can be used both from the command line and as a [Grunt](http://gruntjs.com/) task.

*at-diff* is tested with node.js version 4.2. It probably works fine with later versions. It may not work with previous versions.

**Warning: *at-diff* is still in development and not thoroughly tested yet. You can provide feedback by opening [an issue on GitHub](https://github.com/ariatemplates/at-diff/issues)**

## Operations

*at-diff* can execute the following operations:

### parse

The *parse* operation parses a set of source files and creates a json file containing relevant pieces of information from each source file, including:

* the list of dependencies
* the list of macros/methods
* hash values computed from different parts of the file

The *parse* operation is the only one which directly reads source files. Other operations rely on the output of the *parse* operation.

### compare

The *compare* operation compares two different versions of a set of source files (provided as two different json files produced by the *parse* operation). It generates a list of *changes* and a list of *impacts*.

A *change* directly corresponds to a modification in a source file (for example, method `myMethod` was changed in file `x/y/MyClass.js`).

A *change* can have zero or more *impacts* in both the changed file and depending files, including transitive dependencies (for example, if the `x/y/MyChildClass.js` class inherits from `x/y/MyClass.js`, there is an impact on `x/y/MyChildClass.js` if `myMethod` was changed in file `x/y/MyClass.js`).

In its output, the *compare* operation keeps the links between an *impact* and the set of other *impacts* or *changes* which caused it.

The output of the *compare* operation can be saved either in the json or in the html format (or both).

### evalimpacts

The *evalimpacts* operation evaluates the impacts of a change in a set of source files (which is described by the output of the *compare* operation) on another set of source files which depends on the first set of source files (and which is provided by the output of the *parse* operation).

The output of the *evalimpacts* operation is similar to the output of the *compare* operation and can be either in the json or in the html format (or both).

## File types

*at-diff* recognizes the following file types:

* Javascript files, with the `.js` extension
* Aria Templates template files with the `.tpl`, `.tpl.css`, `.tml`, `.cml` or `.tpl.txt` extensions
* Binary files, which correspond to any other file

### Javascript files

Javascript files are parsed with [uglify-js](https://github.com/mishoo/UglifyJS2). Only ECMAScript 5 is supported.

A flexible hash is computed in order to ignore reformatting changes, including changes in comments.

CommonJS-style dependencies (with `require`) are recognized. Note that only dependencies expressed as a string literal are interpreted. If there is an expression in the call to `require`, it is simply ignored.

*at-diff* looks for a call to one of the following Aria Templates definition functions:

* `Aria.classDefinition`
* `Aria.tplScriptDefinition`
* `Aria.interfaceDefinition`
* `Aria.beansDefinition`
* `Aria.resourcesDefinition`

There should be at most one call to one of those functions in a given file.

Support for files which do not contain any Aria Templates definition is very limited: only CommonJS-style dependencies are recognized, and only generic `UnknownChange` changes and `UnknownImpact` impacts will be generated in case any change is done on such files.

In the same way, support for `Aria.interfaceDefinition`, `Aria.beansDefinition` and `Aria.resourcesDefinition` is also currently very limited. The content of the `$interface`, or `$beans` or `$resources` fields is not interpreted. Only dependencies are recognized, either in the CommonJS style or in the classpath style.

Note that the parameter passed to the Aria definition function must be an object literal. For example, the following declaration cannot be recognized successfully:

```js
var myClass = {
    $classpath: "x.y.MyClass",
    $prototype: {
        myMethod: function () {}
    }
};
Aria.classDefinition(myClass);
```

To be accepted, the previous definition should be written in the following way:

```js
Aria.classDefinition({
    $classpath: "x.y.MyClass",
    $prototype: {
        myMethod: function () {}
    }
});
```

Note that even if Aria Templates accepts it, *at-diff* does not support having a function as the `$prototype` property, it has to be an object literal.

To be correctly interpreted, method members should be function literals (and not expressions).
For example, this should be avoided:

```js
var myMethod = function () {};
Aria.classDefinition({
    $classpath: "x.y.MyClass",
    $prototype: {
        myMethod: myMethod
    }
});
```

This is better interpreted:

```js
Aria.classDefinition({
    $classpath: "x.y.MyClass",
    $prototype: {
        myMethod: function () {}
    }
});
```

The following items are compared:

* `$constructor`
* `$destructor`
* Functions in `$prototype`
* Functions in `$statics`

Changes outside of those fields may not be detected.

### Aria Templates template files

Aria Templates template files are parsed with Aria Templates directly.

A flexible hash is computed in order to ignore some reformatting changes, including changes in comments and in the order of macros.

The following items are compared:

* macros
* `$hasScript`
* macro libraries

Macro calls are detected and taken into account to report problems. For example, if a macro calls another macro and that macro removed, the `RemovedMemberStillUsed` impact will be generated.

The detection of macro calls is only done with the `call`, `section` and `repeater` statements, and only when the macro is referenced statically (with a string literal). Macro calls done through widgets (such as `@aria:Dialog`, `@aria:Tooltip` or custom widgets) are not recognized.

### Binary files

The content of binary files is not interpreted. The hash is recorded in order to detect any change. Generic `UnknownChange` changes and `UnknownImpact` impacts will be generated in case any change is done on such files.

## Command line usage

Install at-diff globally:

```
npm install -g at-diff
```
Now, the `at-diff` command is available, and can be used to execute each operation.

### parse

It is possible to execute the *parse* operation with the following command:

```
at-diff parse src --json-output atdiff-data.json
```

* `src` is the directory containing source code
* `atdiff-data.json` is the json file which will contain the output

You can also use the following options:

* `--at-setup atSetupFile.js` Specifies a js file to execute in order to configure the Aria Templates environment used when parsing templates. This is especially useful to configure global widget libraries. This option can be repeated multiple times.
* `--load-parser-cache previousOutput.json` Specifies a previous output of the *parse* operation to be loaded in the cache to speed up the *parse* operation in case files did not change. This option can be repeated multiple times.
* `--filter **/*` Specifies the pattern to use to create the list of files to be parsed. The default filter is `**/*`.
* `--ignore **/*.bak` Specifies a pattern to exclude from the list of files to be parsed. This option can be repeated multiple times.
* `--json-beautify` This option can be used to beautify the output
* `--console-output` This option can be used to display the resulting json file on the console.

### compare

It is possible to execute the *compare* operation with the following command:

```
at-diff compare atdiff-data1.json atdiff-data2.json --json-output atdiff-comparison.json --html-output atdiff-comparison.html
```

You can also use the following options:

* `--open` Open the html file in a browser when the comparison is done. This is only taken into account if the `--html-output` option is used.
* `--json-beautify` This option can be used to beautify the output
* `--console-output` This option can be used to display the resulting json file on the console.

It is also possible to parse and immediately compare in one command:

```
at-diff parse+compare src1 src2
```

In that case, any of the *parse* options can be used as well.

### evalimpacts

```
at-diff evalimpacts atdiff-comparison.json atdiff-data.json --json-output atdiff-impacts.json --html-output atdiff-impacts.html
```

The same options as for the *compare* operation are available.

It is also possible to parse the impacted source files and immediately evaluate the impacts in one command, as shown below. Note that the *compare* operation still has to be done before separately.

```
at-diff parse+evalimpacts atdiff-comparison.json src-folder --json-output atdiff-impacts.json --html-output atdiff-impacts.html
```

In that case, any of the *parse* options can be used as well.

## Usage with Grunt

* Install `at-diff` in the `node_modules` folder of the project where you intend to use it (probably as a development dependency):

```
npm install --save-dev at-diff
```

* Add the following line in the `gruntfile.js` file of your project:

```js
grunt.loadNpmTasks("at-diff");
```

* Configure the tasks you intend to use. There are 3 different available tasks corresponding to the 3 operations described earlier in this page.

### parse

```js
grunt.initConfig({

    // ...

    "at-diff-parse": {
        // at-diff-parse is a multi-task, so it can have multiple executions configured with different
        // names (such as 'parse' here):
        parse: {
            options: {
                jsonOutput: "at-diff-output/atdiff-data.json",

                // The loadParserCache option specifies a set of previous outputs of the *parse* operation
                // to be initially loaded in the cache to speed up the *parse* operation in case files
                // did not change:
                loadParserCache: [],

                // The atSetup option specifies a set of js files to execute in order to configure the
                // Aria Templates environment used when parsing templates. This is especially useful
                // to configure global widget libraries.
                atSetup: [],

                // The cache option allows to specify the name of a cache which will be shared among
                // multiple at-diff-parse executions (note that such a cache is not stored on the disk,
                // it is only kept in RAM while the grunt process is alive). It can be any string.
                // It can be "none" to disable caching between multiple at-diff-executions. It is set
                // to "default" by default.
                cache: "default"
            },
            filter: "isFile",
            cwd: "src",
            src: ["**"]
        }
    }

    // ...

});
```

Note that the set of files to be parsed can be defined in [any of the ways defined in the Grunt documentation](http://gruntjs.com/configuring-tasks#files).
If the patterns set in the `src` field also match directories, it is important to specify the `filter: "isFile"` property (as shown on the previous example) to avoid the `EISDIR: illegal operation on a directory` error.

### compare

```js
grunt.initConfig({

    // ...

    "at-diff-compare": {
        // at-diff-compare is a multi-task, so it can have multiple executions configured with different
        // names (such as 'compare' here):
        compare: {
            options: {
                version1: "at-diff-input/atdiff-data1.json",
                version2: "at-diff-input/atdiff-data2.json",
                jsonOutput: "at-diff-output/atdiff-comparison.json",
                htmlOutput: "at-diff-output/atdiff-comparison.html"
            }
        }
    }

    // ...

})
```

### evalimpacts

```js
grunt.initConfig({

    // ...

    "at-diff-evalimpacts": {
        // at-diff-compare is a multi-task, so it can have multiple executions configured with different
        // names (such as 'evalimpacts' here):
        evalimpacts: {
            options: {
                versionsDiff: "at-diff-input/atdiff-comparison.json",
                impactedFiles: "at-diff-input/atdiff-data.json",
                jsonOutput: "at-diff-output/atdiff-impacts.json",
                htmlOutput: "at-diff-output/atdiff-impacts.html"
            }
        }
    }

    // ...

});
```

## License

[Apache License 2.0](https://github.com/ariatemplates/at-diff/blob/master/LICENSE)
