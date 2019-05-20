import $$ from '../../TestHelpers'

describe('instruction()', () => {

  test('basic', () => {
    const root = $$.create().element('root')
    const node1 = root.element('node1')
    node1.instruction('target1', 'content').element('node1-2')
    const node2 = root.element('node2')
    node2.instruction('target2')

    expect($$.printTree(root.document())).toBe($$.t`
      root
        node1
          ? target1 content
          node1-2
        node2
          ? target2
        `)
  })

})
