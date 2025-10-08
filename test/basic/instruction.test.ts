import $$ from '../TestHelpers'

$$.suite('ins()', () => {

  $$.test('basic', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    node1.ins('target1', 'content').ele('node1-2')
    const node2 = root.ele('node2')
    node2.ins('target2')

    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      root
        node1
          ? target1 content
          node1-2
        node2
          ? target2
        `)
  })

  $$.test('array', () => {
    const root = $$.create().ele('root')
    root.ins(['target1 content', 'target2'])

    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      root
        ? target1 content
        ? target2
        `)
  })

  $$.test('object', () => {
    const root = $$.create().ele('root')
    root.ins({ target1: 'content', target2: '' })

    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      root
        ? target1 content
        ? target2
        `)
  })

})
