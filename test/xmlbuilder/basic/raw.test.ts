import $$ from '../TestHelpers'

describe('raw()', () => {

  test('basic', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    node1.raw('node1 raw <>&\'" text').ele('node1-2')
    const node2 = root.ele('node2')

    expect($$.printTree(root.doc())).toBe($$.t`
      root
        node1
          # node1 raw <>&'" text
          node1-2
        node2
      `)
  })

})
