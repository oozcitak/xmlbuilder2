import $$ from '../TestHelpers'

describe('create()', () => {

  test('Empty document', () => {
    const doc = $$.xml().document()
    expect($$.printTree(doc)).toBe('')
  })

  test('Document with root element', () => {
    const ele = $$.xml().document().ele('root', { att: "val" }).txt("text")
    expect($$.printTree(ele)).toBe($$.t`
      root att="val"
        # text
      `)
  })

})
