import $$ from '../TestHelpers'

describe('DocumentType', function () {

  const node = $$.dom.createDocumentType('qname', 'pubid', 'sysid')

  test('constructor()', function () {
    expect(node.nodeType).toBe(10)
    expect(node.nodeName).toBe('qname')
    expect(node.name).toBe('qname')
    expect(node.publicId).toBe('pubid')
    expect(node.systemId).toBe('sysid')
  })

  test('isEqualNode()', function () {
    const otherNode = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
    expect(node).not.toBe(otherNode)
    expect(node.isEqualNode(otherNode)).toBeTruthy()

    const anotherNode = $$.dom.createDocumentType('qname1', 'pubid1', 'sysid1')
    expect(node.isEqualNode(anotherNode)).toBeFalsy()

    expect(node.isEqualNode()).toBeFalsy()
    expect(node.isEqualNode($$.dom.createDocument('ns', 'name'))).toBeFalsy()
  })

  test('cloneNode()', function () {
    const clonedNode = <any>node.cloneNode()
    expect(clonedNode.nodeType).toBe(10)
    expect(clonedNode.nodeName).toBe('qname')
    expect(clonedNode.name).toBe('qname')
    expect(clonedNode.publicId).toBe('pubid')
    expect(clonedNode.systemId).toBe('sysid')
  })

})