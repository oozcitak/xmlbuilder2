import $$ from '../TestHelpers'

describe('Attr', function () {

  const doc = $$.dom.createDocument('myns', 'root')
  const ele = doc.createElementNS('myns', 'n:root')
  if (doc.documentElement) {
    doc.documentElement.appendChild(ele)
    ele.id = 'uniq'
    ele.setAttributeNS('http://www.w3.org/1999/xhtml', 'ns:name', 'value')
  }
  const attr = <any>ele.getAttributeNode('ns:name')

  test('constructor()', function () {
    expect(attr.nodeType).toBe(2)
    expect(attr.nodeName).toBe('ns:name')
    expect(attr.ownerElement).toBe(ele)
    expect(attr.namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    expect(attr.prefix).toBe('ns')
    expect(attr.localName).toBe('name')
    expect(attr.value).toBe('value')
  })

  test('value', function () {
    expect(attr.value).toBe('value')
    attr.value = 'modified'
    expect(attr.value).toBe('modified')
    attr.value = 'value'
  })

  test('cloneNode()', function () {
    const clonedAttr = attr.cloneNode()
    expect(clonedAttr).not.toBe(attr)
    expect(clonedAttr.nodeType).toBe(2)
    expect(clonedAttr.nodeName).toBe('ns:name')
    expect(clonedAttr.ownerElement).toBeNull()
    expect(clonedAttr.namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    expect(clonedAttr.prefix).toBe('ns')
    expect(clonedAttr.localName).toBe('name')
    expect(clonedAttr.value).toBe('value')
  })

  test('lookupPrefix()', function () {
    expect(attr.lookupPrefix('myns')).toBe('n')
  })

  test('lookupNamespaceURI()', function () {
    expect(attr.lookupNamespaceURI('n')).toBe('myns')
  })

})