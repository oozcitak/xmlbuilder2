import $$ from '../TestHelpers'

describe('StringWriter', () => {

  test('basic', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?': 'pi mypi',
        '!': 'Good guy',
        '$': 'well formed!',
        '&': 'raw<>&',
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
          raw<>&
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

  test('negative offset', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
      }
    }

    expect($$.create('root').ele(obj).root().
      toString({ format: "text", prettyPrint: true, offset: -2 })).toBe(
      '<root>\n' +
      '<ele>simple element</ele>\n' +
      '<person age="35">\n' +
      '<name>John</name>\n' +
      '</person>\n' +
      '</root>'
      )
  })

  test('doctype with both public and system identifier', () => {
    expect($$.withOptions({ docType: { pubID: "pub", sysID: "sys" } })
      .create('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub" "sys">
      <root/>
      `)
  })

  test('doctype with public identifier', () => {
    expect($$.withOptions({ docType: { pubID: "pub", } })
      .create('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub">
      <root/>
      `)
  })

  test('doctype with system identifier', () => {
    expect($$.withOptions({ docType: { sysID: "sys" } })
      .create('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root SYSTEM "sys">
      <root/>
      `)
  })

  test('doctype without identifiers', () => {
    expect($$.withOptions({ docType: { } })
      .create('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <root/>
      `)
  })

  test('namespaces', () => {
    const doc = $$.create('root', { xmlns: "myns" })
      .ele('foo').up()
      .set({ inheritNS: false }).ele('bar').up()
      .doc()
    expect(doc.end({ prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root xmlns="myns">
        <foo/>
        <bar xmlns=""/>
      </root>
      `)
  })

  test('allowEmptyTags', () => {
    expect($$.create('root').end({ allowEmptyTags: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root></root>
      `)
  })

  test('spaceBeforeSlash', () => {
    expect($$.create('root').end({ spaceBeforeSlash: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root />
      `)
  })

  test('Pretty printing with dontPrettyPrintTextNodes, no mixed content', () => {
    const doc = $$.create('root')
      .ele('atttest', { 'att': 'val' }, 'text').up()
      .ele('atttest', 'text').att('att', 'val').doc()

    expect(doc.end({ dontPrettyPrintTextNodes: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root>
        <atttest att="val">text</atttest>
        <atttest att="val">text</atttest>
      </root>
      `)
  })

  test('Pretty printing with mixed content', () => {
    const doc = $$.create('root')
      .ele('atttest', { 'att': 'val' }, 'mixed content')
        .ele('atttest', 'text').att('att', 'val').up()
        .txt('moretext after node').doc()

    expect(doc.end({ prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root>
        <atttest att="val">
          mixed content
          <atttest att="val">text</atttest>
          moretext after node
        </atttest>
      </root>
      `)
  })

  test('Pretty printing with dontPrettyPrintTextNodes, mixed content', () => {
    const doc = $$.create('root')
      .ele('atttest', { 'att': 'val' }, 'mixed content')
      .ele('atttest', 'text').att('att', 'val').up()
      .txt('moretext after node').doc()

    expect(doc.end({ dontPrettyPrintTextNodes: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root>
        <atttest att="val">mixed content<atttest att="val">text</atttest>moretext after node</atttest>
      </root>
      `)
  })

  test('unknown node', () => {
    const ele = $$.create('root').ele('alien')
    Object.defineProperty(ele, "nodeType", { value: 1001, writable: false })
    expect(() => ele.end()).toThrow()
  })

})
