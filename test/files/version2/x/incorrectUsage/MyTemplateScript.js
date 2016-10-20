var Aria = require("ariatemplates/Aria");

// This should be a tplScriptDefinition... but is instead a bean definition
module.exports = Aria.beanDefinitions({
    $package: "x.incorrectUsage.MyTemplateScript",
    $beans: {}
});
