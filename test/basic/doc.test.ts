import $$ from '../TestHelpers'

describe('fragment()', () => {

  test('doc returns owner document', () => {
    const doc = $$.create()
    const node = doc.ele('root').ele('node')
    expect(node.doc().node).toBe(doc.node)
  })

  test('doc returns owner document fragment', () => {
    const frag = $$.fragment()
    const node = frag.ele('root').ele('node')
    expect(node.doc().node).toBe(frag.node)
  })

})
