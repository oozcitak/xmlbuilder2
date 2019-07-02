import $$ from '../TestHelpers'

describe('create()', () => {

  test('Empty document', () => {
    const doc = $$.xml().create()
    expect($$.printTree(doc)).toBe('')
  })

  test('Document with root element', () => {
    const ele = $$.xml().create('root', { att: "val" }, "text")
    expect($$.printTree(ele)).toBe($$.t`
      root att="val"
        # text
      `)
  })

  test('Document with root element - reverse argument order', () => {
    const ele = $$.xml().create('root', "text", { att: "val" })
    expect($$.printTree(ele)).toBe($$.t`
      root att="val"
        # text
      `)
  })

})
