import $$ from '../TestHelpers'

describe('custom parsers', () => {

  test('ObjectReader - skip comments', () => {
    const obj = {
      ele: 'element',
      '!': 'comment'
    }

    const doc = $$.create({ parser: { comment: () => undefined } }).ele('root').ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        ele
          # element
      `)
  })

  test('JSONReader - skip comments', () => {
    const json = `{
      "ele": "element",
      "!": "comment"
    }`

    const doc = $$.create({ parser: { comment: () => undefined } }).ele('root').ele(json).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        ele
          # element
      `)
  })

})
