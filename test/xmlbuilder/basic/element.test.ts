import $$ from '../../TestHelpers'

describe('element()', () => {

  test('string name', () => {
    const root = $$.create('root')
    const node1 = root.element('node1')
    node1.element('node1-1')
    node1.element('node1-2')
    const node2 = root.element('node2')
    node2.element('node2-1')
    node2.element('node2-2')
    node2.element('node2-3')

    expect($$.printTree(root.document())).toBe($$.t`
      root
        node1
          node1-1
          node1-2
        node2
          node2-1
          node2-2
          node2-3
      `)
  })

})