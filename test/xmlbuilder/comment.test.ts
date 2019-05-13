import $$ from '../TestHelpers'

describe('comment()', () => {

  test('basic', () => {
    const root = $$.create('root')
    const node1 = root.element('node1')
    node1.comment('node1 comment').element('node1-2')
    const node2 = root.element('node2')

    expect($$.printTree(root.document())).toBe($$.t`
      root
        node1
          ! node1 comment
          node1-2
        node2
      `)
  })

})