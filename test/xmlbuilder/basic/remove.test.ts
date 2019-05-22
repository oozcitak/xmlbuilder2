import $$ from '../../TestHelpers'

describe('remove()', () => {

  test('remove element node', () => {
    const root = $$.create().element('root')
    root.element('node1').up().element('node2').removeElement().element('node3')

    expect($$.printTree(root.document())).toBe($$.t`
      root
        node1
        node3
      `)
  })

})
