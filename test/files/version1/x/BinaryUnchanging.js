/**
 * This class will not change between version 1 and version 2.
 * As a consequence, it will only be parsed once (because of the cache).
 */
var Aria = require("ariatemplates/Aria");

module.exports = Aria.classDefinition({
    $classpath: "x.BinaryUnchanging",
    $prototype: {
        add: function(x, y) {
            return x + y;
        },

        multiply: function(x, y) {
            return x * y;
        }
    }
});
