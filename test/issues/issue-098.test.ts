import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/98
  test(`#98 - When converting from xml string to js object, & might be double escaped`, () => {
    const xmlStr = $$.t`
    <description>I'm &lt;b&gt;bold&lt;/b&gt;</description>
    `

    const obj = $$.create(xmlStr).end({ format: 'object' })
    expect(obj).toEqual(
      { 
        description: "I'm &lt;b&gt;bold&lt;/b&gt;" 
      }
    )
  })

})
