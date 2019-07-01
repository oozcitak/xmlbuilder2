import $$ from '../TestHelpers'

describe('toString()', () => {

  test('document', () => {
    const doc = $$.create('root').doc()
    expect(doc.toString()).toBe('<?xml version="1.0"?><root/>')
  })

  test('document type', () => {
    const doc = $$.withOptions({ docType: { pubID: "pub", sysID: "sys" } }).create('root').doc()
    expect(doc.toString()).toBe('<?xml version="1.0"?><!DOCTYPE root PUBLIC "pub" "sys"><root/>')
  })

  test('document fragment', () => {
    const frag = $$.fragment().ele('foo').ele('bar').up().up()
    expect(frag.toString()).toBe('<foo><bar/></foo>')
  })

  test('element', () => {
    const root = $$.create('root')
    expect(root.toString()).toBe('<root/>')
  })

  test('text', () => {
    const node = $$.create('root').txt('content')
    expect(node.toString()).toBe('<root>content</root>')
  })

  test('cdata', () => {
    const node = $$.create('root').dat('content')
    expect(node.toString()).toBe('<root><![CDATA[content]]></root>')
  })

  test('comment', () => {
    const node = $$.create('root').com('content')
    expect(node.toString()).toBe('<root><!--content--></root>')
  })

  test('processing instruction', () => {
    const node = $$.create('root').ins('target', 'content')
    expect(node.toString()).toBe('<root><?target content?></root>')
  })

  test('raw', () => {
    const node = $$.create('root').raw('content<>')
    expect(node.toString()).toBe('<root>content<></root>')
  })

  test('attribute', () => {
    const root = $$.create('root').att("att", "val")
    expect(root.toString()).toBe('<root att="val"/>')
  })

})
