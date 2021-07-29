import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/88
  test(`#88 - DOM textContent returns encoded text`, () => {
    const xmlStr = $$.t`
    <?xml version="1.0" encoding="utf-8"?>
    <root>
      <text>&lt;data&gt;</text>
      <text><![CDATA[<data>]]></text>
    </root>
    `

    const doc = $$.create(xmlStr);
    expect(doc.root().first().first().node.textContent).toBe('<data>')
    expect(doc.end({ headless: true, prettyPrint: true})).toBe($$.t`
    <root>
      <text>&lt;data&gt;</text>
      <text><![CDATA[<data>]]></text>
    </root>
    `);
  })

})
