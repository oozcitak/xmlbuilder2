import $$ from '../TestHelpers'

$$.suite('fragment()', () => {

  $$.test('doc returns owner document', () => {
    const doc = $$.create()
    const node = doc.ele('root').ele('node')
    $$.deepEqual(node.doc().node, doc.node)
  })

  $$.test('doc returns owner document fragment', () => {
    const frag = $$.fragment()
    const node = frag.ele('root').ele('node')
    $$.deepEqual(node.doc().node, frag.node)
  })

})
