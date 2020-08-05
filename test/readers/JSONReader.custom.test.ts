import $$ from '../TestHelpers'

describe('custom JSONReader', () => {

  test('skip comments', () => {
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
