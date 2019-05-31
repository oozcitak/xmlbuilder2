import $$ from '../TestHelpers'

describe('XMLSerializer', function () {

  test('basic', function () {
    const doc = $$.create()
      .ele('root')
      .ele('node', { att: 'val' })
      .up()
      .com('same node below')
      .ele('node', { att: 'val', att2: 'val2' })
      .up()
      .ins('kidding', 'itwas="different"')
      .ins('for', 'real')
      .dat('<greeting>Hello, world!</greeting>')
      .ele('text', 'alien\'s pinky toe')
      .doc()

    expect($$.serialize(doc)).toBe(
      '<root>' +
      '<node att="val"/>' +
      '<!--same node below-->' +
      '<node att="val" att2="val2"/>' +
      '<?kidding itwas="different"?>' +
      '<?for real?>' +
      '<![CDATA[<greeting>Hello, world!</greeting>]]>' +
      '<text>alien\'s pinky toe</text>' +
      '</root>'
    )
  })

  test('serializer + parser', function () {
    const xmlStr =
      '<section xmlns="http://www.ibm.com/events"' +
      ' xmlns:bk="urn:loc.gov:books"' +
      ' xmlns:pi="urn:personalInformation"' +
      ' xmlns:isbn="urn:ISBN:0-395-36341-6">' +
      '<title>Book-Signing Event</title>' +
      '<signing>' +
      '<bk:author pi:title="Mr" pi:name="Jim Ross"/>' +
      '<book bk:title="Writing COBOL for Fun and Profit" isbn:number="0426070806"/>' +
      '<comment xmlns="">What a great issue!</comment>' +
      '</signing>' +
      '</section>'

    expect($$.serialize($$.parse(xmlStr))).toBe(xmlStr)
  })

  test('default namespace', function () {
    const ns = 'uri:myns'
    const doc = $$.dom.createDocument(ns, 'root')
    const node1 = doc.createElementNS(ns, 'node1')
    if (doc.documentElement) {
      doc.documentElement.appendChild(node1)
    }
    const node2 = doc.createElementNS(ns, 'node2')
    node1.appendChild(node2)
    node2.appendChild(doc.createTextNode('text'))

    expect($$.serialize(doc)).toBe(
      '<root xmlns="uri:myns"><node1><node2>text</node2></node1></root>'
    )
    expect($$.printTree(doc)).toBe($$.t`
      root (ns:uri:myns)
        node1 (ns:uri:myns)
          node2 (ns:uri:myns)
            # text
      `)
  })

  test('namespace prefix', function () {
    const ns = 'uri:myns'
    const doc = $$.dom.createDocument(ns, 'root')
    const node1 = doc.createElementNS(ns, 'node1')
    if (doc.documentElement) {
      doc.documentElement.setAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'xsi:schemaLocation', 'uri:myschema.xsd')
      doc.documentElement.appendChild(node1)
    }
    const node2 = doc.createElementNS(ns, 'node2')
    node1.appendChild(node2)
    node2.appendChild(doc.createTextNode('text'))

    expect($$.serialize(doc)).toBe(
      '<root xmlns="uri:myns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="uri:myschema.xsd">' +
      '<node1><node2>text</node2></node1>' +
      '</root>'
    )
    expect($$.printTree(doc)).toBe($$.t`
      root (ns:uri:myns) xsi:schemaLocation="uri:myschema.xsd" (ns:http://www.w3.org/2001/XMLSchema-instance)
        node1 (ns:uri:myns)
          node2 (ns:uri:myns)
            # text
      `)
  })

  test('explicit namespace declaration', function () {
    const svgNs = 'http://www.w3.org/2000/svg'
    const xlinkNs = 'http://www.w3.org/1999/xlink'

    const doc = $$.dom.createDocument(svgNs, 'svg')
    if (doc.documentElement) {
      doc.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', xlinkNs)

      const script = doc.createElementNS(svgNs, 'script')
      script.setAttributeNS(null, 'type', 'text/ecmascript')
      script.setAttributeNS(xlinkNs, 'xlink:href', 'foo.js')

      doc.documentElement.appendChild(script)
    }

    expect($$.serialize(doc)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
      '<script type="text/ecmascript" xlink:href="foo.js"/>' +
      '</svg>'
    )
    expect($$.printTree(doc)).toBe($$.t`
      svg (ns:http://www.w3.org/2000/svg) xmlns:xlink="http://www.w3.org/1999/xlink" (ns:http://www.w3.org/2000/xmlns/)
        script (ns:http://www.w3.org/2000/svg) type="text/ecmascript" xlink:href="foo.js" (ns:http://www.w3.org/1999/xlink)
      `)
  })

  test('empty default namespace', function () {
    const svgNs = 'http://www.w3.org/2000/svg'

    const doc = $$.dom.createDocument(svgNs, 'svg')
    if (doc.documentElement) {
      const script = doc.createElementNS(null, 'script')
      doc.documentElement.appendChild(script)
    }

    expect($$.serialize(doc)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg">' +
      '<script xmlns=""/>' +
      '</svg>'
    )
    expect($$.printTree(doc)).toBe($$.t`
      svg (ns:http://www.w3.org/2000/svg)
        script
      `)
  })

  test('default namespace override', function () {
    const svgNs = 'http://www.w3.org/2000/svg'
    const xlinkNs = 'http://www.w3.org/1999/xlink'

    const doc = $$.dom.createDocument(svgNs, 'svg')
    if (doc.documentElement) {
      const script = doc.createElementNS(xlinkNs, 'script')
      doc.documentElement.appendChild(script)
    }

    expect($$.serialize(doc)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg">' +
      '<script xmlns="http://www.w3.org/1999/xlink"/>' +
      '</svg>'
    )
    expect($$.printTree(doc)).toBe($$.t`
      svg (ns:http://www.w3.org/2000/svg)
        script (ns:http://www.w3.org/1999/xlink)
      `)
  })

  test('prefixed namespace override', function () {
    const ns1 = 'uri:my ns1'
    const ns2 = 'uri:my ns2'

    const doc = $$.dom.createDocument(ns1, 'p:root')
    if (doc.documentElement) {
      const node1 = doc.createElementNS(ns1, 'p:node')
      doc.documentElement.appendChild(node1)
      node1.appendChild(doc.createElementNS(ns1, 'p:child'))
      const node2 = doc.createElementNS(ns2, 'p:node')
      doc.documentElement.appendChild(node2)
      node2.appendChild(doc.createElementNS(ns2, 'p:child'))
      const node3 = doc.createElementNS(ns1, 'p:node')
      doc.documentElement.appendChild(node3)
      node3.appendChild(doc.createElementNS(ns1, 'p:child'))
    }

    expect($$.serialize(doc)).toBe(
      '<p:root xmlns:p="uri:my ns1">' +
      '<p:node><p:child/></p:node>' +
      '<p:node xmlns:p="uri:my ns2"><p:child/></p:node>' +
      '<p:node><p:child/></p:node>' +
      '</p:root>'
    )
    expect($$.printTree(doc)).toBe($$.t`
      p:root (ns:uri:my ns1)
        p:node (ns:uri:my ns1)
          p:child (ns:uri:my ns1)
        p:node (ns:uri:my ns2)
          p:child (ns:uri:my ns2)
        p:node (ns:uri:my ns1)
          p:child (ns:uri:my ns1)
      `)
  })

})