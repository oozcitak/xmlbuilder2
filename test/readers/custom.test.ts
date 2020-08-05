import $$ from '../TestHelpers'

describe('custom parsers', () => {

  test('ObjectReader - skip comments', () => {
    const obj = {
      ele: 'element',
      '!': 'comment'
    }

    const doc = $$.create({ parser: { comment: () => undefined } }).ele('root').ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        ele
          # element
      `)
  })

  test('ObjectReader - skip all nodes', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@': { 'age': 35, 'weight': 75 },
        '?': 'pi mypi',
        '!': 'Good guy',
        '$': 'well formed!',
        address: {
          '?': 'pi',
          city: "Istanbul",
          street: "End of long and winding road"
        },
        contact: {
          phone: ["555-1234", "555-1235"]
        },
        id: () => 42,
        details: {
          '#': 'classified'
        }
      }
    }

    const doc = $$.create({
      parser: {
        attribute: () => undefined,
        cdata: () => undefined,
        docType: () => undefined,
        element: () => undefined,
        instruction: () => undefined,
        text: () => undefined,
        comment: () => undefined
      }
    }).ele('root').ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
      `)
  })

  test('JSONReader - skip comments', () => {
    const json = `{
      "ele": "element",
      "!": "comment"
    }`

    const doc = $$.create({ parser: { comment: () => undefined } }).ele('root').ele(json).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        ele
          # element
      `)
  })

  test('XMLReader - skip DocType', () => {
    const xml = $$.t`
    <?xml version="1.0"?>
    <!DOCTYPE root PUBLIC "pub" "sys">
    <root xmlns="ns"/>`

    const doc = $$.create({ parser: { docType: () => undefined } }, xml).doc()
    expect(doc.end()).toBe('<?xml version="1.0"?><root xmlns="ns"/>')
  })

  test('XMLReader - skip all nodes', () => {
    const xml = $$.t`
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <!DOCTYPE root PUBLIC "pub" "sys">
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
    `

    const doc = $$.create({
      parser: {
        attribute: () => undefined,
        cdata: () => undefined,
        docType: () => undefined,
        element: () => undefined,
        instruction: () => undefined,
        text: () => undefined,
        comment: () => undefined
      }
    }).ele('root').ele(xml).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
      `)
  })

})
