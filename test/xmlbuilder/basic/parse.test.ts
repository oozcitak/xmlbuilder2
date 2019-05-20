import $$ from '../../TestHelpers'

describe('parse()', () => {

  test('from string', () => {
    const doc = $$.parse('<?xml version="1.0?><root att="val">text</root>')

    expect($$.printTree(doc)).toBe($$.t`
      root att="val"
        # text
      `)
  })

  test('from JS object', () => {
    const doc = $$.parse({ root: { '@att': 'val', '#text': 'text' } })

    expect($$.printTree(doc)).toBe($$.t`
      root att="val"
        # text
      `)
  })

})
