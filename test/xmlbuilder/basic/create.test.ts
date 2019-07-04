import $$ from '../TestHelpers'

describe('create()', () => {

  test('Empty document', () => {
    const doc = $$.xml().create()
    expect($$.printTree(doc)).toBe('')
  })

  test('Document with root element', () => {
    const ele = $$.xml().create('root', { att: "val" }).txt("text")
    expect($$.printTree(ele)).toBe($$.t`
      root att="val"
        # text
      `)
  })

})
