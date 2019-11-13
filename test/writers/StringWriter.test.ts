import $$ from '../TestHelpers'

describe('StringWriter', () => {

  test('basic', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?': 'pi val',
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

    expect($$.document({ version: "1.0", encoding: "UTF-8", standalone: true })
      .ele('root').ele(obj).doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <root>
        <ele>simple element</ele>
        <person age="35">
          <name>John</name>
          <?pi val?>
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

    expect($$.document().ele('root').ele(obj).root().
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

    expect($$.document().ele('root').ele(obj).root().
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
    expect($$.document().dtd({ pubID: "pub", sysID: "sys" })
      .ele('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub" "sys">
      <root/>
      `)
  })

  test('doctype with public identifier', () => {
    expect($$.document().dtd({ pubID: "pub" })
      .ele('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub">
      <root/>
      `)
  })

  test('doctype with system identifier', () => {
    expect($$.document().dtd({ sysID: "sys" })
      .ele('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root SYSTEM "sys">
      <root/>
      `)
  })

  test('doctype without identifiers', () => {
    expect($$.document().dtd()
      .ele('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <root/>
      `)
  })

  test('namespaces', () => {
    const doc = $$.document().ele('ns', 'root')
      .ele('foo').up()
      .set({ inheritNS: false }).ele('bar').up()
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns="ns">
        <foo/>
        <bar xmlns=""/>
      </root>
      `)
  })

  test('XML namespace', () => {
    const doc = $$.document().ele('http://www.w3.org/XML/1998/namespace', 'root')
      .ele('foo').up()
      .set({ inheritNS: false }).ele('bar').up()
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <xml:root>
        <xml:foo/>
        <bar/>
      </xml:root>
      `)
  })

  test('duplicate namespaces', () => {
    const doc = $$.document().ele('d:root', { "xmlns:d": "ns1" })
      .ele('e:foo', { "xmlns:e": "ns1" }).up()
      .set({ inheritNS: false }).ele('bar').up()
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <d:root xmlns:d="ns1">
        <e:foo xmlns:e="ns1"/>
        <bar/>
      </d:root>
      `)
  })

  test('attribute with namespace and no prefix', () => {
    const doc = $$.document().ele('r', { "xmlns:x0": "ns", "xmlns:x2": "ns" })
      .ele('b', { "xmlns:x1": "ns" })
      .att('ns', 'name', 'v')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns:x0="ns" xmlns:x2="ns">
        <b xmlns:x1="ns" x1:name="v"/>
      </r>
      `)
  })

  test('prefix of an attribute is replaced with another existing prefix mapped to the same namespace URI', () => {
    const doc = $$.document().ele('r', { "xmlns:xx": "uri" })
      .att('uri', 'p:name', 'v')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns:xx="uri" xx:name="v"/>
      `)

    const doc2 = $$.document().ele('r', { "xmlns:xx": "uri" })
      .ele('b')
      .att('uri', 'p:name', 'value')
      .doc()
    expect(doc2.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns:xx="uri">
        <b xx:name="value"/>
      </r>
      `)
  })

  test('prefix of an attribute is NOT preserved if neither its prefix nor its namespace URI is not already used', () => {
    const doc = $$.document().ele('r', { "xmlns:xx": "uri" })
      .att('uri2', 'xx:name', 'value')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns:xx="uri" xmlns:ns1="uri2" ns1:name="value"/>
      `)
  })

  test('same prefix declared in an ancestor element', () => {
    const doc = $$.document().ele('root', { "xmlns:p": "uri1" })
      .set({ inheritNS: false })
      .ele('child')
      .att('uri2', 'p:foobar', 'value')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns:p="uri1">
        <child xmlns:ns1="uri2" ns1:foobar="value"/>
      </root>
      `)
  })

  test('drop element prefix if the namespace is same as inherited default namespace', () => {
    const doc = $$.document().ele('uri', 'root')
      .set({ inheritNS: false })
      .ele('p:child', { "xmlns:p": "uri" })
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns="uri">
        <child xmlns:p="uri"/>
      </root>
      `)
  })

  test('find an appropriate prefix', () => {
    const doc = $$.document().ele('root', { "xmlns:p1": "u1" })
      .set({ inheritNS: false })
      .ele('child', { "xmlns:p2": "u1" })
      .ele('u1', 'child2')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns:p1="u1">
        <child xmlns:p2="u1">
          <p2:child2/>
        </child>
      </root>
      `)
  })

  test('xmlns:* attributes', () => {
    const doc = $$.document().ele('uri1', 'p:root')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns:p', 'uri2')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <ns1:root xmlns:ns1="uri1" xmlns:p="uri2"/>
      `)
  })

  test('prefix re-declared in ancestor element', () => {
    const doc = $$.document().ele('root')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns:p', 'uri2')
      .ele('uri1', 'p:child')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns:p="uri2">
        <p:child xmlns:p="uri1"/>
      </root>
      `)
  })

  test('default namespace does not apply if was declared in an ancestor', () => {
    const doc = $$.document().ele('root', { "xmlns:x": "uri1" })
      .ele('table', { xmlns: "uri1" })
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns:x="uri1">
        <x:table xmlns="uri1"/>
      </root>
      `)
  })

  test('multiple generated prefixes', () => {
    const doc = $$.document().ele('root')
      .ele('child1').att('uri1', 'attr1', 'value1').att('uri2', 'attr2', 'value2').up()
      .ele('child2').att('uri3', 'attr3', 'value3')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root>
        <child1 xmlns:ns1="uri1" ns1:attr1="value1" xmlns:ns2="uri2" ns2:attr2="value2"/>
        <child2 xmlns:ns3="uri3" ns3:attr3="value3"/>
      </root>
      `)
  })

  test('allowEmptyTags', () => {
    expect($$.document().ele('root').end({ allowEmptyTags: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root></root>
      `)
  })

  test('spaceBeforeSlash', () => {
    expect($$.document().ele('root').end({ spaceBeforeSlash: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root />
      `)
  })

  test('Pretty printing with indentTextOnlyNodes, no mixed content', () => {
    const doc = $$.document().ele('root')
      .ele('node', { 'att': 'val' }).txt('text').up()
      .ele('node').att('att', 'val').txt('text').doc()

    expect(doc.end({ indentTextOnlyNodes: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root>
        <node att="val">
          text
        </node>
        <node att="val">
          text
        </node>
      </root>
      `)
  })

  test('Pretty printing with mixed content', () => {
    const doc = $$.document().ele('root')
      .ele('node', { 'att': 'val' }).txt('mixed content')
        .ele('node').att('att', 'val').txt('text').up()
        .txt('more text after node').doc()

    expect(doc.end({ prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root>
        <node att="val">
          mixed content
          <node att="val">text</node>
          more text after node
        </node>
      </root>
      `)
  })

  test('Pretty printing with indentTextOnlyNodes, mixed content', () => {
    const doc = $$.document().ele('root')
      .ele('node', { 'att': 'val' }).txt('mixed content')
      .ele('node').att('att', 'val').txt('text').up()
      .txt('more text after node').doc()

    expect(doc.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true })).toBe($$.t`
      <root>
        <node att="val">
          mixed content
          <node att="val">
            text
          </node>
          more text after node
        </node>
      </root>
      `)
  })

  test('Various types of text nodes', () => {
    const doc1 = $$.document().ele('root')
      .txt('text1')
      .doc()

    expect(doc1.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root>text1</root>
      `)

    const doc2 = $$.document().ele('root')
      .txt('text1')
      .txt('text2')
      .doc()

    expect(doc2.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root>text1text2</root>
      `)

    const doc3 = $$.document().ele('root')
      .txt('text1')
      .ele('node').up()
      .txt('text2')
      .doc()

    expect(doc3.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root>
        text1
        <node/>
        text2
      </root>
      `)
  })

  test('Various types of text nodes with indentTextOnlyNodes', () => {
    const doc1 = $$.document().ele('root')
      .txt('text1')
      .doc()

    expect(doc1.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true })).toBe($$.t`
      <root>
        text1
      </root>
      `)

    const doc2 = $$.document().ele('root')
      .txt('text1')
      .txt('text2')
      .doc()

    expect(doc2.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true })).toBe($$.t`
      <root>
        text1
        text2
      </root>
      `)

    const doc3 = $$.document().ele('root')
      .txt('text1')
      .ele('node').up()
      .txt('text2')
      .doc()

    expect(doc3.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true })).toBe($$.t`
      <root>
        text1
        <node/>
        text2
      </root>
      `)
  })

  test('unknown node', () => {
    const ele = $$.document().ele('root').ele('alien')
    Object.defineProperty(ele, "nodeType", { value: 1001, writable: false })
    expect(() => ele.end()).toThrow()
  })

})
