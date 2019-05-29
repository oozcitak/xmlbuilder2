import $$ from '../TestHelpers'

describe('XMLSerializer', function () {

  test('XML serializer', function () {
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

  test('XML serializer + parser', function () {
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

  test('XML serializer: default namespace', function () {
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

  test('XML serializer: namespace prefix', function () {
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
      '<root xmlns="uri:myns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="uri:myschema.xsd"><node1><node2>text</node2></node1></root>'
    )
    expect($$.printTree(doc)).toBe($$.t`
      root (ns:uri:myns) xsi:schemaLocation="uri:myschema.xsd" (ns:http://www.w3.org/2001/XMLSchema-instance)
        node1 (ns:uri:myns)
          node2 (ns:uri:myns)
            # text
      `)
  })

})