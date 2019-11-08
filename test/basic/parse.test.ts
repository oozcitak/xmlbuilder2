import $$ from '../TestHelpers'

describe('parse()', () => {

  test('basic', () => {
    const doc = $$.xml().parse('<?xml version="1.0?><root att="val">text</root>')

    expect($$.printTree(doc)).toBe($$.t`
      root att="val"
        # text
      `)
  })

})
