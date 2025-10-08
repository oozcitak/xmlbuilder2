import $$ from '../TestHelpers'

$$.suite('remove()', () => {

  $$.test('remove element node', () => {
    const root = $$.create().ele('root')
    root.ele('node1').up().ele('node2').remove().ele('node3')

    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      root
        node1
        node3
      `)
  })

})
