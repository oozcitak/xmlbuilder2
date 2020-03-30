import $$ from '../TestHelpers'

describe('Sanitize input strings', () => {

  test('parser', () => {
    const doc = $$.create({ invalidCharReplacement: '' }, '<root\x00>te\x08xt</\x00root\x00>')

    expect(doc.end({ headless: true })).toBe($$.t`
      <root>text</root>
      `)
  })

  test('JS object', () => {
    const doc = $$.create({ invalidCharReplacement: '' }, { 'root\x00': 'te\x08xt' })

    expect(doc.end({ headless: true })).toBe($$.t`
      <root>text</root>
      `)
  })

  test('ele', () => {
    const doc = $$.create({ invalidCharReplacement: '' })
      .ele('root\x00').txt('te\x08xt')
      .doc()

    expect(doc.end({ headless: true })).toBe($$.t`
      <root>text</root>
      `)
  })

  test('ele et al.', () => {
    const obj = {
      ele: "simple \x00element",
      person: {
        name: "Jo\x00hn",
        '@a\x00ge': 35,
        '?\x001': 'pi val',
        '?\x002': 'pi\x00',
        '!\x00': 'Good guy',
        '$\x00': 'well formed!',
        address: {
          city: "Istan\x00bul",
          street: "End o\x00f long and winding road"
        },
        contact: {
          phone: ["555-\x001234", "555-\x001235"]
        },
        id: () => '4\x002',
        details: {
          '#text': 'class\x00ified'
        }
      }
    }

    expect($$.create({ version: "1.0", encoding: "UTF-8", standalone: true, invalidCharReplacement: '' })
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

  test('with replacement function - 1', () => {
    const doc = $$.create({ invalidCharReplacement: c => c === '\x00' ? '' : '_' })
      .ele('root\x00').txt('text\x08content')
      .doc()

    expect(doc.end({ headless: true })).toBe($$.t`
      <root>text_content</root>
      `)
  })

  test('with replacement function - 2', () => {
    const doc = $$.create({
      invalidCharReplacement: (c, i, str) => str.startsWith('root') ? '' : i === 0 ? '_' : ' '
    }).ele('root\x00').txt('\x00text\x08content')
      .doc()

    expect(doc.end({ headless: true })).toBe($$.t`
      <root>_text content</root>
      `)
  })

})
