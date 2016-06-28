# Operations supported by at-diff

*at-diff* can execute the following operations:

## parse

The *parse* operation parses a set of source files and creates a json file containing relevant pieces of information from each source file, including:

* the list of dependencies
* the list of macros/methods
* hash values computed from different parts of the file

The *parse* operation is the only one which directly reads source files. Other operations rely on the output of the *parse* operation.

## compare

The *compare* operation compares two different versions of a set of source files (provided as two different json files produced by the *parse* operation). It generates a list of *changes* and a list of *impacts*.

A *change* directly corresponds to a modification in a source file (for example, method `myMethod` was changed in file `x/y/MyClass.js`).

A *change* can have zero or more *impacts* in both the changed file and depending files, including transitive dependencies (for example, if the `x/y/MyChildClass.js` class inherits from `x/y/MyClass.js`, there is an impact on `x/y/MyChildClass.js` if `myMethod` was changed in file `x/y/MyClass.js`).

In its output, the *compare* operation keeps the links between an *impact* and the set of other *impacts* or *changes* which caused it.

The output of the *compare* operation can be saved either in the json or in the html format (or both).

## evalimpacts

The *evalimpacts* operation evaluates the impacts of a change in a set of source files (which is described by the output of the *compare* operation) on another set of source files which depends on the first set of source files (and which is provided by the output of the *parse* operation).

The output of the *evalimpacts* operation is similar to the output of the *compare* operation and can be either in the json or in the html format (or both).
