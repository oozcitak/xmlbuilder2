import $$ from '../TestHelpers'
import { Element } from "@oozcitak/dom/lib/dom/interfaces"

describe('XMLWriter', () => {

  test('basic', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?1': 'pi val',
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

    expect($$.create({ version: "1.0", encoding: "UTF-8", standalone: true })
      .ele('root').ele(obj).doc().toString({ format: "xml", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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

    expect($$.create().ele('root').ele(obj).root().
      toString({ format: "xml", prettyPrint: true, offset: 2 })).toBe(
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

    expect($$.create().ele('root').ele(obj).root().
      toString({ format: "xml", prettyPrint: true, offset: -2 })).toBe(
        '<root>\n' +
        '<ele>simple element</ele>\n' +
        '<person age="35">\n' +
        '<name>John</name>\n' +
        '</person>\n' +
        '</root>'
      )
  })

  test('empty document', () => {
    expect($$.create().end()).toBe(`<?xml version="1.0"?>`)
  })

  test('doctype with both public and system identifier', () => {
    expect($$.create().dtd({ pubID: "pub", sysID: "sys" })
      .ele('root').doc().toString({ format: "xml", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub" "sys">
      <root/>
      `)
  })

  test('doctype with public identifier', () => {
    expect($$.create().dtd({ pubID: "pub" })
      .ele('root').doc().toString({ format: "xml", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub">
      <root/>
      `)
  })

  test('doctype with system identifier', () => {
    expect($$.create().dtd({ sysID: "sys" })
      .ele('root').doc().toString({ format: "xml", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root SYSTEM "sys">
      <root/>
      `)
  })

  test('doctype without identifiers', () => {
    expect($$.create().dtd()
      .ele('root').doc().toString({ format: "xml", prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <root/>
      `)
  })

  test('allowEmptyTags', () => {
    expect($$.create().ele('root').end({ allowEmptyTags: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root></root>
      `)
  })

  test('spaceBeforeSlash', () => {
    expect($$.create().ele('root').end({ spaceBeforeSlash: true, prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root />
      `)
  })

  test('Pretty printing with indentTextOnlyNodes, no mixed content', () => {
    const doc = $$.create().ele('root')
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
    const doc = $$.create().ele('root')
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
    const doc = $$.create().ele('root')
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
    const doc1 = $$.create().ele('root')
      .txt('text1')
      .doc()

    expect(doc1.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root>text1</root>
      `)

    const doc2 = $$.create().ele('root')
      .txt('text1')
      .txt('text2')
      .doc()

    expect(doc2.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root>text1text2</root>
      `)

    const doc3 = $$.create().ele('root')
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

    const doc4 = $$.create().ele('root')
      .txt('')
      .doc()

    expect(doc4.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root/>
      `)
  })

  test('Various types of text nodes with indentTextOnlyNodes', () => {
    const doc1 = $$.create().ele('root')
      .txt('text1')
      .doc()

    expect(doc1.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true })).toBe($$.t`
      <root>
        text1
      </root>
      `)

    const doc2 = $$.create().ele('root')
      .txt('text1')
      .txt('text2')
      .doc()

    expect(doc2.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true })).toBe($$.t`
      <root>
        text1
        text2
      </root>
      `)

    const doc3 = $$.create().ele('root')
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

  test('Various types of cdata nodes', () => {
    const doc1 = $$.create().ele('root')
      .dat('text1')
      .doc()

    expect(doc1.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root><![CDATA[text1]]></root>
      `)

    const doc2 = $$.create().ele('root')
      .dat('text1')
      .dat('text2')
      .doc()

    expect(doc2.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root>
        <![CDATA[text1]]>
        <![CDATA[text2]]>
      </root>
      `)

    const doc2a = $$.create().ele('root')
      .txt('text1')
      .dat('text2')
      .doc()

    expect(doc2a.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root>
        text1
        <![CDATA[text2]]>
      </root>
      `)

    const doc3 = $$.create().ele('root')
      .dat('text1')
      .ele('node').up()
      .dat('text2')
      .doc()

    expect(doc3.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root>
        <![CDATA[text1]]>
        <node/>
        <![CDATA[text2]]>
      </root>
      `)

    const doc4 = $$.create().ele('root')
      .dat('')
      .doc()

    expect(doc4.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root/>
      `)
  })

  test('Various types of cdata nodes with indentTextOnlyNodes', () => {
    const doc1 = $$.create().ele('root')
      .dat('text1')
      .doc()

    expect(doc1.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true })).toBe($$.t`
      <root>
        <![CDATA[text1]]>
      </root>
      `)

    const doc2 = $$.create().ele('root')
      .dat('text1')
      .dat('text2')
      .doc()

    expect(doc2.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true })).toBe($$.t`
      <root>
        <![CDATA[text1]]>
        <![CDATA[text2]]>
      </root>
      `)

    const doc3 = $$.create().ele('root')
      .dat('text1')
      .ele('node').up()
      .dat('text2')
      .doc()

    expect(doc3.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true })).toBe($$.t`
      <root>
        <![CDATA[text1]]>
        <node/>
        <![CDATA[text2]]>
      </root>
      `)
  })

  test('element node with xml prefix', () => {
    const ele = $$.create().ele('http://www.w3.org/2000/xmlns/', 'xmlns:root')
    expect(ele.end({ headless: true })).toBe('<xmlns:root/>')
  })

  test('unknown node', () => {
    const ele = $$.create().ele('root').ele('alien')
    Object.defineProperty(ele.node, "nodeType", { value: 1001, writable: false })
    expect(() => ele.end()).toThrow()
  })

  test('escape text data', () => {
    const ele = $$.create().ele('root').txt('&<>')
    expect(ele.toString()).toBe('<root>&amp;&lt;&gt;</root>')
    const ele1 = $$.create().ele('root').txt('&<>;')
    expect(ele1.toString()).toBe('<root>&amp;&lt;&gt;;</root>')
    const ele2 = $$.create().ele('root').txt('& amp;')
    expect(ele2.toString()).toBe('<root>&amp; amp;</root>')
  })

  test('escape attribute value', () => {
    const ele1 = $$.create().ele('root').att('att', '"&<>')
    expect(ele1.toString()).toBe('<root att="&quot;&amp;&lt;&gt;"/>')
    const ele2 = $$.create().ele('root').att('att', 'val')
    Object.defineProperty((ele2.node as Element).attributes.item(0), "value", { value: null })
    expect(ele2.toString()).toBe('<root att=""/>')
    const ele3 = $$.create().ele('root').att('att', '"&<>;')
    expect(ele3.toString()).toBe('<root att="&quot;&amp;&lt;&gt;;"/>')
  })

  test('duplicate attribute name not well-formed', () => {
    // duplicate name
    const ele1 = $$.create().ele('root').att('att', 'val').att('att2', 'val')
    Object.defineProperty((ele1.node as Element).attributes.item(1), "localName", { value: "att" })
    expect(ele1.toString()).toBe('<root att="val" att="val"/>')
  })

  test('wellFormed checks - invalid element node', () => {
    const ele = $$.create().ele('root')
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

  test('wellFormed checks - invalid element node', () => {
    const ele = $$.create().ele('http://www.w3.org/2000/xmlns/', 'xmlns:root')
    expect(() => ele.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid document node', () => {
    const doc = $$.create()
    Object.defineProperty(doc.node, "documentElement", { value: null })
    expect(() => doc.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid comment node', () => {
    const ele1 = $$.create().ele('root').com('--')
    expect(() => ele1.end({ wellFormed: true })).toThrow()
    const ele2 = $$.create().ele('root').com('text-')
    expect(() => ele2.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid text node - 1.0', () => {
    const ele = $$.create().ele('root').txt('abc😊\0')
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
    const ele1 = $$.create().ele('root').dtd({ pubID: 'abc😊\0' })
    expect(() => ele1.end({ wellFormed: true })).toThrow()
    const ele2 = $$.create().ele('root').dtd({ sysID: '\0' })
    expect(() => ele2.end({ wellFormed: true })).toThrow()
    const ele3 = $$.create().ele('root').dtd({ sysID: '\'quote mismatch"' })
    expect(() => ele3.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid processing instruction node', () => {
    const ele1 = $$.create().ele('root').ins(':')
    expect(() => ele1.end({ wellFormed: true })).toThrow()
    const ele2 = $$.create().ele('root').ins('xml')
    expect(() => ele2.end({ wellFormed: true })).toThrow()
    const ele3 = $$.create().ele('root').ins('name', '\0')
    expect(() => ele3.end({ wellFormed: true })).toThrow()
    const ele4 = $$.create().ele('root').ins('name', 'data')
    Object.defineProperty(ele4.node.firstChild, "data", { value: "?>" })
    expect(() => ele4.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid cdata node', () => {
    const ele = $$.create().ele('root').dat('data')
    Object.defineProperty(ele.node.firstChild, "data", { value: "]]>" })
    expect(() => ele.end({ wellFormed: true })).toThrow()
  })

  test('wellFormed checks - invalid attribute', () => {
    // duplicate name
    const ele1 = $$.create().ele('root').att('att', 'val').att('att2', 'val')
    Object.defineProperty((ele1.node as Element).attributes.item(1), "localName", { value: "att" })
    expect(() => ele1.end({ wellFormed: true })).toThrow()
    // invalid name
    const ele4 = $$.create().ele('root').att('att', '')
    Object.defineProperty((ele4.node as Element).attributes.item(0), "localName", { value: "att:name" })
    expect(() => ele4.end({ wellFormed: true })).toThrow()
    const ele5 = $$.create().ele('root').att('att', '')
    Object.defineProperty((ele5.node as Element).attributes.item(0), "localName", { value: "att\0" })
    expect(() => ele5.end({ wellFormed: true })).toThrow()
    // invalid value
    const ele7 = $$.create().ele('root').att('att', '\0')
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

  test('Pretty print attributes - 1', () => {
    expect(
      $$.create().ele('test').ele('node', { "first": "1", "second": "2" })
        .end({ headless: true, prettyPrint: true, width: 20 })
    ).toBe($$.t`
    <test>
      <node first="1"
        second="2"/>
    </test>
    `)
  })

  test('Pretty print attributes - 2', () => {
    expect(
      $$.create().ele('test')
        .ele('node', { "first": "1", "second": "2", "third": "33333333333333333333", "fourth": 4 })
        .end({ headless: true, prettyPrint: true, width: 10 })
    ).toBe($$.t`
    <test>
      <node
        first="1"
        second="2"
        third="33333333333333333333"
        fourth="4"/>
    </test>
    `)
  })

  test('Pretty print attributes - 3', () => {
    expect(
      $$.create().ele('test')
        .ele('node', { "first": "1", "second": "2", "third": "33333333333333333333", "fourth": 4 })
        .end({ headless: true, prettyPrint: true, width: 1 })
    ).toBe($$.t`
    <test>
      <node
        first="1"
        second="2"
        third="33333333333333333333"
        fourth="4"/>
    </test>
    `)
  })

  test('Pretty print attributes - 4', () => {
    expect(
      $$.create().ele('test')
        .ele('node', { "first": "1", "second": "2" }).ele('child')
        .end({ headless: true, prettyPrint: true, width: 10 })
    ).toBe($$.t`
    <test>
      <node
        first="1"
        second="2">
        <child/>
      </node>
    </test>
    `)
  })

  test('Pretty print attributes - 4', () => {
    expect(
      $$.create().ele('test')
        .ele('node', { "first": "1", "second": "2" }).ele('child')
        .end({ headless: true, prettyPrint: true, width: 10 })
    ).toBe($$.t`
      <test>
        <node
          first="1"
          second="2">
          <child/>
        </node>
      </test>
      `)
  })

  test('Encoding', () => {
    const obj = {
      root: {
        '@att': 'attribute value with &amp; and &#38;',
        '#': 'XML entities for ampersand are &amp; and &#38;.'
      }
    }

    expect($$.create(obj).end()).toBe(
      '<?xml version="1.0"?>' +
      '<root att="attribute value with &amp; and &amp;">' +
      'XML entities for ampersand are &amp; and &amp;.' +
      '</root>')
  })

})
