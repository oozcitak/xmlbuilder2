import $$ from '../TestHelpers'

describe('YAMLCBWriter', () => {

  test('basic', (done) => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?1': 'pi mypi',
        '?2': 'pi',
        '!': 'Good guy',
        '$': 'well formed!',
        address: {
          city: "Istanbul",
          street: "End of long and winding road"
        },
        contact: {
          phone: ["555-1234", "555-1235"]
        },
        id: () => 42,
        details: {
          '#text': 'classified'
        }
      }
    }

    const xmlStream = $$.createCB({ format: "yaml" })
    xmlStream.ele('root').ele(obj).end()

    $$.expectCBResult(xmlStream, $$.t`
      ---
      "root":
        "#":
        - "ele":
            "#":
            - "#": "simple element"
        - "person":
            "#":
            - "@age": "35"
            - "name":
                "#":
                - "#": "John"
            - "?": "pi mypi"
            - "?": "pi"
            - "!": "Good guy"
            - "$": "well formed!"
            - "address":
                "#":
                - "city":
                    "#":
                    - "#": "Istanbul"
                - "street":
                    "#":
                    - "#": "End of long and winding road"
            - "contact":
                "#":
                - "phone":
                    "#":
                    - "#": "555-1234"
                - "phone":
                    "#":
                    - "#": "555-1235"
            - "id":
                "#":
                - "#": "42"
            - "details":
                "#":
                - "#": "classified"
      `, done)
  })

  test('offset', (done) => {
    const obj = {
      person: {
        '#': 'text',
        '@age': 35,
      }
    }

    const xmlStream = $$.createCB({ format: "yaml", offset: 2 })
    xmlStream.ele('root').ele(obj).end()

    $$.expectCBResult(xmlStream, 
        '    ---\n' +
        '    "root":\n' +
        '      "#":\n' +
        '      - "person":\n' +
        '          "#":\n' +
        '          - "@age": "35"\n' +
        '          - "#": "text"'
      , done)
  })

  test('negative offset', () => {
    expect(() => $$.createCB({ format: "yaml", offset: -4 })).toThrow()
  })

  test('invalid indentation', () => {
    expect(() => $$.createCB({ format: "yaml", indent: " " })).toThrow()
  })

  test('prologue', (done) => {
    const xmlStream = $$.createCB({ format: "yaml" })
    xmlStream.dec({ version: "1.0" })
      .dtd({ name: "root", pubID: "pub", sysID: "sys" })
      .ele('root').end()

    $$.expectCBResult(xmlStream, $$.t`
    ---
    "root":
      "#": ""
    `, done)
  })

  test('round trip', (done) => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?': ['pi mypi', 'pi'],
        '!': 'Good guy',
        '$': 'well formed!',
        address: {
          city: "Istanbul",
          street: "End of long and winding road"
        },
        contact: {
          phone: ["555-1234", "555-1235"]
        },
        id: () => ({ "@xmlns": "ns", "#": 42 }),
        details: {
          '#text': 'classified'
        }
      }
    }

    const xmlStream = $$.createCB({ format: "yaml" })
    xmlStream.ele('root').ele(obj).end()
    const yamlStr = $$.getCBResult(xmlStream)
    expect($$.convert({ version: "1.0", encoding: "UTF-8", standalone: true }, yamlStr, { format: "xml", prettyPrint: true })).toBe($$.t`
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <root>
      <ele>simple element</ele>
      <person age="35">
        <name>John</name>
        <?pi mypi?>
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
        <id xmlns="ns">42</id>
        <details>classified</details>
      </person>
    </root>    
    `)
    done()
  })

})
