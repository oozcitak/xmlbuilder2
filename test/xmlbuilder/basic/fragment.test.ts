import $$ from '../../TestHelpers'

describe('fragment()', () => {

  test('document fragment', () => {
    const frag = $$.fragment()
    const node1 = frag.ele('node1')
    const node2 = frag.ele('node2')
    node1.ele('node1-1').att("att1-1", "val1-1")
    node1.ele('node1-2').att("att1-2", "val1-2")
    node2.ele('node2-1').att("att2-1", "val2-1")
    node2.ele('node2-2').att("att2-2", "val2-2")
    expect($$.printTree(frag)).toBe($$.t`
      node1
        node1-1 att1-1="val1-1"
        node1-2 att1-2="val1-2"
      node2
        node2-1 att2-1="val2-1"
        node2-2 att2-2="val2-2"
    `)
  })

})
