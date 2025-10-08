import $$ from '../TestHelpers'

$$.suite('toString()', () => {

  $$.test('document', () => {
    const doc = $$.create().ele('root').doc()
    $$.deepEqual(doc.toString(), '<?xml version="1.0"?><root/>')
  })

  $$.test('document type', () => {
    const doc = $$.create().dtd({ pubID: "pub", sysID: "sys" }).ele('root').doc()
    $$.deepEqual(doc.toString(), '<?xml version="1.0"?><!DOCTYPE root PUBLIC "pub" "sys"><root/>')
  })

  $$.test('document fragment', () => {
    const frag = $$.fragment().ele('foo').ele('bar').up().up()
    $$.deepEqual(frag.toString(), '<foo><bar/></foo>')
  })

  $$.test('element', () => {
    const root = $$.create().ele('root')
    $$.deepEqual(root.toString(), '<root/>')
  })

  $$.test('text', () => {
    const node = $$.create().ele('root').txt('content')
    $$.deepEqual(node.toString(), '<root>content</root>')
  })

  $$.test('cdata', () => {
    const node = $$.create().ele('root').dat('content')
    $$.deepEqual(node.toString(), '<root><![CDATA[content]]></root>')
  })

  $$.test('comment', () => {
    const node = $$.create().ele('root').com('content')
    $$.deepEqual(node.toString(), '<root><!--content--></root>')
  })

  $$.test('processing instruction', () => {
    const node = $$.create().ele('root').ins('target', 'content')
    $$.deepEqual(node.toString(), '<root><?target content?></root>')
  })

  $$.test('attribute', () => {
    const root = $$.create().ele('root').att("att", "val")
    $$.deepEqual(root.toString(), '<root att="val"/>')
  })

})
