import $$ from '../../TestHelpers'

describe('removeEle()', () => {

  test('remove element node', () => {
    const root = $$.create().ele('root')
    root.ele('node1').up().ele('node2').removeEle().ele('node3')

    expect($$.printTree(root.doc())).toBe($$.t`
      root
        node1
        node3
      `)
  })

})
