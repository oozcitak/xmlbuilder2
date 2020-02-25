import $$ from '../TestHelpers'

describe('well-formed checks', () => {

  test('escape text data', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.ele('ns', 'root').txt('&<>').end()

    $$.expectStreamResult(xmlStream, `<root xmlns="ns">&amp;&lt;&gt;</root>`, done)
  })

  test('escape attribute value - 1', (done) => {
    const xmlStream = $$.createStream()
    xmlStream.ele('ns', 'root').att('att', '"&<>').end()
    $$.expectStreamResult(xmlStream, `<root xmlns="ns" att="&quot;&amp;&lt;&gt;"/>`, done)
  })

  test('escape attribute value - 2', (done) => {
    const xmlStream = $$.createStream()
    xmlStream.ele('ns', 'root').att('att', 'val')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "value", { value: null })
    xmlStream.end()
    $$.expectStreamResult(xmlStream, `<root xmlns="ns" att=""/>`, done)
  })

  test('attribute cannot be child of document', (done) => {
    const xmlStream = $$.createStream()
    $$.expectStreamError(xmlStream, () => xmlStream.att('att', 'val'), done)
  })

  test('text cannot be child of document', (done) => {
    const xmlStream = $$.createStream()
    $$.expectStreamError(xmlStream, () => xmlStream.txt('text'), done)
  })

  test('cannot have multiple document elements', (done) => {
    const xmlStream = $$.createStream()
    $$.expectStreamError(xmlStream, () => xmlStream.ele('root').up().ele('root'), done)
  })

  test('cannot have multiple doctypes', (done) => {
    const xmlStream = $$.createStream()
    xmlStream.dtd({ name: 'root' })
    $$.expectStreamError(xmlStream, () => xmlStream.dtd({ name: 'root', pubID: 'pub' }), done)
  })

  test('cannot have doctype after an element node', (done) => {
    const xmlStream = $$.createStream()
    xmlStream.ele('root').up()
    $$.expectStreamError(xmlStream, () => xmlStream.dtd({ name: 'root', pubID: 'pub' }), done)
  })

  test('document element name must match doctype name', (done) => {
    const xmlStream = $$.createStream()
    xmlStream.dtd({ name: 'root' })
    $$.expectStreamError(xmlStream, () => xmlStream.ele('not-root'), done)
  })

  test('cannot have multiple XML declarations', (done) => {
    const xmlStream = $$.createStream()
    xmlStream.dec({ version: "1.0" })
    $$.expectStreamError(xmlStream, () => xmlStream.dec({ version: "1.0" }), done)
  })

  test('invalid element node - 1', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "x:y" })
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 2', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\0" })
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 3', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "\0abc" })
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 4', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "prefix", { value: "xmlns" })
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 5', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\uDBFF" })
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 6', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc🌃\0" })
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 7', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\uDBFFx" })
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid element node - 8', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    $$.expectStreamError(xmlStream, () => xmlStream.ele('root\0'), done)
  })

  test('invalid comment node - 1', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectStreamError(xmlStream, () => xmlStream.com('--'), done)
  })

  test('invalid comment node - 2', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectStreamError(xmlStream, () => xmlStream.com('text-'), done)
  })

  test('invalid text node', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectStreamError(xmlStream, () => xmlStream.txt('abc😊\0'), done)
  })

  test('invalid document type node', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    $$.expectStreamError(xmlStream, () => xmlStream.dtd({ name: 'root\0', pubID: 'pub' }), done)
    $$.expectStreamError(xmlStream, () => xmlStream.dtd({ name: 'x:y:z', pubID: 'pub' }), done)
    $$.expectStreamError(xmlStream, () => xmlStream.dtd({ name: 'root', pubID: 'abc😊\0' }), done)
    $$.expectStreamError(xmlStream, () => xmlStream.dtd({ name: 'root', sysID: '\0' }), done)
    $$.expectStreamError(xmlStream, () => xmlStream.dtd({ name: 'root', sysID: '\'quote mismatch"' }), done)
  })

  test('invalid processing instruction node', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectStreamError(xmlStream, () => xmlStream.ins(':'), done)
    $$.expectStreamError(xmlStream, () => xmlStream.ins('xml'), done)
    $$.expectStreamError(xmlStream, () => xmlStream.ins('name', '\0'), done)
  })

  test('invalid cdata node', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectStreamError(xmlStream, () => xmlStream.dat(']]>'), done)
  })

  test('same attribute', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('name', 'val').att('name2', 'val')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(1), "localName", { value: "name" })
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('cannot declare XMLNS', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:name', 'http://www.w3.org/2000/xmlns/')
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('cannot undeclare XMLNS', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:name', '')
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid attribute name - 1', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', '')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "localName", { value: ":" })
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid attribute name - 2', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', '')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "localName", { value: "\0" })
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid attribute name - 3', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns', 'value')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "namespaceURI", { value: null })
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('invalid attribute name - 4', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    $$.expectStreamError(xmlStream, () => xmlStream.ele('root').att('att\0', ''), done)
  })

  test('invalid attribute value', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('root').att('att', '\0')
    $$.expectStreamError(xmlStream, () => xmlStream.end(), done)
  })

  test('add element after end', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('root').end()
    $$.expectStreamError(xmlStream, () => xmlStream.com('comment'), done)
  })

})
