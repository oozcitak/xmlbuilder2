import $$ from '../TestHelpers'

describe('StringWriter', () => {

  test('basic', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?pi': 'mypi',
        '!': 'Good guy',
        '$': 'well formed!',
        address: {
          city: "Istanbul",
          street: "End of long and winding road"
        },
        contact: {
          phone: [ "555-1234", "555-1235" ]
        },
        id: () => 42,
        details: {
          '#text': 'classified'
        }
      }
    }

    expect($$.withOptions({ version: "1.0", encoding: "UTF-8", standalone: true })
      .create('root').ele(obj).doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <root>
        <ele>simple element</ele>
        <person age="35">
          <name>John</name>
          <?pi mypi?>
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
      `)
  })

  test('offset', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
      }
    }

    expect($$.create('root').ele(obj).root().
      toString({ format: "text", prettyPrint: true, offset: 2 })).toBe(
      '    <root>\n' +
      '      <ele>simple element</ele>\n' +
      '      <person age="35">\n' +
      '        <name>John</name>\n' +
      '      </person>\n' +
      '    </root>'
      )
  })

  test('doctype with both public and system identifier', () => {
    expect($$.withOptions({ pubID: "pub", sysID: "sys" })
      .create('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub" "sys">
      <root/>
      `)
  })

  test('doctype with public identifier', () => {
    expect($$.withOptions({ pubID: "pub", })
      .create('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub">
      <root/>
      `)
  })

  test('doctype with system identifier', () => {
    expect($$.withOptions({ sysID: "sys", })
      .create('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root SYSTEM "sys">
      <root/>
      `)
  })

})
