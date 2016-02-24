{Template {
    $classpath: "y.UsesMacroLibWithMemberRemoved1",
    $macrolibs: {
        "myMacroLib": "x.MacroLibWithMemberRemoved"
    }
}}

    {macro main()}
        {call myMacroLib.myMacro1() /}
    {/macro}

{/Template}
