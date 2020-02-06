import $$ from '../TestHelpers'

describe('txt()', () => {

  test('basic', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    node1.txt('node1 text').ele('node1-2')
    const node2 = root.ele('node2')

    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node1
          # node1 text
          node1-2
        node2
      `)
  })

})
