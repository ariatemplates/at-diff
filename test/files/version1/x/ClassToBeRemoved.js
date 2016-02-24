var Aria = require("ariatemplates/Aria");

module.exports = Aria.classDefinition({
    $classpath: "x.ClassToBeRemoved",
    $prototype: {
        myMethod: function() {
            return "This method is useless";
        }
    }
});
