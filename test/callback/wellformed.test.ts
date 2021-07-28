import $$ from '../TestHelpers'

describe('well-formed checks', () => {

  test('escape text data', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.ele('ns', 'root').txt('&<>').end()

    $$.expectCBResult(xmlStream, `<root xmlns="ns">&amp;&lt;&gt;</root>`, done)
  })

  test('escape attribute value - 1', (done) => {
    const xmlStream = $$.createCB()
    xmlStream.ele('ns', 'root').att('att', '"&<>').end()
    $$.expectCBResult(xmlStream, `<root xmlns="ns" att="&quot;&amp;&lt;&gt;"/>`, done)
  })

  test('escape attribute value - 2', (done) => {
    const xmlStream = $$.createCB()
    xmlStream.ele('ns', 'root').att('att', 'val')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "value", { value: null })
    xmlStream.end()
    $$.expectCBResult(xmlStream, `<root xmlns="ns" att=""/>`, done)
  })

  test('attribute cannot be child of document', (done) => {
    const xmlStream = $$.createCB()
    $$.expectCBError(xmlStream, () => xmlStream.att('att', 'val'), done)
  })

  test('text cannot be child of document', (done) => {
    const xmlStream = $$.createCB()
    $$.expectCBError(xmlStream, () => xmlStream.txt('text'), done)
  })

  test('cannot have multiple document elements', (done) => {
    const xmlStream = $$.createCB()
    $$.expectCBError(xmlStream, () => xmlStream.ele('root').up().ele('root'), done)
  })

  test('cannot have multiple doctypes', (done) => {
    const xmlStream = $$.createCB()
    xmlStream.dtd({ name: 'root' })
    $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root', pubID: 'pub' }), done)
  })

  test('cannot have doctype after an element node', (done) => {
    const xmlStream = $$.createCB()
    xmlStream.ele('root').up()
    $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root', pubID: 'pub' }), done)
  })

  test('document element name must match doctype name', (done) => {
    const xmlStream = $$.createCB()
    xmlStream.dtd({ name: 'root' })
    $$.expectCBError(xmlStream, () => xmlStream.ele('not-root'), done)
  })

  test('cannot have multiple XML declarations', (done) => {
    const xmlStream = $$.createCB()
    xmlStream.dec({ version: "1.0" })
    $$.expectCBError(xmlStream, () => xmlStream.dec({ version: "1.0" }), done)
  })

  test('invalid element node - 1', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "x:y" })
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 2', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\0" })
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 3', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "\0abc" })
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 4', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "prefix", { value: "xmlns" })
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 5', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\uDBFF" })
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 6', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc🌃\0" })
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 7', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\uDBFFx" })
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 8', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    $$.expectCBError(xmlStream, () => xmlStream.ele('root\0'), done)
  })

  test('invalid comment node - 1', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectCBError(xmlStream, () => xmlStream.com('--'), done)
  })

  test('invalid comment node - 2', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectCBError(xmlStream, () => xmlStream.com('text-'), done)
  })

  test('invalid text node', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectCBError(xmlStream, () => xmlStream.txt('abc😊\0'), done)
  })

  test('invalid document type node 1', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root\0', pubID: 'pub' }), done)
  })

  test('invalid document type node 2', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'x:y:z', pubID: 'pub' }), done)
  })

  test('invalid document type node 3', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root', pubID: 'abc😊\0' }), done)
  })

  test('invalid document type node 4', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root', sysID: '\0' }), done)
  })

  test('invalid document type node 5', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root', sysID: '\'quote mismatch"' }), done)
  })

  test('invalid processing instruction node 1', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectCBError(xmlStream, () => xmlStream.ins(':'), done)
  })

  test('invalid processing instruction node 2', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectCBError(xmlStream, () => xmlStream.ins('xml'), done)
  })

  test('invalid processing instruction node 3', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectCBError(xmlStream, () => xmlStream.ins('name', '\0'), done)
  })

  test('invalid cdata node', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectCBError(xmlStream, () => xmlStream.dat(']]>'), done)
  })

  test('same attribute', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('name', 'val').att('name2', 'val')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(1), "localName", { value: "name" })
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('cannot declare XMLNS', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:name', 'http://www.w3.org/2000/xmlns/')
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('cannot undeclare XMLNS', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:name', '')
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid attribute name - 1', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', '')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "localName", { value: ":" })
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid attribute name - 2', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', '')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "localName", { value: "\0" })
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid attribute name - 3', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns', 'value')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "namespaceURI", { value: null })
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid attribute name - 4', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    $$.expectCBError(xmlStream, () => xmlStream.ele('root').att('att\0', ''), done)
  })

  test('invalid attribute value', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('root').att('att', '\0')
    $$.expectCBError(xmlStream, () => xmlStream.end(), done)
  })

  test('add element after end', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('root').end()
    $$.expectCBError(xmlStream, () => xmlStream.com('comment'), done)
  })

})
