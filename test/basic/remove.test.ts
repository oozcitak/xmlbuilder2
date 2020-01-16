import $$ from '../TestHelpers'

describe('remove()', () => {

  test('remove element node', () => {
    const root = $$.document().ele('root')
    root.ele('node1').up().ele('node2').remove().ele('node3')

    expect($$.printTree(root.doc().as.node)).toBe($$.t`
      root
        node1
        node3
      `)
  })

})
