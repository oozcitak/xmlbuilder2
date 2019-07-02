import $$ from '../TestHelpers'

describe('toString()', () => {

  test('document', () => {
    const doc = $$.xml().create('root').doc()
    expect(doc.toString()).toBe('<?xml version="1.0"?><root/>')
  })

  test('document type', () => {
    const doc = $$.xml({ docType: { pubID: "pub", sysID: "sys" } }).create('root').doc()
    expect(doc.toString()).toBe('<?xml version="1.0"?><!DOCTYPE root PUBLIC "pub" "sys"><root/>')
  })

  test('document fragment', () => {
    const frag = $$.xml().fragment().ele('foo').ele('bar').up().up()
    expect(frag.toString()).toBe('<foo><bar/></foo>')
  })

  test('element', () => {
    const root = $$.xml().create('root')
    expect(root.toString()).toBe('<root/>')
  })

  test('text', () => {
    const node = $$.xml().create('root').txt('content')
    expect(node.toString()).toBe('<root>content</root>')
  })

  test('cdata', () => {
    const node = $$.xml().create('root').dat('content')
    expect(node.toString()).toBe('<root><![CDATA[content]]></root>')
  })

  test('comment', () => {
    const node = $$.xml().create('root').com('content')
    expect(node.toString()).toBe('<root><!--content--></root>')
  })

  test('processing instruction', () => {
    const node = $$.xml().create('root').ins('target', 'content')
    expect(node.toString()).toBe('<root><?target content?></root>')
  })

  test('raw', () => {
    const node = $$.xml().create('root').raw('content<>')
    expect(node.toString()).toBe('<root>content<></root>')
  })

  test('attribute', () => {
    const root = $$.xml().create('root').att("att", "val")
    expect(root.toString()).toBe('<root att="val"/>')
  })

})
