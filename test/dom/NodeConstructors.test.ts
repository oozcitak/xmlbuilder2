import $$ from './TestHelpers'

describe('Node Constructors', function () {

  const doc = $$.dom.createDocument('myns', 'root')
  const ele = doc.documentElement
  if (!ele)
    throw new Error("documentElement is null")

  test('Attr constructor()', function () {
    const node = new $$.Attr(null, null, 'att', null, null, 'val')
    expect(node.ownerDocument).toBeNull()
    expect(node.ownerElement).toBeNull()
    expect(node.localName).toBe('att')
    expect(node.namespaceURI).toBeNull()
    expect(node.prefix).toBeNull()
    expect(node.value).toBe('val')
    const node2 = new $$.Attr(doc, ele, 'att', 'myns', 'd', 'val')
    expect(node2.ownerDocument).toBe(doc)
    expect(node2.ownerElement).toBe(ele)
    expect(node2.localName).toBe('att')
    expect(node2.namespaceURI).toBe('myns')
    expect(node2.prefix).toBe('d')
    expect(node2.value).toBe('val')
  })

  test('CDATA constructor()', function () {
    const node = new $$.CDATASection(null)
    expect(node.ownerDocument).toBeNull()
    expect(node.data).toBe('')
    const node2 = new $$.CDATASection(doc, 'test')
    expect(node2.ownerDocument).toBe(doc)
    expect(node2.data).toBe('test')
  })

  test('Comment constructor()', function () {
    const node = new $$.Comment(null)
    expect(node.ownerDocument).toBeNull()
    expect(node.data).toBe('')
    const node2 = new $$.Comment(doc, 'test')
    expect(node2.ownerDocument).toBe(doc)
    expect(node2.data).toBe('test')
  })

  test('DocumentFragment constructor()', function () {
    const node = new $$.DocumentFragment(null)
    expect(node.ownerDocument).toBeNull()
    const node2 = new $$.DocumentFragment(doc)
    expect(node2.ownerDocument).toBe(doc)
  })

  test('Document constructor()', function () {
    const node = new $$.Document()
    expect(node.ownerDocument).toBeNull()
  })

  test('DocumentType constructor()', function () {
    const node = new $$.DocumentType(null, 'html')
    expect(node.ownerDocument).toBeNull()
    expect(node.nodeName).toBe('html')
    expect(node.publicId).toBe('')
    expect(node.systemId).toBe('')
    const node2 = new $$.DocumentType(doc, 'html', 'pub', 'sys')
    expect(node2.ownerDocument).toBe(doc)
    expect(node2.nodeName).toBe('html')
    expect(node2.publicId).toBe('pub')
    expect(node2.systemId).toBe('sys')
  })

  test('Element constructor()', function () {
    const node = new $$.Element(null, 'node', null)
    expect(node.ownerDocument).toBeNull()
    expect(node.localName).toBe('node')
    expect(node.namespaceURI).toBeNull()
    expect(node.prefix).toBeNull()
    const node2 = new $$.Element(doc, 'node', 'myns', 'd')
    expect(node2.ownerDocument).toBe(doc)
    expect(node2.localName).toBe('node')
    expect(node2.namespaceURI).toBe('myns')
    expect(node2.prefix).toBe('d')
  })

  test('ProcessingInstruction constructor()', function () {
    const node = new $$.ProcessingInstruction(null, 'target')
    expect(node.ownerDocument).toBeNull()
    expect(node.target).toBe('target')
    expect(node.data).toBe('')
    const node2 = new $$.ProcessingInstruction(doc, 'target', 'data')
    expect(node2.ownerDocument).toBe(doc)
    expect(node2.target).toBe('target')
    expect(node2.data).toBe('data')
  })

  test('Text constructor()', function () {
    const node = new $$.Text(null)
    expect(node.ownerDocument).toBeNull()
    expect(node.data).toBe('')
    const node2 = new $$.Text(doc, 'test')
    expect(node2.ownerDocument).toBe(doc)
    expect(node2.data).toBe('test')
  })

  test('XMLDocument constructor()', function () {
    const node = new $$.XMLDocument()
    expect(node.ownerDocument).toBeNull()
  })

})