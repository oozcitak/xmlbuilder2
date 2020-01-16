import $$ from '../TestHelpers'

describe('com()', () => {

  test('basic', () => {
    const root = $$.document().ele('root')
    const node1 = root.ele('node1')
    node1.com('node1 comment').ele('node1-2')
    const node2 = root.ele('node2')

    expect($$.printTree(root.doc().as.node)).toBe($$.t`
      root
        node1
          ! node1 comment
          node1-2
        node2
      `)
  })

})
