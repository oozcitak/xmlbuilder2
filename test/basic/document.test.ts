import $$ from '../TestHelpers'

describe('document()', () => {

  test('Empty document', () => {
    const doc = $$.document()
    expect($$.printTree(doc.as.node)).toBe('')
    expect(doc.end()).toBe('<?xml version="1.0"?>')
  })

  test('Document with root element', () => {
    const ele = $$.document().ele('root', { att: "val" }).txt("text")
    expect($$.printTree(ele.as.node)).toBe($$.t`
      root att="val"
        # text
      `)
    expect(ele.end()).toBe('<?xml version="1.0"?><root att="val">text</root>')
  })

})
