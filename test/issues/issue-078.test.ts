import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  const obj = { 
    title: {
      $: null
    },
    description: 'Test description'
  }

  // https://github.com/oozcitak/xmlbuilder2/issues/78
  test(`#78 - Throws TypeError: Cannot read property 'indexOf' of null when use null in CDATA ($)`, () => {   
    const doc = $$.create()
      .ele('root').ele(obj).end({prettyPrint: true, headless: true })

    expect(doc).toBe($$.t`
    <root>
      <title/>
      <description>Test description</description>
    </root>
    `)
  })

  test(`#78 - Throws TypeError: Cannot read property 'indexOf' of null when use null in CDATA ($) - callback`, (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })
      .ele('root').ele(obj).end()

    $$.expectCBResult(xmlStream, $$.t`
    <root>
      <title/>
      <description>Test description</description>
    </root>
    `, done)
  })

})
