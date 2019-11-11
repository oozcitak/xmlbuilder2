import $$ from '../TestHelpers'

// samples taken from:
// https://blogs.msmvps.com/martin-honnen/2009/04/13/creating-xml-with-namespaces-with-javascript-and-the-w3c-dom/

describe('namespaces', () => {

  test('default namespace', () => {
    const ns1 = 'http://example.com/ns1'
    const doc = $$.xml({ inheritNS: false }).document().ele(ns1, 'root')
      .ele('foo').ele('bar').txt('foobar').doc() as any

    expect($$.serialize(doc)).toBe('<root xmlns="http://example.com/ns1"><foo xmlns=""><bar>foobar</bar></foo></root>')

    expect(doc.documentElement.namespaceURI).toBe(ns1)
    expect(doc.getElementsByTagName("foo")[0].namespaceURI).toBeNull()
    expect(doc.getElementsByTagName("bar")[0].namespaceURI).toBeNull()
  })

  test('inherit parent namespace', () => {
    const ns1 = 'http://example.com/ns1'
    const doc = $$.xml({ inheritNS: true }).document().ele(ns1, 'root')
      .ele('foo').ele('bar').txt('foobar').doc() as any

    expect($$.serialize(doc)).toBe('<root xmlns="http://example.com/ns1"><foo><bar>foobar</bar></foo></root>')

    expect(doc.documentElement.namespaceURI).toBe(ns1)
    expect(doc.getElementsByTagName("foo")[0].namespaceURI).toBe(ns1)
    expect(doc.getElementsByTagName("bar")[0].namespaceURI).toBe(ns1)
  })

  test('namespace prefix', () => {
    const xmlNs = 'http://www.w3.org/2000/xmlns/'
    const ns1 = 'http://example.com/ns1'
    const xsi = 'http://www.w3.org/2001/XMLSchema-instance'

    const doc = $$.xml({ inheritNS: true }).document().ele(ns1, 'root', {
      "xmlns:xsi": xsi,
      "xsi:schemaLocation": "http://example.com/n1 schema.xsd" })
      .ele('foo').ele('bar').txt('foobar').doc() as any

    expect($$.serialize(doc)).toBe(
      '<root xmlns="http://example.com/ns1"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
        ' xsi:schemaLocation="http://example.com/n1 schema.xsd">' +
        '<foo>' +
          '<bar>foobar</bar>' +
        '</foo>' +
      '</root>')

    expect(doc.documentElement.namespaceURI).toBe(ns1)
    expect(doc.documentElement.getAttributeNode("xmlns:xsi").namespaceURI).toBe(xmlNs)
    expect(doc.documentElement.getAttributeNode("xsi:schemaLocation").namespaceURI).toBe(xsi)
    expect(doc.getElementsByTagName("foo")[0].namespaceURI).toBe(ns1)
    expect(doc.getElementsByTagName("bar")[0].namespaceURI).toBe(ns1)
  })

  test('child namespace declared on parent', () => {
    const xmlNs = 'http://www.w3.org/2000/xmlns/'
    const svgNs = 'http://www.w3.org/2000/svg'
    const xlinkNs = 'http://www.w3.org/1999/xlink'

    const doc = $$.xml({ inheritNS: true }).document().ele(svgNs, 'svg', { 
      "xmlns:xlink": xlinkNs })
      .ele('script', { type: "text/ecmascript", "xlink:href": "foo.js" })
      .doc() as any

    expect($$.serialize(doc)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg"' +
        ' xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<script type="text/ecmascript" xlink:href="foo.js"/>' +
      '</svg>')

    expect(doc.documentElement.namespaceURI).toBe(svgNs)
    expect(doc.documentElement.getAttributeNode("xmlns:xlink").namespaceURI).toBe(xmlNs)
    const script = doc.getElementsByTagName("script")[0]
    expect(script.namespaceURI).toBe(svgNs)
    expect(script.getAttributeNode("type").namespaceURI).toBeNull()
    expect(script.getAttributeNode("xlink:href").namespaceURI).toBe(xlinkNs)
  })

})
