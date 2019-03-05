import $$ from '../TestHelpers'

describe('CDATASection', function () {

  const doc = $$.dom.createDocument('myns', 'root')
  const node = doc.createCDATASection('data')
  if (doc.documentElement) {
    doc.documentElement.appendChild(node)
  }

  test('constructor()', function () {
    expect(node.nodeType).toBe(4)
    expect(node.nodeName).toBe('#cdata-section')
    expect(node.data).toBe('data')
  })

  test('cloneNode()', function () {
    const clonedNode = <any>node.cloneNode()
    expect(clonedNode).not.toBe(node)
    expect(clonedNode.nodeType).toBe(4)
    expect(clonedNode.nodeName).toBe('#cdata-section')
    expect(clonedNode.data).toBe('data')
  })

})