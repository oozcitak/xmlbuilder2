import $$ from './TestHelpers'

describe('ProcessingInstruction', function () {

  const doc = $$.dom.createDocument('myns', 'root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const node = doc.createProcessingInstruction('program', 'instruction')
  doc.documentElement.appendChild(node)

  test('constructor()', function () {
    expect(node.nodeType).toBe(7)
    expect(node.nodeName).toBe('program')
    expect(node.target).toBe('program')
    expect(node.data).toBe('instruction')
  })

  test('cloneNode()', function () {
    const clonedNode = <any>node.cloneNode()
    expect(clonedNode).not.toBe(node)
    expect(clonedNode.nodeType).toBe(7)
    expect(clonedNode.nodeName).toBe('program')
    expect(clonedNode.target).toBe('program')
    expect(clonedNode.data).toBe('instruction')
  })

  test('isEqualNode()', function () {
    const node2 = doc.createProcessingInstruction('program', 'instruction')
    expect(node.isEqualNode(node2)).toBeTruthy()
    expect(node.isEqualNode()).toBeFalsy()
  })

})