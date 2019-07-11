import $$ from '../TestHelpers'
import { inherits } from 'util';

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

    expect($$.xml({ version: "1.0", encoding: "UTF-8", standalone: true })
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

    expect($$.xml().create('root').ele(obj).root().
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

    expect($$.xml().create('root').ele(obj).root().
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
    expect($$.xml({ docType: { pubID: "pub", sysID: "sys" } })
      .create('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub" "sys">
      <root/>
      `)
  })

  test('doctype with public identifier', () => {
    expect($$.xml({ docType: { pubID: "pub", } })
      .create('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub">
      <root/>
      `)
  })

  test('doctype with system identifier', () => {
    expect($$.xml({ docType: { sysID: "sys" } })
      .create('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root SYSTEM "sys">
      <root/>
      `)
  })

  test('doctype without identifiers', () => {
    expect($$.xml({ docType: { } })
      .create('root').doc().toString({ format: "text", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <root/>
      `)
  })

  test('namespaces', () => {
    const doc = $$.xml().create('myns', 'root')
      .ele('foo').up()
      .set({ inheritNS: false }).ele('bar').up()
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns="myns">
        <foo/>
        <bar xmlns=""/>
      </root>
      `)
  })

  test('XML namespace', () => {
    const doc = $$.xml().create('http://www.w3.org/XML/1998/namespace', 'root')
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
    const doc = $$.xml().create('d:root', { "xmlns:d": "ns1" })
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
    const doc = $$.xml().create('r', { "xmlns:x0": "myns", "xmlns:x2": "myns" })
      .ele('b', { "xmlns:x1": "myns" })
      .att('myns', 'name', 'v')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns:x0="myns" xmlns:x2="myns">
        <b xmlns:x1="myns" x1:name="v"/>
      </r>
      `)
  })

  test('prefix of an attribute is replaced with another existing prefix mapped to the same namespace URI', () => {
    const doc = $$.xml().create('r', { "xmlns:xx": "uri" })
      .att('uri', 'p:name', 'v')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns:xx="uri" xx:name="v"/>
      `)

    const doc2 = $$.xml().create('r', { "xmlns:xx": "uri" })
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
    const doc = $$.xml().create('r', { "xmlns:xx": "uri" })
      .att('uri2', 'xx:name', 'value')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns:xx="uri" xmlns:ns1="uri2" ns1:name="value"/>
      `)
  })

  test('same prefix declared in an ancestor element', () => {
    const doc = $$.xml().create('root', { "xmlns:p": "uri1" })
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
    const doc = $$.xml().create('uri', 'root')
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
    const doc = $$.xml().create('root', { "xmlns:p1": "u1" })
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
    const doc = $$.xml().create('uri1', 'p:root')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns:p', 'uri2')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <ns1:root xmlns:ns1="uri1" xmlns:p="uri2"/>
      `)
  })

  test('prefix redeclared in ancestor element', () => {
    const doc = $$.xml().create('root')
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
    const doc = $$.xml().create('root', { "xmlns:x": "uri1" })
      .ele('table', { xmlns: "uri1" })
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns:x="uri1">
        <x:table xmlns="uri1"/>
      </root>
      `)
  })

  test('multiple generated prefixes', () => {
    const doc = $$.xml().create('root')
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
    expect($$.xml().create('root').end({ allowEmptyTags: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root></root>
      `)
  })

  test('spaceBeforeSlash', () => {
    expect($$.xml().create('root').end({ spaceBeforeSlash: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root />
      `)
  })

  test('Pretty printing with dontPrettyPrintTextNodes, no mixed content', () => {
    const doc = $$.xml().create('root')
      .ele('atttest', { 'att': 'val' }).txt('text').up()
      .ele('atttest').att('att', 'val').txt('text').doc()

    expect(doc.end({ dontPrettyPrintTextNodes: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root>
        <atttest att="val">text</atttest>
        <atttest att="val">text</atttest>
      </root>
      `)
  })

  test('Pretty printing with mixed content', () => {
    const doc = $$.xml().create('root')
      .ele('atttest', { 'att': 'val' }).txt('mixed content')
        .ele('atttest').att('att', 'val').txt('text').up()
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
    const doc = $$.xml().create('root')
      .ele('atttest', { 'att': 'val' }).txt('mixed content')
      .ele('atttest').att('att', 'val').txt('text').up()
      .txt('moretext after node').doc()

    expect(doc.end({ dontPrettyPrintTextNodes: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root>
        <atttest att="val">mixed content<atttest att="val">text</atttest>moretext after node</atttest>
      </root>
      `)
  })

  test('unknown node', () => {
    const ele = $$.xml().create('root').ele('alien')
    Object.defineProperty(ele, "nodeType", { value: 1001, writable: false })
    expect(() => ele.end()).toThrow()
  })

})
