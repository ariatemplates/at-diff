# Using at-diff with grunt

* Install `at-diff` in the `node_modules` folder of the project where you intend to use it (probably as a development dependency):

```
npm install --save-dev at-diff
```

* Add the following line in the `gruntfile.js` file of your project:

```js
grunt.loadNpmTasks("at-diff");
```

* Configure the tasks you intend to use. There are 3 different available tasks corresponding to the 3 operations described in [this page](./operations.html).

## parse

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

## compare

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

                // it is also possible to filter impacts or changes with the filterImpacts or filterChanges properties
                // which can accept:
                // - an array of impact/change types to keep in the output files
                // - a comma-separated string of impact/change types to keep in the output files
                // - a filter function called for each impact/change, receiving the impact/change object as
                //     an argument and returning a boolean specifying whether to include that impact/change
                //     or not in the output files

            }
        }
    }

    // ...

})
```

## evalimpacts

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

                // it is also possible to filter impacts with the filterImpacts property
                // which can accept:
                // - an array of impact types to keep in the output files
                // - a comma-separated string of impact types to keep in the output files
                // - a filter function called for each impact, receiving the impact object as
                //     an argument and returning a boolean specifying whether to include that impact
                //     or not in the output files
            }
        }
    }

    // ...

});
```
