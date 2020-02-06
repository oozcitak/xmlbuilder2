import $$ from '../TestHelpers'

describe('parse()', () => {

  test('XML string', () => {
    const doc = $$.create('<?xml version="1.0"?><root att="val">text</root>')

    expect($$.printTree(doc.node)).toBe($$.t`
      root att="val"
        # text
      `)
  })

  test('JS object', () => {
    const doc = $$.create({ root: { "@att": "val", "#": "text" }})

    expect($$.printTree(doc.node)).toBe($$.t`
      root att="val"
        # text
      `)
  })

  test('JSON string', () => {
    const doc = $$.create(JSON.stringify({ root: { "@att": "val", "#": "text" }}))

    expect($$.printTree(doc.node)).toBe($$.t`
      root att="val"
        # text
      `)
  })

})
