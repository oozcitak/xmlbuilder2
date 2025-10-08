import $$ from '../TestHelpers'

$$.suite('well-formed checks', () => {

  $$.test('escape text data', async () => {
    const xmlStream = $$.createCB()

    xmlStream.ele('ns', 'root').txt('&<>').end()

    await $$.expectCBResult(xmlStream, `<root xmlns="ns">&amp;&lt;&gt;</root>`)
  })

  $$.test('escape attribute value - 1', async () => {
    const xmlStream = $$.createCB()
    xmlStream.ele('ns', 'root').att('att', '"&<>').end()
    await $$.expectCBResult(xmlStream, `<root xmlns="ns" att="&quot;&amp;&lt;&gt;"/>`)
  })

  $$.test('escape attribute value - 2', async () => {
    const xmlStream = $$.createCB()
    xmlStream.ele('ns', 'root').att('att', 'val')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "value", { value: null })
    xmlStream.end()
    await $$.expectCBResult(xmlStream, `<root xmlns="ns" att=""/>`)
  })

  $$.test('attribute cannot be child of document', async () => {
    const xmlStream = $$.createCB()
    await $$.expectCBError(xmlStream, () => xmlStream.att('att', 'val'))
  })

  $$.test('text cannot be child of document', async () => {
    const xmlStream = $$.createCB()
    await $$.expectCBError(xmlStream, () => xmlStream.txt('text'))
  })

  $$.test('cannot have multiple document elements', async () => {
    const xmlStream = $$.createCB()
    await $$.expectCBError(xmlStream, () => xmlStream.ele('root').up().ele('root'))
  })

  $$.test('cannot have multiple doctypes', async () => {
    const xmlStream = $$.createCB()
    xmlStream.dtd({ name: 'root' })
    await $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root', pubID: 'pub' }))
  })

  $$.test('cannot have doctype after an element node', async () => {
    const xmlStream = $$.createCB()
    xmlStream.ele('root').up()
    await $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root', pubID: 'pub' }))
  })

  $$.test('document element name must match doctype name', async () => {
    const xmlStream = $$.createCB()
    xmlStream.dtd({ name: 'root' })
    await $$.expectCBError(xmlStream, () => xmlStream.ele('not-root'))
  })

  $$.test('cannot have multiple XML declarations', async () => {
    const xmlStream = $$.createCB()
    xmlStream.dec({ version: "1.0" })
    await $$.expectCBError(xmlStream, () => xmlStream.dec({ version: "1.0" }))
  })

  $$.test('invalid element node - 1', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "x:y" })
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('invalid element node - 2', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\0" })
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('invalid element node - 3', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "\0abc" })
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('invalid element node - 4', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "prefix", { value: "xmlns" })
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('invalid element node - 5', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\uDBFF" })
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('invalid element node - 6', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc🌃\0" })
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('invalid element node - 7', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    Object.defineProperty((xmlStream as any)._currentElement.node, "localName", { value: "abc\uDBFFx" })
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('invalid element node - 8', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    await $$.expectCBError(xmlStream, () => xmlStream.ele('root\0'))
  })

  $$.test('invalid comment node - 1', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    await $$.expectCBError(xmlStream, () => xmlStream.com('--'))
  })

  $$.test('invalid comment node - 2', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    await $$.expectCBError(xmlStream, () => xmlStream.com('text-'))
  })

  $$.test('invalid text node', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    await $$.expectCBError(xmlStream, () => xmlStream.txt('abc😊\0'))
  })

  $$.test('invalid document type node 1', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    await $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root\0', pubID: 'pub' }))
  })

  $$.test('invalid document type node 2', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    await $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'x:y:z', pubID: 'pub' }))
  })

  $$.test('invalid document type node 3', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    await $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root', pubID: 'abc😊\0' }))
  })

  $$.test('invalid document type node 4', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    await $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root', sysID: '\0' }))
  })

  $$.test('invalid document type node 5', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    await $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: 'root', sysID: '\'quote mismatch"' }))
  })

  $$.test('invalid processing instruction node 1', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    await $$.expectCBError(xmlStream, () => xmlStream.ins(':'))
  })

  $$.test('invalid processing instruction node 2', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    await $$.expectCBError(xmlStream, () => xmlStream.ins('xml'))
  })

  $$.test('invalid processing instruction node 3', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    await $$.expectCBError(xmlStream, () => xmlStream.ins('name', '\0'))
  })

  $$.test('invalid cdata node', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    await $$.expectCBError(xmlStream, () => xmlStream.dat(']]>'))
  })

  $$.test('same attribute', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('name', 'val').att('name2', 'val')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(1), "localName", { value: "name" })
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('cannot declare XMLNS', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:name', 'http://www.w3.org/2000/xmlns/')
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('cannot undeclare XMLNS', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root').att('http://www.w3.org/2000/xmlns/', 'xmlns:name', '')
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('invalid attribute name - 1', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', '')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "localName", { value: ":" })
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('invalid attribute name - 2', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns:att', '')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "localName", { value: "\0" })
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('invalid attribute name - 3', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('root').att('http://www.w3.org/2000/xmlns/', 'xmlns', 'value')
    Object.defineProperty((xmlStream as any)._currentElement.node.attributes.item(0), "namespaceURI", { value: null })
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('invalid attribute name - 4', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    await $$.expectCBError(xmlStream, () => xmlStream.ele('root').att('att\0', ''))
  })

  $$.test('invalid attribute value', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('root').att('att', '\0')
    await $$.expectCBError(xmlStream, () => xmlStream.end())
  })

  $$.test('add element after end', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('root').end()
    await $$.expectCBError(xmlStream, () => xmlStream.com('comment'))
  })

})
