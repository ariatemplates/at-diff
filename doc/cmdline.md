# Using at-diff from the command line

*at-diff* is tested with node.js version 4.2. It probably works fine with later versions. It may not work with previous versions.

Make sure you have node.js version 4.2 or later:

```
node --version
```

Install at-diff globally:

```
npm install -g at-diff
```

Now, the `at-diff` command is available, and can be used to execute each operation.

## parse

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
* `--json-beautify` This option can be used to beautify the output.
* `--console-output` This option can be used to display the resulting json file on the console.
* `--deterministic-output` This option can be used to produce a file that is easier to compare with other files of the same kind (with classic diff tools): json keys are sorted so that the order in which files are parsed does not impact the output.

## compare

It is possible to execute the *compare* operation with the following command:

```
at-diff compare atdiff-data1.json atdiff-data2.json --json-output atdiff-comparison.json --html-output atdiff-comparison.html
```

You can also use the following options:

* `--open` Open the html file in a browser when the comparison is done. This is only taken into account if the `--html-output` option is used.
* `--json-beautify` This option can be used to beautify the output.
* `--console-output` This option can be used to display the resulting json file on the console.
* `--deterministic-output` This option can be used to produce a file that is easier to compare with other files of the same kind (with classic diff tools): the resulting json file contains meaningful ids instead of sequential ones and json keys are sorted so that the order in which files are compared does not impact the output. When this option is present, the output file is significantly larger and maybe a bit slower to generate.

It is also possible to parse and immediately compare in one command:

```
at-diff parse+compare src1 src2
```

In that case, any of the *parse* options can be used as well.

## evalimpacts

```
at-diff evalimpacts atdiff-comparison.json atdiff-data.json --json-output atdiff-impacts.json --html-output atdiff-impacts.html
```

The same options as for the *compare* operation are available.

It is also possible to parse the impacted source files and immediately evaluate the impacts in one command, as shown below. Note that the *compare* operation still has to be done before separately.

```
at-diff parse+evalimpacts atdiff-comparison.json src-folder --json-output atdiff-impacts.json --html-output atdiff-impacts.html
```

In that case, any of the *parse* options can be used as well.
