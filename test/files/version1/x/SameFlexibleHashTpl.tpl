/*
 * This is a template
 */
{Template {
    $classpath: "x.SameFlexibleHashTpl"
}}
    {var counter = 0/}

    {macro main()}
        {section {
            macro: "myMacro",
            bindRefreshTo: [{ to : "something", inside: data}]
        } /}
        {call myMacro("a") /}
        {call myMacro("b") /}
        {repeater {
            content: data.myRepeaterContent,
            childSections: {
                id: "myRepeaterElement",
                macro: "myRepeaterItem"
            }
        }/}
    {/macro}

    {macro myRepeaterItem(itemInfo)}
        {@aria:Div}
            ${itemInfo.value}
        {/@aria:Div}
    {/macro}

    {macro myMacro(param)}
        {checkDefault param="c"/}
        {var statusInfo = data.my.verylong.path.inside.datamodel.statusInfo/}
        {set counter+=1/}
        ${data.myText|escapeforhtml}
        <div {id "myDiv" /} {on mousedown {scope: moduleCtrl, fn: "clickMyDiv"}/}>
            {@aria:TextField {
                label: "Status " + statusInfo
            }/}
            {if data.myCondition}
                {createView myView[param][0] on data[param].myArray1/}
                <ul>
                {foreach item inView myView[param][0]}
                    <li>${item.value}</li>
                {/foreach}
                </ul>
            {elseif data.myOtherCondition/}
                {createView myView[param][1] on data[param].myArray2/}
                {foreach item inView myView[param][0]}
                    {separator} ,{/separator}
                    ${item.value}
                {/foreach}
            {else/}
                Nothing to display! // this is just a comment
            {/if}
        </div>
    {/macro}

{/Template}
