import $$ from '../TestHelpers'

describe('iterators', () => {

  test('traverseChildren()', () => {
    const root = $$.xml().document().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    let str = ""
    for (const child of root.traverseChildren()) {
      str += child.as.node.nodeName
    }
    expect(str).toBe('node1node2node3')
  })

  test('traverseAttributes()', () => {
    const root = $$.xml().document().ele('root')
      .att('node1', 'val1')
      .att('node2', 'val2')
      .att('node3', 'val3')
    let str = ""
    for (const child of root.traverseAttributes()) {
      str += child.as.node.nodeName
    }
    expect(str).toBe('node1node2node3')
  })

  test('traverseDescendants()', () => {
    const nodeA = $$.xml().document().ele('a')
    nodeA.ele('b').ele('d').up().ele('e').up().up()
      .ele('c').up()
    let str = ""
    for (const child of nodeA.traverseDescendants()) {
      str += child.as.node.nodeName
    }
    expect(str).toBe('bdec')
  })

  test('traverseAncestors()', () => {
    const nodeA = $$.xml().document().ele('a')
    nodeA.ele('b').ele('d').up().ele('e').up().up()
      .ele('c').up()
    const nodeD = nodeA.first().first()
    let str = ""
    for (const child of nodeD.traverseAncestors()) {
      str += child.as.node.nodeName
    }
    expect(str).toBe('ba#document')
  })

})
