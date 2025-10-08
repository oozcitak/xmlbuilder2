import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/88
  $$.test(`#88 - DOM textContent returns encoded text`, () => {
    const xmlStr = $$.t`
    <?xml version="1.0" encoding="utf-8"?>
    <root>
      <text>&lt;data&gt;</text>
      <text><![CDATA[<data>]]></text>
    </root>
    `

    const doc = $$.create(xmlStr);
    $$.deepEqual(doc.root().first().first().node.textContent, '<data>')
    $$.deepEqual(doc.end({ headless: true, prettyPrint: true}), $$.t`
    <root>
      <text>&lt;data&gt;</text>
      <text><![CDATA[<data>]]></text>
    </root>
    `);
  })

})
