import $$ from './TestHelpers'

describe('Document', function () {

  const doctype = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
  const doc = $$.dom.createDocument('myns', 'n:root', doctype)

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const tele = doc.createElement('node_with_id')
  const tele1 = doc.createElement('tagged')
  const tele2 = doc.createElement('tagged')
  const nele1 = doc.createElementNS('http://www.w3.org/1999/xhtml', 'div')
  const text1 = doc.createTextNode('contents')
  doc.documentElement.appendChild(tele1)
  tele1.id = 'tele1'
  doc.documentElement.appendChild(tele)
  tele.id = 'uniq'
  doc.documentElement.appendChild(tele2)
  tele2.id = 'tele2'
  doc.documentElement.appendChild(nele1)
  nele1.id = 'div1'
  nele1.setAttribute('class', 'para')
  nele1.appendChild(text1)
  const sroot = doc.createElement('shadow')
  doc.documentElement.appendChild(sroot)
  const custom = doc.createElementNS('http://www.w3.org/1999/xhtml', 'my-custom-element')
  sroot.appendChild(custom)
  const shadow = custom.attachShadow({ mode: 'open' })

  test('constructor()', function () {
    expect($$.printTree(doc)).toBe($$.t`
      !DOCTYPE qname PUBLIC pubid sysid
      n:root (ns:myns)
        tagged id="tele1"
        node_with_id id="uniq"
        tagged id="tele2"
        div (ns:http://www.w3.org/1999/xhtml) id="div1" class="para"
          # contents
        shadow
          my-custom-element (ns:http://www.w3.org/1999/xhtml)
      `)
    expect(doc.URL).toBe('about:blank')
    expect(doc.documentURI).toBe('about:blank')
    expect(doc.origin).toBe('')
    expect(doc.compatMode).toBe('CSS1Compat')
    expect(doc.characterSet).toBe('UTF-8')
    expect(doc.charset).toBe('UTF-8')
    expect(doc.inputEncoding).toBe('UTF-8')
    expect(doc.contentType).toBe('application/xml')
    expect(doc.nodeType).toBe(9)
    expect(doc.nodeName).toBe('#document')
    expect(doc.doctype).toBe(doctype)
    expect(doc.documentElement && doc.documentElement.tagName).toBe('n:root')
    expect(() => doc.createElement('invalid name')).toThrow()
  })

  test('doctype', function () {
    expect(doc.doctype).toBe(doctype)
    const emptyDoc = $$.dom.createDocument(null, 'root')
    expect(emptyDoc.doctype).toBe(null)
  })

  test('getElementById()', function () {
    expect(doc.getElementById('uniq')).toBe(tele)
  })

  test('getElementsByTagName()', function () {
    const list = doc.getElementsByTagName('tagged')
    expect(list.length).toBe(2)
    expect(list.item(0)).toBe(tele1)
    expect(list.item(1)).toBe(tele2)
    const listAll = doc.getElementsByTagName('*')
    expect(listAll.length).toBe(7)
  })

  test('getElementsByTagNameNS()', function () {
    const list = doc.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'div')
    expect(list.length).toBe(1)
    expect(list.item(0)).toBe(nele1)
  })

  test('getElementsByClassName()', function () {
    const list = doc.getElementsByClassName('para')
    expect(list.length).toBe(1)
    expect(list.item(0)).toBe(nele1)
  })

  test('createElement()', function () {
    expect(() => { doc.createElement('invalid name') }).toThrow()
    const ele = doc.createElement('tagged')
    expect(ele.tagName).toBe('tagged')
  })

  test('createElementNS()', function () {
    expect(() => { doc.createElementNS('http://www.w3.org/1999/xhtml', 'invalid name') }).toThrow()
    const ele = doc.createElementNS('http://www.w3.org/1999/xhtml', 'n:div')
    expect(ele.tagName).toBe('n:div')
    expect(ele.namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    expect(ele.prefix).toBe('n')
    expect(ele.localName).toBe('div')
    expect(() => { doc.createElementNS(null, 'prefix:name') }).toThrow()
    expect(() => { doc.createElementNS('some ns', 'xml:name') }).toThrow()
    expect(() => { doc.createElementNS('some ns', 'xmlns:name') }).toThrow()
    expect(() => { doc.createElementNS('some ns', 'xmlns') }).toThrow()
    expect(() => { doc.createElementNS('http://www.w3.org/2000/xmlns/', 'some:name') }).toThrow()
    expect(() => { doc.createElementNS('http://www.w3.org/2000/xmlns/', 'somename') }).toThrow()
  })

  test('createDocumentFragment()', function () {
    const ele = doc.createDocumentFragment()
    expect(ele.nodeType).toBe(11)
    expect(ele.nodeName).toBe('#document-fragment')
  })

  test('createTextNode()', function () {
    const ele = doc.createTextNode('contents')
    expect(ele.nodeType).toBe(3)
    expect(ele.nodeName).toBe('#text')
    expect(ele.data).toBe('contents')
  })

  test('createCDATASection()', function () {
    expect(() => { doc.createCDATASection(']]>') }).toThrow()
    const ele = doc.createCDATASection('contents')
    expect(ele.nodeType).toBe(4)
    expect(ele.nodeName).toBe('#cdata-section')
    expect(ele.data).toBe('contents')
  })

  test('createComment()', function () {
    const ele = doc.createComment('contents')
    expect(ele.nodeType).toBe(8)
    expect(ele.nodeName).toBe('#comment')
    expect(ele.data).toBe('contents')
  })

  test('createProcessingInstruction()', function () {
    expect(() => { doc.createProcessingInstruction('invalid target', 'contents') }).toThrow()
    expect(() => { doc.createProcessingInstruction('target', '?>') }).toThrow()
    const ele = doc.createProcessingInstruction('target', 'contents')
    expect(ele.nodeType).toBe(7)
    expect(ele.nodeName).toBe('target')
    expect(ele.data).toBe('contents')
  })

  test('createAttribute()', function () {
    expect(() => { doc.createAttribute('invalid name') }).toThrow()
    const ele = doc.createAttribute('attr')
    expect(ele.name).toBe('attr')
  })

  test('createAttributeNS()', function () {
    expect(() => { doc.createAttributeNS('http://www.w3.org/1999/xhtml', 'invalid name') }).toThrow()
    const ele = doc.createAttributeNS('http://www.w3.org/1999/xhtml', 'n:div')
    expect(ele.name).toBe('n:div')
    expect(ele.namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    expect(ele.prefix).toBe('n')
    expect(ele.localName).toBe('div')
  })

  test('importNode()', function () {
    const ele1 = doc.createElement('tagged')
    ele1.setAttribute('att', 'val')
    const ele2 = doc.importNode(ele1)
    expect(ele1).not.toBe(ele2)
    expect(ele1.nodeType).toBe(ele2.nodeType)
    expect(ele1.nodeName).toBe(ele2.nodeName)
    expect(() => doc.importNode($$.dom.createDocument('myns', 'root'))).toThrow()
    expect(() => doc.importNode(shadow)).toThrow()
  })

  test('adoptNode()', function () {
    const otherDoc = $$.dom.createDocument('myns', 'otherroot')
    const otherEle = otherDoc.createElement('othernode')
    const anotherEle = otherDoc.createElement('anothernode')

    if (otherDoc.documentElement) {
      otherDoc.documentElement.appendChild(otherEle)
      otherEle.appendChild(anotherEle)
      expect(otherDoc.documentElement.firstChild).toBe(otherEle)
    }

    doc.adoptNode(otherEle)
    expect(otherEle.ownerDocument).toBe(doc)
    expect(anotherEle.ownerDocument).toBe(doc)
    if (otherDoc.documentElement) {
      expect(otherDoc.documentElement.firstChild).toBeNull()
    }

    expect(() => doc.adoptNode($$.dom.createDocument('myns', 'root'))).toThrow()
    expect(() => doc.adoptNode(shadow)).toThrow()
  })

  test('cloneNode()', function () {
    const clonedDoc = <any>doc.cloneNode()
    expect(clonedDoc).not.toBe(doc)
    expect(clonedDoc.URL).toBe('about:blank')
    expect(clonedDoc.documentURI).toBe('about:blank')
    expect(clonedDoc.origin).toBe('')
    expect(clonedDoc.compatMode).toBe('CSS1Compat')
    expect(clonedDoc.characterSet).toBe('UTF-8')
    expect(clonedDoc.charset).toBe('UTF-8')
    expect(clonedDoc.inputEncoding).toBe('UTF-8')
    expect(clonedDoc.contentType).toBe('application/xml')
    expect(clonedDoc.nodeType).toBe(9)
    expect(clonedDoc.nodeName).toBe('#document')
    expect(clonedDoc.doctype).toBeNull()
    expect(clonedDoc.documentElement).toBeNull()
  })

  test('cloneNode(deep: true)', function () {
    const clonedDoc = <any>doc.cloneNode(true)
    expect(clonedDoc).not.toBe(doc)
    expect(clonedDoc.URL).toBe('about:blank')
    expect(clonedDoc.documentURI).toBe('about:blank')
    expect(clonedDoc.origin).toBe('')
    expect(clonedDoc.compatMode).toBe('CSS1Compat')
    expect(clonedDoc.characterSet).toBe('UTF-8')
    expect(clonedDoc.charset).toBe('UTF-8')
    expect(clonedDoc.inputEncoding).toBe('UTF-8')
    expect(clonedDoc.contentType).toBe('application/xml')
    expect(clonedDoc.nodeType).toBe(9)
    expect(clonedDoc.nodeName).toBe('#document')
    expect(clonedDoc.doctype.name).toBe('qname')
    expect(clonedDoc.documentElement.tagName).toBe('n:root')
  })

  test('lookupPrefix()', function () {
    expect(doc.lookupPrefix('myns')).toBe('n')
    expect(doc.lookupPrefix(null)).toBeNull()
    const emptyDoc = $$.dom.createDocument(null, '')
    expect(emptyDoc.lookupPrefix('myns')).toBeNull()
  })

  test('lookupNamespaceURI()', function () {
    expect(doc.lookupNamespaceURI('n')).toBe('myns')
    expect(doc.lookupNamespaceURI(null)).toBeNull()
    const emptyDoc = $$.dom.createDocument(null, '')
    expect(emptyDoc.lookupNamespaceURI(null)).toBeNull()
  })

  test('Unsupported Methods', function () {
    expect(() => { doc.createEvent('mouseevent') }).toThrow()
  })

  test('createNodeIterator()', function () {
    const ele = doc.getElementById('tele1')
    if (!ele)
      throw new Error("element is null")

    const iter = doc.createNodeIterator(ele)
    let str = ''
    let node = iter.nextNode()
    while(node) {
      str += ':' + node.nodeName
      node = iter.nextNode()
    }
    expect(str).toBe(':tagged:node_with_id:tagged:div:#text:shadow:my-custom-element')
  })

  test('implementation', function () {
    const impl = doc.implementation
    expect(impl.createDocument).toBeTruthy()
  })

})