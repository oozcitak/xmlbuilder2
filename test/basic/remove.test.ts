import $$ from '../TestHelpers'

describe('remove()', () => {

  test('remove element node', () => {
    const root = $$.xml().create().ele('root')
    root.ele('node1').up().ele('node2').remove().ele('node3')

    expect($$.printTree(root.doc())).toBe($$.t`
      root
        node1
        node3
      `)
  })

})
