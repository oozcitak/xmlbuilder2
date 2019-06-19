import $$ from '../TestHelpers'

describe('StringWriter', () => {

  test('basic', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?pi': 'mypi',
        '#comment': 'Good guy',
        '#cdata': 'well formed!',
        address: {
          city: "Istanbul",
          street: "End of long and winding road"
        },
        contact: {
          phone: [ "555-1234", "555-1235" ]
        },
        id() { return 42; },
        details: {
          '#text': 'classified'
        }
      }
    }

    expect($$.create('root').ele(obj).end({ format: "text" })).toBe($$.t`
      <root>
        <ele>simple element</ele>
        <person age="35">
            <name>John</name>
            <?pi mypi?>
            <!-- Good guy -->
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
        <added/>
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

    expect($$.create('root').ele(obj).end({ format: "text", prettyPrint: true, offset: 2 })).toBe(
      '    <root>\n' +
      '      <ele>simple element</ele>\n' +
      '      <person age="35">\n' +
      '        <name>John</name>\n' +
      '      </person>\n' +
      '    </root>'
      )
  })


})
