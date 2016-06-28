# at-diff

[![Build Status](https://travis-ci.org/ariatemplates/at-diff.svg?branch=master)](https://travis-ci.org/ariatemplates/at-diff)

*at-diff* is a tool to compare different versions of a source code which uses the [Aria Templates](http://ariatemplates.com) framework.

Unlike the traditional [*diff*](https://en.wikipedia.org/wiki/Diff_utility) utility which mainly compares lines without interpreting them, *at-diff* mainly compares class methods or bean definitions and takes into account inheritance. By listing possible impacts, it aims at detecting breaking changes, and at helping a developer to update some source code when one of the libraries it uses changed.

Note that you should not rely only on *at-diff* to find possible breaking changes. *at-diff* does not replace tests. It cannot detect all breaking changes.

*at-diff* can be used both from the command line and as a [Grunt](http://gruntjs.com/) task.

*at-diff* is tested with node.js version 4.2. It probably works fine with later versions. It may not work with previous versions.

**Warning: *at-diff* is still in development and not thoroughly tested yet. You can provide feedback by opening [an issue on GitHub](https://github.com/ariatemplates/at-diff/issues)**

Check the documentation [here](http://ariatemplates.github.io/at-diff).

## License

[Apache License 2.0](https://github.com/ariatemplates/at-diff/blob/master/LICENSE)
