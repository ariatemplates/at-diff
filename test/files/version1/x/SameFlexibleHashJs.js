/*global Aria:false*/

/**
 * File
 */

Aria.classDefinition({
    $classpath: "x.SameFlexibleHashJs",
    $prototype: {
        multiplySumAndDifference: function (arg1, arg2) {
            // This should be equivalent to:
            // this.multiply(arg1, arg1) - this.multiply(arg2, arg2)
            return this.multiply(arg1 + arg2, arg1 - arg2);
        },

        multiply: function (arg1, arg2) {
            return arg1 * arg2;
        }
    }
});
