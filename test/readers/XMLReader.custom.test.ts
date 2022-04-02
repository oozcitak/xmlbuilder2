import $$ from '../TestHelpers'
import { sanitizeInput } from '../../src/builder/dom'

describe('custom XMLReader', () => {

  test('skip DocType', () => {
    const xml = $$.t`
    <?xml version="1.0"?>
    <!DOCTYPE root PUBLIC "pub" "sys">
    <root xmlns="ns"/>`

    const doc = $$.create({ parser: { docType: () => undefined } }, xml).doc()
    expect(doc.end()).toBe('<?xml version="1.0"?><root xmlns="ns"/>')
  })

  test('skip all nodes', () => {
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

  test('skip DocType', () => {
    const xml = $$.t`
    <?xml version="1.0"?>
    <!DOCTYPE root PUBLIC "pub" "sys">
    <root xmlns="ns"/>`

    const doc = $$.create({ parser: { docType: () => undefined } }, xml).doc()
    expect(doc.end()).toBe('<?xml version="1.0"?><root xmlns="ns"/>')
  })

  test("invalidCharReplacement should apply before parser functions", () => {
    const xml = `
    <root>
      <node1\x00/>
      <node2/>
    </root>
    `

    const obj = $$.convert({
      invalidCharReplacement: '',
      parser: {
        element: (parent, ns, name: string) => {
          expect(sanitizeInput(name, '')).toBe(name)
          return parent.ele(name)
        }
      }
    }, xml, { format: 'object' })
    expect(obj).toEqual({
      root: {
        node1: {},
        node2: {}
      }
    })
  })

  test("skip whitespace only text", () => {
    const xml = $$.t`
    <?xml version="1.0"?>
    <root>
      <ele>      </ele>
    </root>`

    const doc = $$.create({ skipWhitespaceOnlyText: true }, xml).doc()
    expect(doc.end()).toBe(`<?xml version="1.0"?><root><ele/></root>`)
  })

  test("retain whitespace only text", () => {
    const xml = $$.t`
    <?xml version="1.0"?>
    <root>
      <ele>    </ele>
    </root>`

    const doc = $$.create({ skipWhitespaceOnlyText: false }, xml).doc()

    expect(doc.end()).toBe(
      $$.t`
      <?xml version="1.0"?><root>
        <ele>    </ele>
      </root>
      `)
  })
})
