import $$ from '../TestHelpers'

describe('JSONCBWriter', () => {

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

    const xmlStream = $$.createCB({ format: "json", prettyPrint: true })
    xmlStream.ele('root').ele(obj).end()

    $$.expectCBResult(xmlStream, $$.t`
      { "root": {
        "#": [
          { "ele": {
            "#": [
              { "#": "simple element" }
            ]
          } },
          { "person": {
            "#": [
              { "@age": "35" },
              { "name": {
                "#": [
                  { "#": "John" }
                ]
              } },
              { "?": "pi mypi" },
              { "?": "pi" },
              { "!": "Good guy" },
              { "$": "well formed!" },
              { "address": {
                "#": [
                  { "city": {
                    "#": [
                      { "#": "Istanbul" }
                    ]
                  } },
                  { "street": {
                    "#": [
                      { "#": "End of long and winding road" }
                    ]
                  } }
                ]
              } },
              { "contact": {
                "#": [
                  { "phone": {
                    "#": [
                      { "#": "555-1234" }
                    ]
                  } },
                  { "phone": {
                    "#": [
                      { "#": "555-1235" }
                    ]
                  } }
                ]
              } },
              { "id": {
                "#": [
                  { "#": "42" }
                ]
              } },
              { "details": {
                "#": [
                  { "#": "classified" }
                ]
              } }
            ]
          } }
        ]
      } }
      `, done)
  })

  test('offset', (done) => {
    const obj = {
      person: {
        '#': 'text',
        '@age': 35,
      }
    }

    const xmlStream = $$.createCB({ format: "json", prettyPrint: true, offset: 2 })
    xmlStream.ele('root').ele(obj).end()

    $$.expectCBResult(xmlStream, 
        '    { "root": {\n' +
        '      "#": [\n' +
        '        { "person": {\n' +
        '          "#": [\n' +
        '            { "@age": "35" },\n' +
        '            { "#": "text" }\n' +
        '          ]\n' +
        '        } }\n' +
        '      ]\n' +
        '    } }'
      , done)
  })

  test('negative offset', (done) => {
    const obj = {
      person: {
        '#': 'text',
        '@age': 35,
      }
    }

    const xmlStream = $$.createCB({ format: "json", prettyPrint: true, offset: -4 })
    xmlStream.ele('root').ele(obj).end()

    $$.expectCBResult(xmlStream, 
        '{ "root": {\n' +
        '"#": [\n' +
        '{ "person": {\n' +
        '"#": [\n' +
        '{ "@age": "35" },\n' +
        '{ "#": "text" }\n' +
        ']\n' +
        '} }\n' +
        ']\n' +
        '} }'
      , done)
  })

  test('prologue', (done) => {
    const xmlStream = $$.createCB({ format: "json" })
    xmlStream.dec({ version: "1.0" })
      .dtd({ name: "root", pubID: "pub", sysID: "sys" })
      .ele('root').end()

    $$.expectCBResult(xmlStream, '{"root":{"#":[]}}', done)
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

    const xmlStream = $$.createCB({ format: "json", prettyPrint: true })
    xmlStream.ele('root').ele(obj).end()
    const jsonStr = $$.getCBResult(xmlStream)
    expect($$.convert({ version: "1.0", encoding: "UTF-8", standalone: true }, jsonStr, { format: "xml", prettyPrint: true })).toBe($$.t`
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
