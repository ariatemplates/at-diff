{Template {
    $classpath: "y.overridesParentDependency.ParentTemplate",
    $macrolibs: {
        "myMacroLib": "x.FourMemberImpacts"
    }
}}

    {macro main()}
        {call myMacroLib.myMacroToChangeImplementation() /}
    {/macro}

{/Template}
