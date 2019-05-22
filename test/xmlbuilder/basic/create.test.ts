import $$ from '../../TestHelpers'

describe('create()', () => {

  test('Empty document', () => {
    const doc = $$.create()
    expect($$.printTree(doc)).toBe('')
  })

  test('Document with root element', () => {
    const ele = $$.create().ele('root')
    expect($$.printTree(ele)).toBe('root')
  })

})
