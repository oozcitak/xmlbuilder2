import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/98
  $$.test(`#98 - When converting from xml string to js object, & might be double escaped`, () => {
    const xmlStr = $$.t`
    <description>I'm &lt;b&gt;bold&lt;/b&gt;</description>
    `

    const obj = $$.create(xmlStr).end({ format: 'object' })
    $$.deepEqual(obj,
      {
        description: "I'm &lt;b&gt;bold&lt;/b&gt;"
      }
    )
  })

})
