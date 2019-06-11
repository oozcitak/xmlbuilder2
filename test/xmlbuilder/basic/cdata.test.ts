import $$ from '../TestHelpers'

describe('dat()', () => {

  test('basic', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    node1.dat('node1 cdata').ele('node1-2')
    const node2 = root.ele('node2')

    expect($$.printTree(root.doc())).toBe($$.t`
      root
        node1
          [ node1 cdata
          node1-2
        node2
      `)
  })

})
