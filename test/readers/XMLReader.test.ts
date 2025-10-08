import $$ from '../TestHelpers'

$$.suite('XMLReader', () => {

  $$.test('invalid version', () => {
    const xml = $$.t`
    <?xml version="1.1"?>
    <root/>
    `

    $$.throws(() => $$.create(xml))
  })

  $$.test('docType', () => {
    const xml = $$.t`
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <!DOCTYPE root PUBLIC "pub" "sys">
    <root>
      <ele>simple element</ele>
      <person age="35">
        <name>John</name>
        <?pi val?>
        <?pi?>
        <!--Good guy-->
        <![CDATA[well formed!]]>
        <address>
          <city>Istanbul</city>
          <street>End of long and winding road</street>
        </address>
        <contact>
          <phone>555-1234</phone>
          <phone>555-1235</phone>
        </contact>
        <id>42</id>
        <details>classified</details>
      </person>
    </root>
    `

    const result = $$.create(xml).end({ prettyPrint: true })
    $$.deepEqual(result, xml)
  })

  $$.test('returned node should be the top level node', () => {
    const baz = $$.create().ele('Qroot').ele($$.t`
      <Qfoo>
        <Qbar>foobar</Qbar>
      </Qfoo>
      <Qbaz/>
    `);

    $$.deepEqual(baz.toString(), '<Qbaz/>')
  })

})
