import $$ from '../TestHelpers'

$$.suite('namespaces examples in the wiki', () => {

  $$.test('default namespace', () => {
    const ns1 = 'http://example.com/ns1'
    const doc = $$.create().ele(ns1, 'root')
      .ele('foo').txt('bar').doc()

    $$.deepEqual(doc.end({ headless: true }), '<root xmlns="http://example.com/ns1"><foo>bar</foo></root>')
  })

  $$.test('reset default namespace', () => {
    const ns1 = 'http://example.com/ns1'
    const doc = $$.create().ele(ns1, 'root')
      .ele('', 'foo').txt('bar').doc()

    $$.deepEqual(doc.end({ headless: true }), '<root xmlns="http://example.com/ns1"><foo xmlns="">bar</foo></root>')
  })

  $$.test('namespace declaration attribute', () => {
    const ns1 = 'http://example.com/ns1'
    const xsi = 'http://www.w3.org/2001/XMLSchema-instance'

    const doc = $$.create().ele(ns1, 'root', {
      "xmlns:xsi": xsi,
      "xsi:schemaLocation": "http://example.com/n1 schema.xsd" })
      .ele('', 'foo').txt('bar').doc()

    $$.deepEqual(doc.end({ headless: true }),
      '<root xmlns="http://example.com/ns1"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
        ' xsi:schemaLocation="http://example.com/n1 schema.xsd">' +
        '<foo xmlns="">bar</foo>' +
      '</root>')
  })

  $$.test('element with namespace', () => {
    const svgNs = 'http://www.w3.org/2000/svg'
    const xlinkNs = 'http://www.w3.org/1999/xlink'

    const doc = $$.create().ele(svgNs, 'svg', { "xmlns:xlink": xlinkNs })
      .ele('script', { xmlns: "", type: "text/ecmascript", "xlink:href": "foo.js" })
      .doc()

    $$.deepEqual(doc.end({ headless: true }),
      '<svg xmlns="http://www.w3.org/2000/svg"' +
        ' xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<script xmlns="" type="text/ecmascript" xlink:href="foo.js"/>' +
      '</svg>')
  })

  $$.test('attribute with namespace', () => {
    const ns1 = 'http://example.com/ns1'
    const doc = $$.create().ele('root').att(ns1, 'att', 'val').doc()

    $$.deepEqual(doc.end({ headless: true }), '<root xmlns:ns1="http://example.com/ns1" ns1:att="val"/>')
  })

  $$.test('default namespace with function chaining', () => {
    const result = $$.t`
      <?xml version="1.0"?>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke="#000"/>
        <path d="M50,2a48,48 0 1 1 0,96a24 24 0 1 1 0-48a24 24 0 1 0 0-48"/>
        <circle cx="50" cy="26" r="6"/>
        <circle cx="50" cy="74" r="6" fill="#FFF"/>
      </svg>`
    const svgNs = "http://www.w3.org/2000/svg"
    const svgDoc = $$.create({ defaultNamespace: { ele: svgNs, att: null } })
    svgDoc.ele("svg").att("viewBox", "0 0 100 100")
      .ele("circle").att({ cx: 50, cy: 50, r: 48, fill: "none", stroke: "#000" }).up()
      .ele("path").att("d", "M50,2a48,48 0 1 1 0,96a24 24 0 1 1 0-48a24 24 0 1 0 0-48").up()
      .ele("circle").att({ cx: 50, cy: 26, r: 6 }).up()
      .ele("circle").att({ cx: 50, cy: 74, r: 6, fill: "#FFF" }).up()
    $$.deepEqual(svgDoc.end({ prettyPrint: true }), result)
  })

  $$.test('default namespace with JS objects', () => {
    const result = $$.t`
      <?xml version="1.0"?>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke="#000"/>
        <path d="M50,2a48,48 0 1 1 0,96a24 24 0 1 1 0-48a24 24 0 1 0 0-48"/>
        <circle cx="50" cy="26" r="6"/>
        <circle cx="50" cy="74" r="6" fill="#FFF"/>
      </svg>`
    const svgNs = "http://www.w3.org/2000/svg"
    const svgObj = {
      svg: {
        "@": { viewBox: "0 0 100 100" },
        "#": [
          { circle: { "@": { cx: 50, cy: 50, r: 48, fill: "none", stroke: "#000" } } },
          { path: { "@": { d: "M50,2a48,48 0 1 1 0,96a24 24 0 1 1 0-48a24 24 0 1 0 0-48" } } },
          { circle: { "@": { cx: 50, cy: 26, r: 6 } } },
          { circle: { "@": { cx: 50, cy: 74, r: 6, fill: "#FFF" } } }
        ]
      }
    }
    const svgDoc = $$.create({ defaultNamespace: { ele: svgNs, att: null } }, svgObj)
    $$.deepEqual(svgDoc.end({ prettyPrint: true }), result)
  })

})
