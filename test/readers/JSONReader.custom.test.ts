import $$ from '../TestHelpers'

$$.suite('custom JSONReader', () => {

  $$.test('skip comments', () => {
    const json = `{
      "ele": "element",
      "!": "comment"
    }`

    const doc = $$.create({ parser: { comment: () => undefined } }).ele('root').ele(json).doc()

    $$.deepEqual($$.printTree(doc.node), $$.t`
      root
        ele
          # element
      `)
  })

})
