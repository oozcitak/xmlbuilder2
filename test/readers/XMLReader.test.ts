import $$ from '../TestHelpers'

describe('XMLReader', () => {

  test('invalid version', () => {
    const xml = $$.t`
    <?xml version="1.1"?>
    <root/>
    `    

    expect(() => $$.create(xml)).toThrow()
  })

  test('docType', () => {
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
    expect(result).toEqual(xml)
  })

})
