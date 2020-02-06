import $$ from '../TestHelpers'

describe('create()', () => {

  test('Empty document', () => {
    const doc = $$.create()
    expect($$.printTree(doc.node)).toBe('')
    expect(doc.end()).toBe('<?xml version="1.0"?>')
  })

  test('Document with root element', () => {
    const ele = $$.create().ele('root', { att: "val" }).txt("text")
    expect($$.printTree(ele.node)).toBe($$.t`
      root att="val"
        # text
      `)
    expect(ele.end()).toBe('<?xml version="1.0"?><root att="val">text</root>')
  })

})
