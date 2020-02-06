import $$ from '../TestHelpers'

describe('traversal', () => {

  test('root()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.first().root()).toEqual(root)
    const emptyDoc = $$.create()
    expect(() => emptyDoc.root()).toThrow()
  })

  test('up()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.first().up()).toEqual(root)
    expect(() => root.first().up().up().up()).toThrow()
  })

  test('prev()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.last().prev().node.nodeName).toBe('node1')
    expect(() => root.first().prev()).toThrow()
  })

  test('next()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.first().next().node.nodeName).toBe('node2')
    expect(() => root.last().next()).toThrow()
  })

  test('first()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.first().node.nodeName).toBe('node1')
    expect(() => root.first().first()).toThrow()
  })

  test('last()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    expect(root.last().node.nodeName).toBe('node2')
    expect(() => root.last().last()).toThrow()
  })

})
