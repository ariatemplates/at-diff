{Template { $classpath: 'x.SameFlexibleHashTpl'}   }
    // This template was modified in a way that does not change the meaning
    {var counter = 0/}

    {macro myRepeaterItem(itemInfo)}
        {@aria:Div  undefined  }
            ${itemInfo.value}
        {/@aria:Div}
    {/macro}

    {macro main()}
        {section {macro: "myMacro", bindRefreshTo: [{to:'something', inside: data}]} /}
        {call myMacro( ('a') ) /}
        {call myMacro(  "b" ) /}
        {repeater {
            content: data.myRepeaterContent,
            childSections: {
                'id': "myRepeaterElement",
                "macro": ('myRepeaterItem')
            }
        }/}
    {/macro}

{macro myMacro(param)}
{checkDefault param=("c")/}
{var statusInfo = data . my . verylong . path   .
    inside. datamodel . statusInfo  /}
{set counter += (1)/}
${ ((data . myText)) |escapeforhtml}
<div {id 'myDiv' /} {on mousedown {
    scope: moduleCtrl /* module controller */,
    fn: "clickMyDiv"
}/}>
{@aria:TextField {
    "label" : 'Status '   +  statusInfo
}/}
{if data.
    myCondition
}
    {createView myView[ (param ) ][0] on data [ param ] . myArray1 /}
    <ul>
    {foreach item inView myView [ (param) ] [ (0) ]}
        <li>${ (item . value) }</li>
    {/foreach}
    </ul>
{elseif  data . myOtherCondition  /}
    {createView myView[ param   ][1] on data [param] .
        myArray2   /}
    {foreach item inView (myView [param] [0])}
        {separator} ,{/separator}
        ${ item.value }
    {/foreach}
{else/}
    Nothing to display! // this is just a different comment
{/if}
</div>
{/macro}

{/Template}
