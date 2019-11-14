import $$ from '../TestHelpers'

describe('namespaces examples in the wiki', () => {

  test('default namespace', () => {
    const ns1 = 'http://example.com/ns1'
    const doc = $$.document().ele(ns1, 'root')
      .ele('foo').txt('bar').doc()

    expect(doc.end({ headless: true })).toBe('<root xmlns="http://example.com/ns1"><foo>bar</foo></root>')
  })

  test('namespace declaration attribute', () => {
    const ns1 = 'http://example.com/ns1'
    const xsi = 'http://www.w3.org/2001/XMLSchema-instance'

    const doc = $$.document().ele(ns1, 'root', {
      "xmlns:xsi": xsi,
      "xsi:schemaLocation": "http://example.com/n1 schema.xsd" })
      .ele('foo').txt('bar').doc()

    expect(doc.end({ headless: true })).toBe(
      '<root xmlns="http://example.com/ns1"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
        ' xsi:schemaLocation="http://example.com/n1 schema.xsd">' +
        '<foo>bar</foo>' +
      '</root>')
  })

  test('element with namespace', () => {
    const svgNs = 'http://www.w3.org/2000/svg'
    const xlinkNs = 'http://www.w3.org/1999/xlink'

    const doc = $$.document().ele(svgNs, 'svg', { 
      "xmlns:xlink": xlinkNs })
      .ele('script', { type: "text/ecmascript", "xlink:href": "foo.js" })
      .doc()

    expect(doc.end({ headless: true })).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg"' +
        ' xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<script type="text/ecmascript" xlink:href="foo.js"/>' +
      '</svg>')
  })

  test('attribute with namespace', () => {
    const ns1 = 'http://example.com/ns1'
    const doc = $$.document().ele('root').att(ns1, 'att', 'val').doc()

    expect(doc.end({ headless: true })).toBe('<root xmlns:ns1="http://example.com/ns1" ns1:att="val"/>')
  })

})
