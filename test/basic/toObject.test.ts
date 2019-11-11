import $$ from '../TestHelpers'

describe('toObject() with map', () => {

  test('element', () => {
    const root = $$.xml().document().ele('root', { "att": "val", "att2": "val2" })
      .ele('node1').up()
      .ele('node2').root()
    const obj = root.toObject()
    expect($$.printMap(obj)).toBe($$.t`
      {
        root: {
          @att: val,
          @att2: val2,
          node1: { },
          node2: { }
        }
      }
    `)
  })

  test('document', () => {
    const obj = $$.xml().document().ele('root').doc().toObject()
    expect($$.printMap(obj)).toBe('{ root: { } }')
  })

  test('document type', () => {
    const dtd = $$.xml({ docType: { pubID: "pub", sysID: "sys" } }).document().ele('root').doc().first()
    expect(() => dtd.toObject()).toThrow()
  })

  test('document fragment', () => {
    const frag = $$.xml().fragment().ele('foo').ele('bar').up().up()
    expect($$.printMap(frag.toObject())).toBe('{ foo: { bar: { } } }')
  })

  test('element', () => {
    const root = $$.xml().document().ele('root')
    expect($$.printMap(root.toObject())).toBe('{ root: { } }')
  })

  test('text', () => {
    const node = $$.xml().document().ele('root').txt('content').first()
    expect($$.printMap(node.toObject())).toBe('{ #: content }')
  })

  test('cdata', () => {
    const node = $$.xml().document().ele('root').dat('content').first()
    expect($$.printMap(node.toObject())).toBe('{ $: content }')
  })

  test('comment', () => {
    const node = $$.xml().document().ele('root').com('content').first()
    expect($$.printMap(node.toObject())).toBe('{ !: content }')
  })

  test('processing instruction', () => {
    const node = $$.xml().document().ele('root').ins('target', 'content').first()
    expect($$.printMap(node.toObject())).toBe('{ ?: target content }')
  })

  test('raw', () => {
    const node = $$.xml().document().ele('root').raw('content<>').first()
    expect($$.printMap(node.toObject())).toBe('{ &: content<> }')
  })

  test('attribute', () => {
    const root = $$.xml().document().ele('root').att("att", "val")
    expect($$.printMap(root.toObject())).toBe($$.t`
      { root: { @att: val } }
    `)
  })

})

describe('toObject() with object', () => {

  test('element', () => {
    const root = $$.xml().document().ele('root', { "att": "val", "att2": "val2" })
      .ele('node1').up()
      .ele('node2').root()
    const obj = root.toObject({ format: "object" })
    expect($$.printMap(obj)).toBe($$.t`
      {
        root: {
          @att: val,
          @att2: val2,
          node1: { },
          node2: { }
        }
      }
    `)
  })

  test('document', () => {
    const obj = $$.xml().document().ele('root').doc().toObject({ format: "object" })
    expect($$.printMap(obj)).toBe('{ root: { } }')
  })

  test('document type', () => {
    const dtd = $$.xml({ docType: { pubID: "pub", sysID: "sys" } }).document().ele('root').doc().first()
    expect(() => dtd.toObject({ format: "object" })).toThrow()
  })

  test('document fragment', () => {
    const frag = $$.xml().fragment().ele('foo').ele('bar').up().up()
    expect($$.printMap(frag.toObject({ format: "object" }))).toBe('{ foo: { bar: { } } }')
  })

  test('element', () => {
    const root = $$.xml().document().ele('root')
    expect($$.printMap(root.toObject({ format: "object" }))).toBe('{ root: { } }')
  })

  test('text', () => {
    const node = $$.xml().document().ele('root').txt('content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('{ #: content }')
  })

  test('cdata', () => {
    const node = $$.xml().document().ele('root').dat('content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('{ $: content }')
  })

  test('comment', () => {
    const node = $$.xml().document().ele('root').com('content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('{ !: content }')
  })

  test('processing instruction', () => {
    const node = $$.xml().document().ele('root').ins('target', 'content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('{ ?: target content }')
  })

  test('attribute', () => {
    const root = $$.xml().document().ele('root').att("att", "val")
    expect($$.printMap(root.toObject({ format: "object" }))).toBe($$.t`
      { root: { @att: val } }
    `)
  })

})
