import $$ from '../TestHelpers'

describe('toString()', () => {

  test('document', () => {
    const doc = $$.create().ele('root').doc()
    expect(doc.toString()).toBe('<?xml version="1.0"?><root/>')
  })

  test('document type', () => {
    const doc = $$.create().dtd({ pubID: "pub", sysID: "sys" }).ele('root').doc()
    expect(doc.toString()).toBe('<?xml version="1.0"?><!DOCTYPE root PUBLIC "pub" "sys"><root/>')
  })

  test('document fragment', () => {
    const frag = $$.fragment().ele('foo').ele('bar').up().up()
    expect(frag.toString()).toBe('<foo><bar/></foo>')
  })

  test('element', () => {
    const root = $$.create().ele('root')
    expect(root.toString()).toBe('<root/>')
  })

  test('text', () => {
    const node = $$.create().ele('root').txt('content')
    expect(node.toString()).toBe('<root>content</root>')
  })

  test('cdata', () => {
    const node = $$.create().ele('root').dat('content')
    expect(node.toString()).toBe('<root><![CDATA[content]]></root>')
  })

  test('comment', () => {
    const node = $$.create().ele('root').com('content')
    expect(node.toString()).toBe('<root><!--content--></root>')
  })

  test('processing instruction', () => {
    const node = $$.create().ele('root').ins('target', 'content')
    expect(node.toString()).toBe('<root><?target content?></root>')
  })

  test('attribute', () => {
    const root = $$.create().ele('root').att("att", "val")
    expect(root.toString()).toBe('<root att="val"/>')
  })

})
