# File types recognized by at-diff

*at-diff* recognizes the following file types:

* Javascript files, with the `.js` extension
* Aria Templates template files with the `.tpl`, `.tpl.css`, `.tml`, `.cml` or `.tpl.txt` extensions
* Binary files, which correspond to any other file

## Javascript files

Javascript files are parsed with [uglify-js](https://github.com/mishoo/UglifyJS2). Only ECMAScript 5 is supported.

A flexible hash is computed in order to ignore reformatting changes, including changes in comments.

CommonJS-style dependencies (with `require`) are recognized. Note that only dependencies expressed as a string literal are interpreted. If there is an expression in the call to `require`, it is simply ignored.

*at-diff* looks for a call to one of the following Aria Templates definition functions:

* `Aria.classDefinition`
* `Aria.tplScriptDefinition`
* `Aria.beansDefinition`
* `Aria.interfaceDefinition`
* `Aria.resourcesDefinition`

There should be at most one call to one of those functions in a given file.

Support for files which do not contain any Aria Templates definition is very limited: only CommonJS-style dependencies are recognized, and only generic `UnknownChange` changes and `UnknownImpact` impacts will be generated in case any change is done on such files.

In the same way, support for `Aria.interfaceDefinition` and `Aria.resourcesDefinition` is also currently very limited. The content of the `$interface` or `$resources` fields is not interpreted. Only dependencies are recognized, either in the CommonJS style or in the classpath style.

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

The following items are compared in the parameter of `Aria.classDefinition` or `Aria.tplScriptDefinition`:

* `$constructor`
* `$destructor`
* Functions in `$prototype`
* Functions in `$statics`

Changes outside of those fields may not be detected.

## Aria Templates template files

Aria Templates template files are parsed with Aria Templates directly.

A flexible hash is computed in order to ignore some reformatting changes, including changes in comments and in the order of macros.

The following items are compared:

* macros
* `$hasScript`
* macro libraries

Macro calls are detected and taken into account to report problems. For example, if a macro calls another macro and that macro removed, the `RemovedMemberStillUsed` impact will be generated.

The detection of macro calls is only done with the `call`, `section` and `repeater` statements, and only when the macro is referenced statically (with a string literal). Macro calls done through widgets (such as `@aria:Dialog`, `@aria:Tooltip` or custom widgets) are not recognized.

## Binary files

The content of binary files is not interpreted. The hash is recorded in order to detect any change. Generic `UnknownChange` changes and `UnknownImpact` impacts will be generated in case any change is done on such files.
