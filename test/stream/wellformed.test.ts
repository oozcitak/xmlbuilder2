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

  test('attribute cannot be child of document', () => {
    const xmlStream = $$.createStream()
    expect(() => xmlStream.att('att', 'val')).toThrow()
  })

  test('text cannot be child of document', () => {
    const xmlStream = $$.createStream()
    expect(() => xmlStream.txt('text')).toThrow()
  })

  test('cannot have multiple document elements', () => {
    const xmlStream = $$.createStream()
    expect(() => xmlStream.ele('root').up().ele('root')).toThrow()
  })

  test('cannot have multiple doctypes', () => {
    const xmlStream = $$.createStream()
    xmlStream.dtd('root')
    expect(() => xmlStream.dtd('root', { pubID: 'pub' })).toThrow()
  })

  test('cannot have doctype after an element node', () => {
    const xmlStream = $$.createStream()
    xmlStream.ele('root').up()
    expect(() => xmlStream.dtd('root', { pubID: 'pub' })).toThrow()
  })

  test('cannot have multiple XML declarations', () => {
    const xmlStream = $$.createStream()
    xmlStream.dec({ version: "1.0" })
    expect(() => xmlStream.dec({ version: "1.0" })).toThrow()
  })

  test('invalid element node - 1', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "x:y" })
    expect(() => xmlStream.end()).toThrow()
    done()
  })

  test('invalid element node - 2', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\0" })
    expect(() => xmlStream.end()).toThrow()
    done()
  })

  test('invalid element node - 3', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "\0abc" })
    expect(() => xmlStream.end()).toThrow()
    done()
  })

  test('invalid element node - 4', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "prefix", { value: "xmlns" })
    expect(() => xmlStream.end()).toThrow()
    done()
  })

  test('invalid element node - 5', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\uDBFF" })
    expect(() => xmlStream.end()).toThrow()
    done()
  })

  test('invalid element node - 6', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc🌃\0" })
    expect(() => xmlStream.end()).toThrow()
    done()
  })

  test('invalid element node - 7', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\uDBFFx" })
    expect(() => xmlStream.end()).toThrow()
    done()
  })

  test('invalid comment node - 1', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    expect(() => xmlStream.com('--')).toThrow()
  })

  test('invalid comment node - 2', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    expect(() => xmlStream.com('text-')).toThrow()
  })

  test('invalid text node', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    expect(() => xmlStream.txt('abc😊\0')).toThrow()
  })

  test('invalid document type node', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    expect(() => xmlStream.dtd('root\0', { pubID: 'pub' })).toThrow()
    expect(() => xmlStream.dtd('x:y:z', { pubID: 'pub' })).toThrow()
    expect(() => xmlStream.dtd('root', { pubID: 'abc😊\0' })).toThrow()
    expect(() => xmlStream.dtd('root', { sysID: '\0' })).toThrow()
    expect(() => xmlStream.dtd('root', { sysID: '\'quote mismatch"' })).toThrow()
  })

  test('invalid processing instruction node', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    expect(() => xmlStream.ins(':')).toThrow()
    expect(() => xmlStream.ins('xml')).toThrow()
    expect(() => xmlStream.ins('name', '\0')).toThrow()
  })

  test('invalid cdata node', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    expect(() => xmlStream.dat(']]>')).toThrow()
  })

  test('same attribute', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('name', 'val').att('name2', 'val')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(1), "localName", { value: "name" })
    expect(() => xmlStream.end()).toThrow()
  })

  test('cannot declare XMLNS', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:name', 'http://www.w3.org/2000/xmlns/')
    expect(() => xmlStream.end()).toThrow()
  })

  test('cannot undeclare XMLNS', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:name', '')
    expect(() => xmlStream.end()).toThrow()
  })

  test('invalid attribute name - 1', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', '')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "localName", { value: ":" })
    expect(() => xmlStream.end()).toThrow()
  })

  test('invalid attribute name - 2', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', '')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "localName", { value: "\0" })
    expect(() => xmlStream.end()).toThrow()
  })

  test('invalid attribute name - 3', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns', 'value')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "namespaceURI", { value: null })
    expect(() => xmlStream.end()).toThrow()
  })

  test('invalid attribute value', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('root').att('att', '\0')
    expect(() => xmlStream.end()).toThrow()
  })

})
