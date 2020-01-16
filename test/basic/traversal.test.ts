import $$ from '../TestHelpers'

describe('traversal', () => {

  test('root()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.first().root()).toEqual(root)
    const emptyDoc = $$.document()
    expect(() => emptyDoc.root()).toThrow()
  })

  test('up()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.first().up()).toEqual(root)
    expect(() => root.first().up().up().up()).toThrow()
  })

  test('prev()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.last().prev().as.node.nodeName).toBe('node1')
    expect(() => root.first().prev()).toThrow()
  })

  test('next()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.first().next().as.node.nodeName).toBe('node2')
    expect(() => root.last().next()).toThrow()
  })

  test('first()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.first().as.node.nodeName).toBe('node1')
    expect(() => root.first().first()).toThrow()
  })

  test('last()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.last().as.node.nodeName).toBe('node2')
    expect(() => root.last().last()).toThrow()
  })

})
