import $$ from '../../TestHelpers'

describe('create()', () => {

  test('Empty document', () => {
    const doc = $$.create()
    expect($$.printTree(doc)).toBe('')
  })

  test('Document with root element', () => {
    const ele = $$.withOptions().create('root', { att: "val" }, "text")
    expect($$.printTree(ele)).toBe($$.t`
      root att="val"
        # text
      `)
  })

  test('Document with root element - reverse argument order', () => {
    const ele = $$.withOptions().create('root', "text", { att: "val" })
    expect($$.printTree(ele)).toBe($$.t`
      root att="val"
        # text
      `)
  })

})
