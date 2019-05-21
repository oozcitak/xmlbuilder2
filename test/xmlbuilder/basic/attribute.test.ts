import $$ from '../../TestHelpers'

describe('attribute()', () => {

  test('add attribute', () => {
    const root = $$.create().element('root')
    const node1 = root.element('node1')
    node1.attribute('att1', 'val1').attribute('att2', 'val2').element('node1-2')
    const node2 = root.element('node2')

    expect($$.printTree(root.document())).toBe($$.t`
      root
        node1 att1="val1" att2="val2"
          node1-2
        node2
      `)
  })

  test('replace attribute', () => {
    const root = $$.create().element('root')
    const node1 = root.element('node1')
    node1.attribute('att1', 'val1').attribute('att1', 'val2').element('node1-2')
    const node2 = root.element('node2')

    expect($$.printTree(root.document())).toBe($$.t`
      root
        node1 att1="val2"
          node1-2
        node2
      `)
  })

  test('remove attribute', () => {
    const root = $$.create().element('root')
    const node1 = root.element('node1')
    node1.attribute('att1', 'val1')
      .attribute('att2', 'val2')
      .attribute('att3', 'val3')
      .attribute('att4', 'val4')
    node1.element('node1-2')
    const node2 = root.element('node2')
    node1.removeAttribute('att2')
    node1.removeAttribute(['att1', 'att2', 'att4'])

    expect($$.printTree(root.document())).toBe($$.t`
      root
        node1 att3="val3"
          node1-2
        node2
      `)
  })
})
