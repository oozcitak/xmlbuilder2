import $$ from '../TestHelpers'

$$.suite('create()', () => {

  $$.test('Empty document', () => {
    const doc = $$.create()
    $$.deepEqual($$.printTree(doc.node), '')
    $$.deepEqual(doc.end(), '<?xml version="1.0"?>')
  })

  $$.test('Document with root element', () => {
    const ele = $$.create().ele('root', { att: "val" }).txt("text")
    $$.deepEqual($$.printTree(ele.node), $$.t`
      root att="val"
        # text
      `)
    $$.deepEqual(ele.end(), '<?xml version="1.0"?><root att="val">text</root>')
  })

})
