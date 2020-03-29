import $$ from '../TestHelpers'

// samples taken from:
// https://blogs.msmvps.com/martin-honnen/2009/04/13/creating-xml-with-namespaces-with-javascript-and-the-w3c-dom/

describe('namespaces', () => {

  test('inherit parent namespace', () => {
    const ns1 = 'http://example.com/ns1'
    const doc = $$.create().ele(ns1, 'root')
      .ele(ns1, 'foo').ele(ns1, 'bar').txt('foobar').doc().node as any

    expect($$.serialize(doc)).toBe(
      '<root xmlns="http://example.com/ns1">' +
        '<foo>' +
          '<bar>foobar</bar>' +
        '</foo>' +
      '</root>')

    expect(doc.documentElement.namespaceURI).toBe(ns1)
    expect(doc.getElementsByTagName("foo")[0].namespaceURI).toBe(ns1)
    expect(doc.getElementsByTagName("bar")[0].namespaceURI).toBe(ns1)
  })

  test('namespace prefix', () => {
    const ns1 = 'http://example.com/ns1'
    const xsi = 'http://www.w3.org/2001/XMLSchema-instance'

    const doc = $$.create().ele(ns1, 'root')
      .att(xsi, 'xsi:schemaLocation', 'http://example.com/n1 schema.xsd')
      .ele(ns1, 'foo').ele(ns1, 'bar').txt('foobar').doc().node as any

    expect($$.serialize(doc)).toBe(
      '<root xmlns="http://example.com/ns1"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
        ' xsi:schemaLocation="http://example.com/n1 schema.xsd">' +
        '<foo>' +
          '<bar>foobar</bar>' +
        '</foo>' +
      '</root>')
  })

  test('namespace prefix with JS object', () => {
    const ns1 = 'http://example.com/ns1'
    const xsi = 'http://www.w3.org/2001/XMLSchema-instance'

    const obj = {
      [`root@${ns1}`]: {
        '@': { [`xsi:schemaLocation@${xsi}`]: 'http://example.com/n1 schema.xsd' },
        [`foo@${ns1}`]: {
          [`bar@${ns1}`]: 'foobar'
        }
      }
    }
    const doc = $$.create(obj).node as any

    expect($$.serialize(doc)).toBe(
      '<root xmlns="http://example.com/ns1"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
        ' xsi:schemaLocation="http://example.com/n1 schema.xsd">' +
        '<foo>' +
          '<bar>foobar</bar>' +
        '</foo>' +
      '</root>')
  })

  test('child namespace declared on parent', () => {
    const svgNs = 'http://www.w3.org/2000/svg'
    const xlinkNs = 'http://www.w3.org/1999/xlink'

    const doc = $$.create().ele(svgNs, 'svg')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', xlinkNs)
      .ele(svgNs, 'script')
        .att('type', 'text/ecmascript')
        .att(xlinkNs, 'xlink:href', 'foo.js')
      .doc().node as any

    expect($$.serialize(doc)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg"' +
        ' xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<script type="text/ecmascript" xlink:href="foo.js"/>' +
      '</svg>')
  })

  test('add attribute with namespace', () => {
    const ns1 = 'http://example.com/ns1'
    const doc = $$.create().ele('root').att(ns1, 'att', 'val').doc().node as any

    expect($$.serialize(doc)).toBe('<root xmlns:ns1="http://example.com/ns1" ns1:att="val"/>')

    expect(doc.documentElement.attributes.item(0).namespaceURI).toBe(ns1)
  })

  test('remove attribute with namespace', () => {
    const ns1 = 'http://example.com/ns1'
    const doc = $$.create().ele('root').att(ns1, 'att', 'val').removeAtt(ns1, 'att')

    expect($$.serialize(doc.node)).toBe('<root/>')
  })

  test('remove multiple attributes with namespace', () => {
    const ns1 = 'http://example.com/ns1'
    const doc = $$.create().ele('root')
      .att(ns1, 'att1', 'val')
      .att(ns1, 'att2', 'val')
      .removeAtt(ns1, ['att1', 'att2'])

    expect($$.serialize(doc.node)).toBe('<root/>')
  })

  test('built-in namespace alias', () => {
    const doc1 = $$.create().ele('@xml', 'root').att('@xml', 'att', 'val')
    expect($$.serialize(doc1.node)).toBe('<xml:root xml:att="val"/>')
    const doc2 = $$.create().ele('@svg', 'root')
    expect($$.serialize(doc2.node)).toBe('<root xmlns="http://www.w3.org/2000/svg"/>')
  })

  test('custom namespace alias', () => {
    const doc = $$.create({ namespaceAlias: { ns: "ns1" } }).ele('@ns', 'p:root').att('@ns', 'p:att', 'val')
    expect($$.serialize(doc.node)).toBe('<p:root xmlns:p="ns1" p:att="val"/>')
  })

  test('invalid namespace alias', () => {
    const doc = $$.create({ namespaceAlias: { ns: "ns1" } })
    expect(() => doc.ele('@ns1', 'root')).toThrow()
  })

  test('built-in namespace alias with JS object', () => {
    const doc1 = $$.create().ele({ 'root@@xml': { '@att@@xml': 'val' }})
    expect($$.serialize(doc1.node)).toBe('<xml:root xml:att="val"/>')
    const doc2 = $$.create().ele({ 'root@@svg': {} })
    expect($$.serialize(doc2.node)).toBe('<root xmlns="http://www.w3.org/2000/svg"/>')
  })

  test('custom namespace alias with JS object', () => {
    const doc = $$.create({ namespaceAlias: { ns: "ns1" } })
      .ele({ 'p:root@@ns': { '@p:att@@ns': 'val' } })
    expect($$.serialize(doc.node)).toBe('<p:root xmlns:p="ns1" p:att="val"/>')
  })

  test('invalid namespace alias with JS object', () => {
    const doc = $$.create({ namespaceAlias: { ns: "ns1" } })
    expect(() => doc.ele({ 'root@@ns1': {} })).toThrow()
  })

  test('default namespace does not apply if was declared in an ancestor', () => {
    const doc = $$.create()
      .ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns:x', 'uri1')
        .ele('uri1', 'table').att('http://www.w3.org/2000/xmlns/', 'xmlns', 'uri1')
      .doc().node as any
    expect($$.serialize(doc)).toBe(
      '<root xmlns:x="uri1">' +
      '<table xmlns="uri1"/>' +
      '</root>'
    )
  })

})
