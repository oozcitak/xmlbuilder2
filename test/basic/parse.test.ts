import $$ from '../TestHelpers'

describe('parse()', () => {

  test('XML string', () => {
    const doc = $$.document('<?xml version="1.0"?><root att="val">text</root>')

    expect($$.printTree(doc.node)).toBe($$.t`
      root att="val"
        # text
      `)
  })

  test('JS object', () => {
    const doc = $$.document({ root: { "@att": "val", "#": "text" }})

    expect($$.printTree(doc.node)).toBe($$.t`
      root att="val"
        # text
      `)
  })

  test('JSON string', () => {
    const doc = $$.document(JSON.stringify({ root: { "@att": "val", "#": "text" }}))

    expect($$.printTree(doc.node)).toBe($$.t`
      root att="val"
        # text
      `)
  })

})
