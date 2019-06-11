import $$ from './TestHelpers'

describe('DocumentFragment', function () {

  const doc = $$.dom.createDocument('myns', 'root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const node = doc.createDocumentFragment()
  doc.documentElement.appendChild(node)
  node.appendChild(doc.createTextNode('this'))
  node.appendChild(doc.createCDATASection('is'))
  node.appendChild(doc.createTextNode('a'))
  node.appendChild(doc.createTextNode(''))
  node.appendChild(doc.createTextNode('test'))

  test('constructor()', function () {
    expect(node.nodeType).toBe(11)
    expect(node.nodeName).toBe('#document-fragment')
  })

  test('textContent', function () {
    expect(node.textContent).toBe('thisisatest')
    node.textContent = 'or is it?'
    expect(node.childNodes.length).toBe(1)
    let text = <any>node.childNodes.item(0)
    expect(text.nodeType).toBe(3)
    expect(text.data).toBe('or is it?')
    node.textContent = null
    expect(node.childNodes.length).toBe(1)
    text = <any>node.childNodes.item(0)
    expect(text.nodeType).toBe(3)
    expect(text.data).toBe('')
  })

  test('cloneNode()', function () {
    const clonedNode = <any>node.cloneNode()
    expect(clonedNode).not.toBe(node)
    expect(clonedNode.nodeType).toBe(11)
    expect(clonedNode.nodeName).toBe('#document-fragment')
    expect(clonedNode.childNodes.length).toBe(0)
  })

  test('cloneNode(deep : true)', function () {
    const clonedNode = <any>node.cloneNode(true)
    expect(clonedNode).not.toBe(node)
    expect(clonedNode.nodeType).toBe(11)
    expect(clonedNode.nodeName).toBe('#document-fragment')
    expect(clonedNode.childNodes.length).not.toBe(0)
  })

  test('lookupPrefix()', function () {
    expect(node.lookupPrefix('none')).toBeNull()
  })

  test('lookupNamespaceURI()', function () {
    expect(node.lookupNamespaceURI('none')).toBeNull()
  })

})