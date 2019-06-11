import $$ from './TestHelpers'

describe('Comment', function () {

  const doc = $$.dom.createDocument('myns', 'root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const node = doc.createComment('data')
  doc.documentElement.appendChild(node)

  test('constructor()', function () {
    expect(node.nodeType).toBe(8)
    expect(node.nodeName).toBe('#comment')
    expect(node.data).toBe('data')
  })

  test('cloneNode()', function () {
    const clonedNode = <any>node.cloneNode()
    expect(clonedNode).not.toBe(node)
    expect(clonedNode.nodeType).toBe(8)
    expect(clonedNode.nodeName).toBe('#comment')
    expect(clonedNode.data).toBe('data')
  })

})