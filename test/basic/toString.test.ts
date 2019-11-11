import $$ from '../TestHelpers'

describe('toString()', () => {

  test('document', () => {
    const doc = $$.xml().document().ele('root').doc()
    expect(doc.toString()).toBe('<?xml version="1.0"?><root/>')
  })

  test('document type', () => {
    const doc = $$.xml({ docType: { pubID: "pub", sysID: "sys" } }).document().ele('root').doc()
    expect(doc.toString()).toBe('<?xml version="1.0"?><!DOCTYPE root PUBLIC "pub" "sys"><root/>')
  })

  test('document fragment', () => {
    const frag = $$.xml().fragment().ele('foo').ele('bar').up().up()
    expect(frag.toString()).toBe('<foo><bar/></foo>')
  })

  test('element', () => {
    const root = $$.xml().document().ele('root')
    expect(root.toString()).toBe('<root/>')
  })

  test('text', () => {
    const node = $$.xml().document().ele('root').txt('content')
    expect(node.toString()).toBe('<root>content</root>')
  })

  test('cdata', () => {
    const node = $$.xml().document().ele('root').dat('content')
    expect(node.toString()).toBe('<root><![CDATA[content]]></root>')
  })

  test('comment', () => {
    const node = $$.xml().document().ele('root').com('content')
    expect(node.toString()).toBe('<root><!--content--></root>')
  })

  test('processing instruction', () => {
    const node = $$.xml().document().ele('root').ins('target', 'content')
    expect(node.toString()).toBe('<root><?target content?></root>')
  })

  test('raw', () => {
    const node = $$.xml().document().ele('root').raw('content<>')
    expect(node.toString()).toBe('<root>content<></root>')
  })

  test('attribute', () => {
    const root = $$.xml().document().ele('root').att("att", "val")
    expect(root.toString()).toBe('<root att="val"/>')
  })

})
