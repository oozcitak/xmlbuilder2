import $$ from '../../TestHelpers'

describe('cdata()', () => {

  test('basic', () => {
    const root = $$.create('root')
    const node1 = root.element('node1')
    node1.cdata('node1 cdata').element('node1-2')
    const node2 = root.element('node2')

    expect($$.printTree(root.document())).toBe($$.t`
      root
        node1
          [ node1 cdata
          node1-2
        node2
      `)
  })

})
