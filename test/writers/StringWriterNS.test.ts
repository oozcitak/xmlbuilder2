import $$ from '../TestHelpers'
import { Element } from "@oozcitak/dom/lib/dom/interfaces"

describe('StringWriter with namespaces', () => {

  test('basic', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?': 'pi val',
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

    const root = $$.create({ version: "1.0", encoding: "UTF-8", standalone: true }).ele('root')
    root.ele(obj)
    expect(root.doc().toString({ format: "xml", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <root>
        <ele>simple element</ele>
        <person age="35">
          <name>John</name>
          <?pi val?>
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
  })

  test('doctype with both public and system identifier', () => {
    expect($$.create().dtd({ pubID: "pub", sysID: "sys" })
      .ele('ns', 'root').doc().toString({ format: "xml", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub" "sys">
      <root xmlns="ns"/>
      `)
  })

  test('doctype with public identifier', () => {
    expect($$.create().dtd({ pubID: "pub" })
      .ele('ns', 'root').doc().toString({ format: "xml", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub">
      <root xmlns="ns"/>
      `)
  })

  test('doctype with system identifier', () => {
    expect($$.create().dtd({ sysID: "sys" })
      .ele('ns', 'root').doc().toString({ format: "xml", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root SYSTEM "sys">
      <root xmlns="ns"/>
      `)
  })

  test('doctype without identifiers', () => {
    expect($$.create().dtd()
      .ele('ns', 'root').doc().toString({ format: "xml", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <root xmlns="ns"/>
      `)
  })

  test('fragment', () => {
    const frag = $$.fragment()
    frag.ele('ns', 'node').up().ele('ns', 'node').up()
    expect(frag.toString({ format: "xml", prettyPrint: true })).toBe($$.t`
      <node xmlns="ns"/>
      <node xmlns="ns"/>
      `)
  })

  test('namespaces', () => {
    const doc = $$.create().ele('root', { xmlns: "ns" })
      .ele('foo').up()
      .ele('bar').up()
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns="ns">
        <foo/>
        <bar/>
      </root>
      `)
  })

  test('XML namespace', () => {
    const doc = $$.create().ele('http://www.w3.org/XML/1998/namespace', 'root')
      .ele('foo').up()
      .ele('bar').up()
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <xml:root>
        <foo/>
        <bar/>
      </xml:root>
      `)
  })

  test('duplicate namespaces', () => {
    const doc = $$.create().ele('d:root', { "xmlns:d": "ns1" })
      .ele('e:foo', { "xmlns:e": "ns1" }).up()
      .ele('bar').up()
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <d:root xmlns:d="ns1">
        <e:foo xmlns:e="ns1"/>
        <bar/>
      </d:root>
      `)
  })

  test('attribute with namespace and no prefix', () => {
    const doc = $$.create().ele('r', { "xmlns:x0": "ns", "xmlns:x2": "ns" })
      .ele('b', { "xmlns:x1": "ns" })
      .att('ns', 'name', 'v')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns:x0="ns" xmlns:x2="ns">
        <b xmlns:x1="ns" xmlns:ns1="ns" ns1:name="v"/>
      </r>
      `)
  })

  test('nested default namespace declaration attributes with same namespace are ignored', () => {
    const doc = $$.create().ele('ns', 'r')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns', 'ns')
      .ele('ns', 'n')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns', 'ns')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns="ns">
        <n/>
      </r>
      `)
  })

  test('prefix of an attribute is replaced with another existing prefix mapped to the same namespace URI', () => {
    const doc = $$.create().ele('r')
      .att('xmlns:xx', 'uri')
      .att('uri', 'p:name', 'v')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns:xx="uri" xmlns:p="uri" p:name="v"/>
      `)

    const doc2 = $$.create().ele('r', { "xmlns:xx": "uri" })
      .ele('b')
      .att('uri', 'p:name', 'value')
      .doc()
    expect(doc2.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns:xx="uri">
        <b xmlns:p="uri" p:name="value"/>
      </r>
      `)
  })

  test('prefix of an attribute is NOT preserved if neither its prefix nor its namespace URI is not already used', () => {
    const doc = $$.create().ele('r')
      .att('xmlns:xx', 'uri')
      .att('uri2', 'p:name', 'value')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <r xmlns:xx="uri" xmlns:p="uri2" p:name="value"/>
      `)
  })

  test('same prefix declared in an ancestor element', () => {
    const doc = $$.create().ele('uri1', 'p:root')
      .ele('child')
      .att('uri2', 'p:foobar', 'value')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <p:root xmlns:p="uri1">
        <child xmlns:ns1="uri2" ns1:foobar="value"/>
      </p:root>
      `)
  })

  test('drop element prefix if the namespace is same as inherited default namespace', () => {
    const doc = $$.create().ele('uri', 'root')
      .ele('uri', 'p:child')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns="uri">
        <child/>
      </root>
      `)
  })

  test('find an appropriate prefix', () => {
    const doc = $$.create().ele('u1', 'p1:root')
      .ele('u1', 'p2:child')
      .ele('u1', 'child2')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <p1:root xmlns:p1="u1">
        <p1:child>
          <p1:child2/>
        </p1:child>
      </p1:root>
      `)
  })

  test('xmlns:* attributes', () => {
    const doc = $$.create().ele('uri1', 'p:root')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns:p', 'uri2')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <ns1:root xmlns:ns1="uri1" xmlns:p="uri2"/>
      `)
  })

  test('prefix re-declared in ancestor element', () => {
    const doc = $$.create().ele('root')
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
    const doc = $$.create().ele('root', { "xmlns:x": "uri1" })
      .ele('table', { xmlns: "uri1" })
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns:x="uri1">
        <table xmlns="uri1"/>
      </root>
      `)
  })

  test('multiple generated prefixes', () => {
    const doc = $$.create().ele('root')
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

  test('attributes in same namespace', () => {
    const doc = $$.create().ele('root')
      .ele('child').att('uri', 'attr', 'value').up()
      .ele('child').att('uri', 'attr', 'value')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root>
        <child xmlns:ns1="uri" ns1:attr="value"/>
        <child xmlns:ns2="uri" ns2:attr="value"/>
      </root>
      `)
  })

  test('attributes in same namespace in a single element', () => {
    const doc = $$.create().ele('root')
      .att('uri', 'attr1', 'value1').att('uri', 'attr2', 'value2')
      .doc()
    expect(doc.end({ wellFormed: true, prettyPrint: true, headless: true })).toBe($$.t`
      <root xmlns:ns1="uri" ns1:attr1="value1" ns1:attr2="value2"/>
      `)
  })

  test('unknown node', () => {
    const ele = $$.create().ele('ns', 'root').ele('alien')
    Object.defineProperty(ele.node, "nodeType", { value: 1001, writable: false })
    expect(() => ele.end()).toThrow()
  })

  test('escape text data', () => {
    const ele = $$.create().ele('ns', 'root').txt('&<>')
    expect(ele.toString()).toBe('<root xmlns="ns">&amp;&lt;&gt;</root>')
  })

  test('escape attribute value', () => {
    const ele1 = $$.create().ele('ns', 'root').att('att', '"&<>')
    expect(ele1.toString()).toBe('<root xmlns="ns" att="&quot;&amp;&lt;&gt;"/>')
    const ele2 = $$.create().ele('ns', 'root').att('att', 'val')
    Object.defineProperty((ele2.node as Element).attributes.item(0), "value", { value: null })
    expect(ele2.toString()).toBe('<root xmlns="ns" att=""/>')
  })

  test('wellFormed checks - invalid element node', () => {
    const ele = $$.create().ele('ns', 'root')
    Object.defineProperty(ele.node, "localName", { value: "x:y", configurable: true })
    expect(() => ele.end({ wellFormed: true })).toThrow()
    Object.defineProperty(ele.node, "localName", { value: "abc\0", configurable: true })
    expect(() => ele.end({ wellFormed: true })).toThrow()
    Object.defineProperty(ele.node, "localName", { value: "\0abc", configurable: true })
    expect(() => ele.end({ wellFormed: true })).toThrow()
    Object.defineProperty(ele.node, "prefix", { value: "xmlns" })
    expect(() => ele.end({ wellFormed: true })).toThrow()
    Object.defineProperty(ele.node, "localName", { value: "abc\uDBFF", configurable: true })
    expect(() => ele.end({ wellFormed: true })).toThrow()
    Object.defineProperty(ele.node, "localName", { value: "abc🌃\0", configurable: true })
    expect(() => ele.end({ wellFormed: true })).toThrow()
    Object.defineProperty(ele.node, "localName", { value: "abc\uDBFFx", configurable: true })
    expect(() => ele.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid document node', () => {
    const doc = $$.create().ele('ns', 'root').doc()
    Object.defineProperty(doc.node, "documentElement", { value: null })
    expect(() => doc.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid comment node', () => {
    const ele1 = $$.create().ele('ns', 'root').com('--')
    expect(() => ele1.end({ wellFormed: true })).toThrow()
    const ele2 = $$.create().ele('ns', 'root').com('text-')
    expect(() => ele2.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid text node', () => {
    const ele = $$.create().ele('ns', 'root').txt('abc😊\0')
    expect(() => ele.end({ wellFormed: true })).toThrow()
    Object.defineProperty(ele.first().node, "data", { value: "abc\uDBFFx", configurable: true })
    expect(() => ele.end({ wellFormed: true })).toThrow()
    Object.defineProperty(ele.first().node, "data", { value: "abc\0", configurable: true })
    expect(() => ele.end({ wellFormed: true })).toThrow()
    Object.defineProperty(ele.first().node, "data", { value: "abc\uE000🌃\0", configurable: true })
    expect(() => ele.end({ wellFormed: true })).toThrow()
    Object.defineProperty(ele.first().node, "data", { value: "abc\uE000🌃", configurable: true })
    expect(() => ele.end({ wellFormed: true })).not.toThrow()
  })

  test('wellFormed checks - invalid document type node', () => {
    const ele1 = $$.create().ele('ns', 'root').dtd({ pubID: 'abc😊\0' })
    expect(() => ele1.end({ wellFormed: true })).toThrow()
    const ele2 = $$.create().ele('ns', 'root').dtd({ sysID: '\0' })
    expect(() => ele2.end({ wellFormed: true })).toThrow()
    const ele3 = $$.create().ele('ns', 'root').dtd({ sysID: '\'quote mismatch"' })
    expect(() => ele3.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid processing instruction node', () => {
    const ele1 = $$.create().ele('ns', 'root').ins(':')
    expect(() => ele1.end({ wellFormed: true })).toThrow()
    const ele2 = $$.create().ele('ns', 'root').ins('xml')
    expect(() => ele2.end({ wellFormed: true })).toThrow()
    const ele3 = $$.create().ele('ns', 'root').ins('name', '\0')
    expect(() => ele3.end({ wellFormed: true })).toThrow()
    const ele4 = $$.create().ele('ns', 'root').ins('name', 'data')
    Object.defineProperty(ele4.node.firstChild, "data", { value: "?>" })
    expect(() => ele4.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid cdata node', () => {
    const ele = $$.create().ele('ns', 'root').dat('data')
    Object.defineProperty(ele.node.firstChild, "data", { value: "]]>" })
    expect(() => ele.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid attribute', () => {
    // duplicate name
    const ele1 = $$.create().ele('ns', 'root').att('att', 'val').att('att2', 'val')
    Object.defineProperty((ele1.node as Element).attributes.item(1), "localName", { value: "att" })
    expect(() => ele1.end({ wellFormed: true })).toThrow()
    // XMLNS namespace
    const ele2 = $$.create().ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', 'http://www.w3.org/2000/xmlns/')
    expect(() => ele2.end({ wellFormed: true })).toThrow()
    // undeclared namespace
    const ele3 = $$.create().ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', '')
    expect(() => ele3.end({ wellFormed: true })).toThrow()
    // invalid name
    const ele4 = $$.create().ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', '')
    Object.defineProperty((ele4.node as Element).attributes.item(0), "localName", { value: ":" })
    expect(() => ele4.end({ wellFormed: true })).toThrow()
    const ele5 = $$.create().ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', '')
    Object.defineProperty((ele5.node as Element).attributes.item(0), "localName", { value: "\0" })
    expect(() => ele5.end({ wellFormed: true })).toThrow()
    const ele6 = $$.create().ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns', 'value')
    Object.defineProperty((ele6.node as Element).attributes.item(0), "namespaceURI", { value: null })
    expect(() => ele6.end({ wellFormed: true })).toThrow()
    // invalid value
    const ele7 = $$.create().ele('ns', 'root').att('att', '\0')
    expect(() => ele7.end({ wellFormed: true })).toThrow()
  })

  test('void HTML element', () => {
    const doc = $$.create().ele('root')
      .ele('http://www.w3.org/1999/xhtml', 'hr')
      .doc()
    expect(doc.end({ prettyPrint: true, headless: true })).toBe($$.t`
      <root>
        <hr xmlns="http://www.w3.org/1999/xhtml" />
      </root>
      `)
  })

  test('redundant xmlns is dropped', () => {
    expect($$.convert('<root><child xmlns=""/></root>', { headless: true })).toBe('<root><child/></root>')
    expect($$.convert('<root xmlns=""><child xmlns=""/></root>', { headless: true })).toBe('<root><child/></root>')
    expect($$.convert('<root xmlns="u1"><child xmlns="u1"/></root>', { headless: true })).toBe('<root xmlns="u1"><child/></root>')
  })

  test('attribute with no prefix and namespace', () => {
    const doc = $$.create('<r xmlns:x0="uri" xmlns:x2="uri"><b xmlns:x1="uri"/></r>')
    const root = doc.root()
    root.first().att('uri', 'name', 'v')
    expect(root.toString()).toBe('<r xmlns:x0="uri" xmlns:x2="uri"><b xmlns:x1="uri" x1:name="v"/></r>')
    const doc2 = $$.create('<el1 xmlns:p="u1" xmlns:q="u1"><el2 xmlns:q="u2"/></el1>')
    const root2 = doc2.root()
    root2.first().att('u1', 'name', 'v')
    expect(root2.toString()).toBe('<el1 xmlns:p="u1" xmlns:q="u1"><el2 xmlns:q="u2" q:name="v"/></el1>')
  })

  test('element prefix is dropped if the namespace is same as inherited default namespace', () => {
    expect($$.convert('<root xmlns="u1"><p:child xmlns:p="u1"/></root>', { headless: true })).toBe('<root xmlns="u1"><child xmlns:p="u1"/></root>')
  })

})
