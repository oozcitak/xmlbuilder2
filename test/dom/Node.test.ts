import $$ from './TestHelpers'

describe('Node', function () {

  const doctype = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
  const doc = $$.dom.createDocument('myns', 'n:root', doctype)

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const de = doc.documentElement

  const ele1 = doc.createElement('ele')
  const anyEle = <any>ele1
  anyEle._baseURI = 'http://www.example.com'
  de.appendChild(ele1)
  const child1 = doc.createElement('child1')
  const child2 = doc.createElement('child2')
  const child3 = doc.createElement('child3')
  const child4 = doc.createElement('child4')
  ele1.appendChild(child1)
  ele1.appendChild(child2)
  ele1.appendChild(child3)
  ele1.appendChild(child4)
  child4.appendChild(doc.createTextNode('master'))
  child4.appendChild(doc.createTextNode('of'))
  child4.appendChild(doc.createComment('puppity'))
  child4.appendChild(doc.createTextNode('puppets'))

  test('baseURI', function () {
    expect(ele1.baseURI).toBe('http://www.example.com')
  })

  test('isConnected', function () {
    expect(ele1.isConnected).toBeTruthy()
    const newEle = doc.createElement('child4')
    expect(newEle.isConnected).toBeFalsy()
    de.appendChild(newEle)
    expect(newEle.isConnected).toBeTruthy()
    newEle.remove()
    expect(newEle.isConnected).toBeFalsy()
  })

  test('ownerDocument', function () {
    expect(ele1.ownerDocument).toBe(doc)
    expect(doc.ownerDocument).toBeNull()
  })

  test('getRootNode()', function () {
    expect(ele1.getRootNode()).toBe(doc)
  })

  test('getRootNode() shadow', function () {
    const sdoc = $$.dom.createHTMLDocument('my doc')
    const sbody = sdoc.getElementsByTagName('body')[0]
    if (!sbody)
      throw new Error("body element is null")  
    const sele = sdoc.createElementNS('http://www.w3.org/1999/xhtml', 'my-custom-element')
    sbody.appendChild(sele)
    const shadowRoot = sele.attachShadow({mode: "open"})
    const snode = doc.createElement('node')
    shadowRoot.appendChild(snode)

    expect(snode.getRootNode()).toBe(shadowRoot)
    expect(snode.getRootNode({composed: false})).toBe(shadowRoot)
    expect(snode.getRootNode({composed: true})).toBe(sdoc)
  })

  test('parentNode', function () {
    expect(ele1.parentNode).toBe(de)
    expect(doc.parentElement).toBeNull()
  })

  test('parentElement', function () {
    expect(ele1.parentElement).toBe(de)
    expect(doc.parentElement).toBeNull()
  })

  test('hasChildNodes()', function () {
    expect(ele1.hasChildNodes()).toBeTruthy()
  })

  test('childNodes', function () {
    expect(ele1.childNodes.length).toBe(4)
  })

  test('firstChild', function () {
    expect(ele1.firstChild).toBe(child1)
  })

  test('lastChild', function () {
    expect(ele1.lastChild).toBe(child4)
  })

  test('previousSibling', function () {
    expect(child3.previousSibling).toBe(child2)
  })

  test('nextSibling', function () {
    expect(child3.nextSibling).toBe(child4)
  })

  test('nodeValue', function () {
    const charNode = child4.firstChild
    if (!charNode)
      throw new Error("charNode is null")

    expect(charNode.nodeValue).toBe('master')
    charNode.nodeValue = 'maestro'
    expect(charNode.nodeValue).toBe('maestro')
    charNode.nodeValue = 'master'

    doctype.nodeValue = 'N/A'
    expect(doctype.nodeValue).toBeNull()
  })

  test('textContent', function () {
    expect(child4.textContent).toBe('masterofpuppets')
    child4.textContent = 'masterofbobbitts'
    expect(child4.childNodes.length).toBe(1)

    const charNode = child4.firstChild
    if (!charNode)
      throw new Error("charNode is null")
    expect(charNode.textContent).toBe('masterofbobbitts')

    doctype.textContent = 'N/A'
    expect(doctype.textContent).toBeNull()
  })

  test('normalize()', function () {
    const newEle = doc.createElement('child')
    de.appendChild(newEle)
    newEle.appendChild(doc.createTextNode('part 1 '))
    newEle.appendChild(doc.createTextNode('part 2 '))
    newEle.appendChild(doc.createTextNode(''))
    newEle.appendChild(doc.createComment('separator'))
    newEle.appendChild(doc.createTextNode('part 3 '))
    expect(newEle.childNodes.length).toBe(5)
    newEle.normalize()
    expect(newEle.childNodes.length).toBe(3)

    const charNode = newEle.firstChild
    if (!charNode)
      throw new Error("charNode is null")

    expect(charNode.textContent).toBe('part 1 part 2 ')
  })

  test('isEqualNode()', function () {
    const newEle1 = doc.createElement('child')
    newEle1.setAttribute('att1', 'val1')
    newEle1.setAttribute('att2', 'val2')
    de.appendChild(newEle1)
    newEle1.appendChild(doc.createTextNode('part 1 '))
    newEle1.appendChild(doc.createTextNode('part 2 '))

    const newEle2 = doc.createElement('child')
    newEle2.setAttribute('att1', 'val1')
    newEle2.setAttribute('att2', 'val2')
    de.appendChild(newEle2)
    newEle2.appendChild(doc.createTextNode('part 1 '))
    newEle2.appendChild(doc.createTextNode('part 2 '))

    const newEle3 = doc.createElement('child')
    newEle3.setAttribute('att1', 'val1')
    newEle3.setAttribute('att2', 'val2')
    de.appendChild(newEle3)
    newEle3.appendChild(doc.createTextNode('part 1 '))
    newEle3.appendChild(doc.createTextNode('part 4 '))

    expect(newEle1.isEqualNode(newEle2)).toBeTruthy()
    expect(newEle1.isEqualNode(newEle3)).toBeFalsy()

    expect(newEle1.isEqualNode()).toBeFalsy()
  })

  test('isSameNode()', function () {
    const sameEle1 = de.firstChild
    if (!sameEle1)
      throw new Error("charNode is null")

    expect(ele1.isSameNode(sameEle1)).toBeTruthy()
  })

  test('compareDocumentPosition()', function () {
    expect(child1.compareDocumentPosition(child1)).toBe(0)
    expect(child1.compareDocumentPosition(child2)).toBe(0x04)
    expect(child2.compareDocumentPosition(child1)).toBe(0x02)
    expect(child4.compareDocumentPosition(de)).toBe(0x08 + 0x02)
  })

  test('compareDocumentPosition() attribute', function () {
    const att11 = doc.createAttribute('att11')
    child1.setAttributeNode(att11)
    const att12 = doc.createAttribute('att12')
    child1.setAttributeNode(att12)
    const att13 = doc.createAttribute('att13')
    child1.setAttributeNode(att13)

    expect(att12.compareDocumentPosition(att13)).toBe(0x20 + 0x04)
    expect(att12.compareDocumentPosition(att11)).toBe(0x20 + 0x02)

    expect(child1.compareDocumentPosition(att11)).toBe(0x10 + 0x04)
    expect(att11.compareDocumentPosition(child1)).toBe(0x08 + 0x02)
  })

  test('compareDocumentPosition() disconnected', function () {
    const otherdoc = $$.dom.createDocument('ns', 'otherdoc')
    if (!otherdoc.documentElement)
      throw new Error("documentElement is null")
    const otherde = otherdoc.documentElement
    const otherele = otherdoc.createElement('otherele')
    otherde.appendChild(otherele)

    // TODO: If one returns Position.Preceding the other should return 
    // Position.Following for consistency
    const pos1 = child1.compareDocumentPosition(otherele)
    const pos2 = otherele.compareDocumentPosition(child1)
    expect(pos1).toBe(0x20 + 0x01 + 0x02)
    expect(pos2).toBe(0x20 + 0x01 + 0x02)
  })

  test('contains()', function () {
    expect(de.contains(child2)).toBeTruthy()
    expect(de.contains(null)).toBeFalsy()
  })


  test('lookupPrefix()', function () {
    const newText = doc.createTextNode('txt')
    child4.appendChild(newText)
    expect(newText.lookupPrefix('myns')).toBe('n')
    expect(newText.lookupPrefix(null)).toBeNull()
    newText.remove()
    expect(newText.lookupPrefix('myns')).toBeNull()
  })

  test('lookupNamespaceURI()', function () {
    const newText = doc.createTextNode('txt')
    child4.appendChild(newText)
    expect(newText.lookupNamespaceURI('n')).toBe('myns')
    newText.remove()
    expect(newText.lookupNamespaceURI('n')).toBeNull()
  })

  test('isDefaultNamespace()', function () {
    const htmlDoc = $$.dom.createHTMLDocument()
    if (!htmlDoc.documentElement)
      throw new Error("documentElement is null")

    const html = htmlDoc.documentElement
    const newText = htmlDoc.createTextNode('txt')
    html.appendChild(newText)
    expect(newText.isDefaultNamespace('http://www.w3.org/1999/xhtml')).toBeTruthy()
    expect(newText.isDefaultNamespace('none')).toBeFalsy()
    expect(newText.isDefaultNamespace('')).toBeFalsy()
  })

  test('insertBefore()', function () {
    const newText = doc.createTextNode('txt')
    let count = ele1.childNodes.length
    ele1.insertBefore(newText, child4)
    expect(ele1.childNodes.length).toBe(count + 1)
    expect(child4.previousSibling).toBe(newText)
    expect(newText.previousSibling).toBe(child3)
    expect(newText.nextSibling).toBe(child4)
    // duplicates nodes are not allowed
    count = ele1.childNodes.length
    ele1.insertBefore(newText, child4)
    expect(ele1.childNodes.length).toBe(count)
  })

  test('appendChild()', function () {
    const aadoc = $$.dom.createDocument('ns', 'doc')
    if (!aadoc.documentElement)
      throw new Error("documentElement is null")
    const aae = aadoc.documentElement
    const node1 = aadoc.createElement('node1')
    const node2 = aadoc.createElement('node2')
    const node3 = aadoc.createElement('node3')
    const node4 = aadoc.createElement('node4')
    aae.appendChild(node1)
    aae.appendChild(node2)
    aae.appendChild(node3)
    aae.appendChild(node4)

    expect(aae.childNodes.length).toBe(4)
    const newText = aadoc.createTextNode('newtxt')
    aae.appendChild(newText)
    expect(aae.childNodes.length).toBe(5)
    expect(aae.childNodes.item(0)).toBe(node1)
    expect(aae.childNodes.item(1)).toBe(node2)
    expect(aae.childNodes.item(2)).toBe(node3)
    expect(aae.childNodes.item(3)).toBe(node4)
    expect(aae.childNodes.item(4)).toBe(newText)
    expect(aae.lastChild).toBe(newText)

    expect($$.printTree(aadoc)).toBe($$.t`
      doc (ns:ns)
        node1
        node2
        node3
        node4
        # newtxt
        `)

    // adding existing node. no-op
    expect(aae.childNodes.length).toBe(5)
    aae.appendChild(newText)
    expect(aae.childNodes.length).toBe(5)

    expect($$.printTree(aadoc)).toBe($$.t`
      doc (ns:ns)
        node1
        node2
        node3
        node4
        # newtxt
        `)
  })

  test('replaceChild()', function () {
    const newText = doc.createTextNode('txt')
    ele1.replaceChild(newText, child2)
    expect(newText.previousSibling).toBe(child1)
    expect(newText.nextSibling).toBe(child3)
  })

  test('removeChild()', function () {
    const node1 = doc.createElement('child1')
    const node2 = doc.createElement('child2')
    const node3 = doc.createElement('child3')
    ele1.appendChild(node1)
    ele1.appendChild(node2)
    ele1.appendChild(node3)

    ele1.removeChild(node2)
    expect(node3.previousSibling).toBe(node1)
    expect(node1.nextSibling).toBe(node3)
  })

})