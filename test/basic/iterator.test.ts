import $$ from '../TestHelpers'

describe('iterators', () => {

  test('forEachChild()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    let str = ''
    root.forEachChild(child => str += child.as.node.nodeName)
    expect(str).toBe('node1node2node3')
  })

  test('forEachAttribute()', () => {
    const root = $$.document().ele('root')
      .att('node1', 'val1')
      .att('node2', 'val2')
      .att('node3', 'val3')
    let str = ''
    root.forEachAttribute(att => str += att.as.node.nodeName)
    expect(str).toBe('node1node2node3')
  })

  test('only element nodes have attributes', () => {
    let str = ''
    const node = $$.document().ele('root').txt('text').first()
    expect(() => node.forEachAttribute(att => str += att.as.node.nodeName)).toThrow()
  })

  test('this inside callback', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    
    root.forEachChild(function(this: number) { expect(this).toBe(42) }, 42)
  })

})
