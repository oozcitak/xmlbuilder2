import $$ from '../TestHelpers'

describe('document()', () => {

  test('Empty document', () => {
    const doc = $$.document()
    expect($$.printTree(doc)).toBe('')
  })

  test('Document with root element', () => {
    const ele = $$.document().ele('root', { att: "val" }).txt("text")
    expect($$.printTree(ele)).toBe($$.t`
      root att="val"
        # text
      `)
  })

})
