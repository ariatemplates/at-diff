{Template {
    $classpath: "y.UsesMacroLibWithMemberRemoved2",
    $macrolibs: {
        "myMacroLib": "x.MacroLibWithMemberRemoved"
    }
}}

    {macro main()}
        {call myMacroLib.myMacro2() /}
    {/macro}

{/Template}
