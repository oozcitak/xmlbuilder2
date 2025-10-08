import $$ from '../TestHelpers'
import { Element } from "@oozcitak/dom/lib/dom/interfaces"

$$.suite('XMLWriter', () => {

  $$.test('basic', () => {
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

    $$.deepEqual($$.create({ version: "1.0", encoding: "UTF-8", standalone: true })
      .ele('root').ele(obj).doc().toString({ format: "xml", prettyPrint: true }), $$.t`
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

  $$.test('offset', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
      }
    }

    $$.deepEqual($$.create().ele('root').ele(obj).root().
      toString({ format: "xml", prettyPrint: true, offset: 2 }),
        '    <root>\n' +
        '      <ele>simple element</ele>\n' +
        '      <person age="35">\n' +
        '        <name>John</name>\n' +
        '      </person>\n' +
        '    </root>'
      )
  })

  $$.test('negative offset', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
      }
    }

    $$.deepEqual($$.create().ele('root').ele(obj).root().
      toString({ format: "xml", prettyPrint: true, offset: -2 }),
        '<root>\n' +
        '<ele>simple element</ele>\n' +
        '<person age="35">\n' +
        '<name>John</name>\n' +
        '</person>\n' +
        '</root>'
      )
  })

  $$.test('empty document', () => {
    $$.deepEqual($$.create().end(), `<?xml version="1.0"?>`)
  })

  $$.test('doctype with both public and system identifier', () => {
    $$.deepEqual($$.create().dtd({ pubID: "pub", sysID: "sys" })
      .ele('root').doc().toString({ format: "xml", prettyPrint: true }), $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub" "sys">
      <root/>
      `)
  })

  $$.test('doctype with public identifier', () => {
    $$.deepEqual($$.create().dtd({ pubID: "pub" })
      .ele('root').doc().toString({ format: "xml", prettyPrint: true }), $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub">
      <root/>
      `)
  })

  $$.test('doctype with system identifier', () => {
    $$.deepEqual($$.create().dtd({ sysID: "sys" })
      .ele('root').doc().toString({ format: "xml", prettyPrint: true }), $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root SYSTEM "sys">
      <root/>
      `)
  })

  $$.test('doctype without identifiers', () => {
    $$.deepEqual($$.create().dtd()
      .ele('root').doc().toString({ format: "xml", prettyPrint: true }), $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <root/>
      `)
  })

  $$.test('allowEmptyTags', () => {
    $$.deepEqual($$.create().ele('root').end({ allowEmptyTags: true, prettyPrint: true }), $$.t`
      <?xml version="1.0"?>
      <root></root>
      `)
  })

  $$.test('spaceBeforeSlash', () => {
    $$.deepEqual($$.create().ele('root').end({ spaceBeforeSlash: true, prettyPrint: true }), $$.t`
      <?xml version="1.0"?>
      <root />
      `)
  })

  $$.test('Pretty printing with indentTextOnlyNodes, no mixed content', () => {
    const doc = $$.create().ele('root')
      .ele('node', { 'att': 'val' }).txt('text').up()
      .ele('node').att('att', 'val').txt('text').doc()

    $$.deepEqual(doc.end({ indentTextOnlyNodes: true, prettyPrint: true }), $$.t`
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

  $$.test('Pretty printing with mixed content', () => {
    const doc = $$.create().ele('root')
      .ele('node', { 'att': 'val' }).txt('mixed content')
      .ele('node').att('att', 'val').txt('text').up()
      .txt('more text after node').doc()

    $$.deepEqual(doc.end({ prettyPrint: true }), $$.t`
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

  $$.test('Pretty printing with indentTextOnlyNodes, mixed content', () => {
    const doc = $$.create().ele('root')
      .ele('node', { 'att': 'val' }).txt('mixed content')
      .ele('node').att('att', 'val').txt('text').up()
      .txt('more text after node').doc()

    $$.deepEqual(doc.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true }), $$.t`
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

  $$.test('Various types of text nodes', () => {
    const doc1 = $$.create().ele('root')
      .txt('text1')
      .doc()

    $$.deepEqual(doc1.end({ headless: true, prettyPrint: true }), $$.t`
      <root>text1</root>
      `)

    const doc2 = $$.create().ele('root')
      .txt('text1')
      .txt('text2')
      .doc()

    $$.deepEqual(doc2.end({ headless: true, prettyPrint: true }), $$.t`
      <root>text1text2</root>
      `)

    const doc3 = $$.create().ele('root')
      .txt('text1')
      .ele('node').up()
      .txt('text2')
      .doc()

    $$.deepEqual(doc3.end({ headless: true, prettyPrint: true }), $$.t`
      <root>
        text1
        <node/>
        text2
      </root>
      `)

    const doc4 = $$.create().ele('root')
      .txt('')
      .doc()

    $$.deepEqual(doc4.end({ headless: true, prettyPrint: true }), $$.t`
      <root/>
      `)
  })

  $$.test('Various types of text nodes with indentTextOnlyNodes', () => {
    const doc1 = $$.create().ele('root')
      .txt('text1')
      .doc()

    $$.deepEqual(doc1.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true }), $$.t`
      <root>
        text1
      </root>
      `)

    const doc2 = $$.create().ele('root')
      .txt('text1')
      .txt('text2')
      .doc()

    $$.deepEqual(doc2.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true }), $$.t`
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

    $$.deepEqual(doc3.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true }), $$.t`
      <root>
        text1
        <node/>
        text2
      </root>
      `)
  })

  $$.test('Various types of cdata nodes', () => {
    const doc1 = $$.create().ele('root')
      .dat('text1')
      .doc()

    $$.deepEqual(doc1.end({ headless: true, prettyPrint: true }), $$.t`
      <root><![CDATA[text1]]></root>
      `)

    const doc2 = $$.create().ele('root')
      .dat('text1')
      .dat('text2')
      .doc()

    $$.deepEqual(doc2.end({ headless: true, prettyPrint: true }), $$.t`
      <root>
        <![CDATA[text1]]>
        <![CDATA[text2]]>
      </root>
      `)

    const doc2a = $$.create().ele('root')
      .txt('text1')
      .dat('text2')
      .doc()

    $$.deepEqual(doc2a.end({ headless: true, prettyPrint: true }), $$.t`
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

    $$.deepEqual(doc3.end({ headless: true, prettyPrint: true }), $$.t`
      <root>
        <![CDATA[text1]]>
        <node/>
        <![CDATA[text2]]>
      </root>
      `)

    const doc4 = $$.create().ele('root')
      .dat('')
      .doc()

    $$.deepEqual(doc4.end({ headless: true, prettyPrint: true }), $$.t`
      <root/>
      `)
  })

  $$.test('Various types of cdata nodes with indentTextOnlyNodes', () => {
    const doc1 = $$.create().ele('root')
      .dat('text1')
      .doc()

    $$.deepEqual(doc1.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true }), $$.t`
      <root>
        <![CDATA[text1]]>
      </root>
      `)

    const doc2 = $$.create().ele('root')
      .dat('text1')
      .dat('text2')
      .doc()

    $$.deepEqual(doc2.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true }), $$.t`
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

    $$.deepEqual(doc3.end({ headless: true, indentTextOnlyNodes: true, prettyPrint: true }), $$.t`
      <root>
        <![CDATA[text1]]>
        <node/>
        <![CDATA[text2]]>
      </root>
      `)
  })

  $$.test('element node with xml prefix', () => {
    const ele = $$.create().ele('http://www.w3.org/2000/xmlns/', 'xmlns:root')
    $$.deepEqual(ele.end({ headless: true }), '<xmlns:root/>')
  })

  $$.test('unknown node', () => {
    const ele = $$.create().ele('root').ele('alien')
    Object.defineProperty(ele.node, "nodeType", { value: 1001, writable: false })
    $$.throws(() => ele.end())
  })

  $$.test('escape text data', () => {
    const ele = $$.create().ele('root').txt('&<>')
    $$.deepEqual(ele.toString(), '<root>&amp;&lt;&gt;</root>')
    const ele1 = $$.create().ele('root').txt('&<>;')
    $$.deepEqual(ele1.toString(), '<root>&amp;&lt;&gt;;</root>')
    const ele2 = $$.create().ele('root').txt('& amp;')
    $$.deepEqual(ele2.toString(), '<root>&amp; amp;</root>')
  })

  $$.test('escape attribute value', () => {
    const ele1 = $$.create().ele('root').att('att', '"&<>')
    $$.deepEqual(ele1.toString(), '<root att="&quot;&amp;&lt;&gt;"/>')
    const ele2 = $$.create().ele('root').att('att', 'val')
    Object.defineProperty((ele2.node as Element).attributes.item(0), "value", { value: null })
    $$.deepEqual(ele2.toString(), '<root att=""/>')
    const ele3 = $$.create().ele('root').att('att', '"&<>;')
    $$.deepEqual(ele3.toString(), '<root att="&quot;&amp;&lt;&gt;;"/>')
  })

  $$.test('duplicate attribute name not well-formed', () => {
    // duplicate name
    const ele1 = $$.create().ele('root').att('att', 'val').att('att2', 'val')
    Object.defineProperty((ele1.node as Element).attributes.item(1), "localName", { value: "att" })
    $$.deepEqual(ele1.toString(), '<root att="val" att="val"/>')
  })

  $$.test('wellFormed checks - invalid element node', () => {
    const ele = $$.create().ele('root')
    Object.defineProperty(ele.node, "localName", { value: "x:y", configurable: true })
    $$.throws(() => ele.end({ wellFormed: true }))
    Object.defineProperty(ele.node, "localName", { value: "abc\0", configurable: true })
    $$.throws(() => ele.end({ wellFormed: true }))
    Object.defineProperty(ele.node, "localName", { value: "\0abc", configurable: true })
    $$.throws(() => ele.end({ wellFormed: true }))
    Object.defineProperty(ele.node, "prefix", { value: "xmlns" })
    $$.throws(() => ele.end({ wellFormed: true }))
    Object.defineProperty(ele.node, "localName", { value: "abc\uDBFF", configurable: true })
    $$.throws(() => ele.end({ wellFormed: true }))
    Object.defineProperty(ele.node, "localName", { value: "abc🌃\0", configurable: true })
    $$.throws(() => ele.end({ wellFormed: true }))
    Object.defineProperty(ele.node, "localName", { value: "abc\uDBFFx", configurable: true })
    $$.throws(() => ele.end({ wellFormed: true }))
  })

  $$.test('wellFormed checks - invalid element node', () => {
    const ele = $$.create().ele('http://www.w3.org/2000/xmlns/', 'xmlns:root')
    $$.throws(() => ele.end({ wellFormed: true }))
  })

  $$.test('wellFormed checks - invalid document node', () => {
    const doc = $$.create()
    Object.defineProperty(doc.node, "documentElement", { value: null })
    $$.throws(() => doc.end({ wellFormed: true }))
  })

  $$.test('wellFormed checks - invalid comment node', () => {
    const ele1 = $$.create().ele('root').com('--')
    $$.throws(() => ele1.end({ wellFormed: true }))
    const ele2 = $$.create().ele('root').com('text-')
    $$.throws(() => ele2.end({ wellFormed: true }))
  })

  $$.test('wellFormed checks - invalid text node - 1.0', () => {
    const ele = $$.create().ele('root').txt('abc😊\0')
    $$.throws(() => ele.end({ wellFormed: true }))
    Object.defineProperty(ele.first().node, "data", { value: "abc\uDBFFx", configurable: true })
    $$.throws(() => ele.end({ wellFormed: true }))
    Object.defineProperty(ele.first().node, "data", { value: "abc\0", configurable: true })
    $$.throws(() => ele.end({ wellFormed: true }))
    Object.defineProperty(ele.first().node, "data", { value: "abc\uE000🌃\0", configurable: true })
    $$.throws(() => ele.end({ wellFormed: true }))
    Object.defineProperty(ele.first().node, "data", { value: "abc\uE000🌃", configurable: true })
    $$.doesNotThrow(() => ele.end({ wellFormed: true }))
  })

  $$.test('wellFormed checks - invalid document type node', () => {
    const ele1 = $$.create().ele('root').dtd({ pubID: 'abc😊\0' })
    $$.throws(() => ele1.end({ wellFormed: true }))
    const ele2 = $$.create().ele('root').dtd({ sysID: '\0' })
    $$.throws(() => ele2.end({ wellFormed: true }))
    const ele3 = $$.create().ele('root').dtd({ sysID: '\'quote mismatch"' })
    $$.throws(() => ele3.end({ wellFormed: true }))
  })

  $$.test('wellFormed checks - invalid processing instruction node', () => {
    const ele1 = $$.create().ele('root').ins(':')
    $$.throws(() => ele1.end({ wellFormed: true }))
    const ele2 = $$.create().ele('root').ins('xml')
    $$.throws(() => ele2.end({ wellFormed: true }))
    const ele3 = $$.create().ele('root').ins('name', '\0')
    $$.throws(() => ele3.end({ wellFormed: true }))
    const ele4 = $$.create().ele('root').ins('name', 'data')
    Object.defineProperty(ele4.node.firstChild, "data", { value: "?>" })
    $$.throws(() => ele4.end({ wellFormed: true }))
  })

  $$.test('wellFormed checks - invalid cdata node', () => {
    const ele = $$.create().ele('root').dat('data')
    Object.defineProperty(ele.node.firstChild, "data", { value: "]]>" })
    $$.throws(() => ele.end({ wellFormed: true }))
  })

  $$.test('wellFormed checks - invalid attribute', () => {
    // duplicate name
    const ele1 = $$.create().ele('root').att('att', 'val').att('att2', 'val')
    Object.defineProperty((ele1.node as Element).attributes.item(1), "localName", { value: "att" })
    $$.throws(() => ele1.end({ wellFormed: true }))
    // invalid name
    const ele4 = $$.create().ele('root').att('att', '')
    Object.defineProperty((ele4.node as Element).attributes.item(0), "localName", { value: "att:name" })
    $$.throws(() => ele4.end({ wellFormed: true }))
    const ele5 = $$.create().ele('root').att('att', '')
    Object.defineProperty((ele5.node as Element).attributes.item(0), "localName", { value: "att\0" })
    $$.throws(() => ele5.end({ wellFormed: true }))
    // invalid value
    const ele7 = $$.create().ele('root').att('att', '\0')
    $$.throws(() => ele7.end({ wellFormed: true }))
  })

  $$.test('void HTML element', () => {
    const doc = $$.create().ele('root')
      .ele('http://www.w3.org/1999/xhtml', 'hr')
      .doc()
    $$.deepEqual(doc.end({ prettyPrint: true, headless: true }), $$.t`
      <root>
        <hr xmlns="http://www.w3.org/1999/xhtml" />
      </root>
      `)
  })

  $$.test('Pretty print attributes - 1', () => {
    $$.deepEqual(
      $$.create().ele('test').ele('node', { "first": "1", "second": "2" })
        .end({ headless: true, prettyPrint: true, width: 20 })
    , $$.t`
    <test>
      <node first="1"
        second="2"/>
    </test>
    `)
  })

  $$.test('Pretty print attributes - 2', () => {
    $$.deepEqual(
      $$.create().ele('test')
        .ele('node', { "first": "1", "second": "2", "third": "33333333333333333333", "fourth": 4 })
        .end({ headless: true, prettyPrint: true, width: 10 })
    , $$.t`
    <test>
      <node
        first="1"
        second="2"
        third="33333333333333333333"
        fourth="4"/>
    </test>
    `)
  })

  $$.test('Pretty print attributes - 3', () => {
    $$.deepEqual(
      $$.create().ele('test')
        .ele('node', { "first": "1", "second": "2", "third": "33333333333333333333", "fourth": 4 })
        .end({ headless: true, prettyPrint: true, width: 1 })
    , $$.t`
    <test>
      <node
        first="1"
        second="2"
        third="33333333333333333333"
        fourth="4"/>
    </test>
    `)
  })

  $$.test('Pretty print attributes - 4', () => {
    $$.deepEqual(
      $$.create().ele('test')
        .ele('node', { "first": "1", "second": "2" }).ele('child')
        .end({ headless: true, prettyPrint: true, width: 10 })
    , $$.t`
    <test>
      <node
        first="1"
        second="2">
        <child/>
      </node>
    </test>
    `)
  })

  $$.test('Pretty print attributes - 4', () => {
    $$.deepEqual(
      $$.create().ele('test')
        .ele('node', { "first": "1", "second": "2" }).ele('child')
        .end({ headless: true, prettyPrint: true, width: 10 })
    , $$.t`
      <test>
        <node
          first="1"
          second="2">
          <child/>
        </node>
      </test>
      `)
  })

  $$.test('Encoding', () => {
    const obj = {
      root: {
        '@att': 'attribute value with &amp; and &#38;',
        '#': 'XML entities for ampersand are &amp; and &#38;.'
      }
    }

    $$.deepEqual($$.create(obj).end(),
      '<?xml version="1.0"?>' +
      '<root att="attribute value with &amp; and &amp;">' +
      'XML entities for ampersand are &amp; and &amp;.' +
      '</root>')
  })

})
