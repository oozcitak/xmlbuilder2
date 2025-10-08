import $$ from '../TestHelpers'

$$.suite('parse()', () => {

  $$.test('XML string', () => {
    const doc = $$.create('<?xml version="1.0"?><root att="val">text</root>')

    $$.deepEqual($$.printTree(doc.node), $$.t`
      root att="val"
        # text
      `)
  })

  $$.test('JS object', () => {
    const doc = $$.create({ root: { "@att": "val", "#": "text" }})

    $$.deepEqual($$.printTree(doc.node), $$.t`
      root att="val"
        # text
      `)
  })

  $$.test('JSON string', () => {
    const doc = $$.create(JSON.stringify({ root: { "@att": "val", "#": "text" }}))

    $$.deepEqual($$.printTree(doc.node), $$.t`
      root att="val"
        # text
      `)
  })

})
