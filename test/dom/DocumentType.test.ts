import $$ from './TestHelpers'

describe('DocumentType', function () {

  test('constructor()', function () {
    const node = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
    expect(node.nodeType).toBe(10)
    expect(node.nodeName).toBe('qname')
    expect(node.name).toBe('qname')
    expect(node.publicId).toBe('pubid')
    expect(node.systemId).toBe('sysid')
  })

  test('constructor() invalid name', function () {
    expect(() => $$.dom.createDocumentType('not_a_qname:', 'pub', 'sys')).toThrow()
    expect(() => $$.dom.createDocumentType('not a name', 'pub', 'sys')).toThrow()
  })

  test('isEqualNode()', function () {
    const node = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
    const otherNode = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
    expect(node).not.toBe(otherNode)
    expect(node.isEqualNode(otherNode)).toBeTruthy()

    const anotherNode = $$.dom.createDocumentType('qname1', 'pubid1', 'sysid1')
    expect(node.isEqualNode(anotherNode)).toBeFalsy()

    expect(node.isEqualNode()).toBeFalsy()
    expect(node.isEqualNode($$.dom.createDocument('ns', 'name'))).toBeFalsy()
  })

  test('cloneNode()', function () {
    const node = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
    const clonedNode = <any>node.cloneNode()
    expect(clonedNode.nodeType).toBe(10)
    expect(clonedNode.nodeName).toBe('qname')
    expect(clonedNode.name).toBe('qname')
    expect(clonedNode.publicId).toBe('pubid')
    expect(clonedNode.systemId).toBe('sysid')
  })

})