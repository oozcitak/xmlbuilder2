import $$ from '../TestHelpers'

describe('parse()', () => {

  test('XML string', () => {
    const doc = $$.xml().parse('<?xml version="1.0?><root att="val">text</root>')

    expect($$.printTree(doc)).toBe($$.t`
      root att="val"
        # text
      `)
  })

  test('JS object', () => {
    const doc = $$.xml().parse({ root: { "@att": "val", "#": "text" }})

    expect($$.printTree(doc)).toBe($$.t`
      root att="val"
        # text
      `)
  })

  test('JSON string', () => {
    const doc = $$.xml().parse(JSON.stringify({ root: { "@att": "val", "#": "text" }}))

    expect($$.printTree(doc)).toBe($$.t`
      root att="val"
        # text
      `)
  })

})
