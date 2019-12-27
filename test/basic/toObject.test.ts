import $$ from '../TestHelpers'

describe('toObject() with map', () => {

  test('element', () => {
    const root = $$.document().ele('root', { "att": "val", "att2": "val2" })
      .ele('node1').up()
      .ele('node2').root()
    const obj = root.toObject({ format: "map" })
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
    const obj = $$.document().ele('root').doc().toObject({ format: "map" })
    expect($$.printMap(obj)).toBe('{ root: { } }')
  })

  test('document type', () => {
    const dtd = $$.document().dtd({ pubID: "pub", sysID: "sys" }).ele('root').doc().first()
    expect(() => dtd.toObject({ format: "map" })).toThrow()
  })

  test('document fragment', () => {
    const frag = $$.fragment().ele('foo').ele('bar').up().up()
    expect($$.printMap(frag.toObject({ format: "map" }))).toBe('{ foo: { bar: { } } }')
  })

  test('element', () => {
    const root = $$.document().ele('root')
    expect($$.printMap(root.toObject({ format: "map" }))).toBe('{ root: { } }')
  })

  test('text', () => {
    const node = $$.document().ele('root').txt('content').first()
    expect($$.printMap(node.toObject({ format: "map" }))).toBe('{ #: content }')
  })

  test('cdata', () => {
    const node = $$.document().ele('root').dat('content').first()
    expect($$.printMap(node.toObject({ format: "map" }))).toBe('{ $: content }')
  })

  test('comment', () => {
    const node = $$.document().ele('root').com('content').first()
    expect($$.printMap(node.toObject({ format: "map" }))).toBe('{ !: content }')
  })

  test('processing instruction', () => {
    const node = $$.document().ele('root').ins('target', 'content').first()
    expect($$.printMap(node.toObject({ format: "map" }))).toBe('{ ?: target content }')
  })

  test('attribute', () => {
    const root = $$.document().ele('root').att("att", "val")
    expect($$.printMap(root.toObject({ format: "map" }))).toBe($$.t`
      { root: { @att: val } }
    `)
  })

})

describe('toObject() with object', () => {

  test('object is the default format', () => {
    const obj = $$.document().ele('root').doc().toObject()
    expect(obj).toEqual({ root: { } })
  })

  test('element', () => {
    const root = $$.document().ele('root', { "att": "val", "att2": "val2" })
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
    const obj = $$.document().ele('root').doc().toObject({ format: "object" })
    expect($$.printMap(obj)).toBe('{ root: { } }')
  })

  test('document type', () => {
    const dtd = $$.document().dtd({ pubID: "pub", sysID: "sys" }).ele('root').doc().first()
    expect(() => dtd.toObject({ format: "object" })).toThrow()
  })

  test('document fragment', () => {
    const frag = $$.fragment().ele('foo').ele('bar').up().up()
    expect($$.printMap(frag.toObject({ format: "object" }))).toBe('{ foo: { bar: { } } }')
  })

  test('element', () => {
    const root = $$.document().ele('root')
    expect($$.printMap(root.toObject({ format: "object" }))).toBe('{ root: { } }')
  })

  test('text', () => {
    const node = $$.document().ele('root').txt('content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('{ #: content }')
  })

  test('cdata', () => {
    const node = $$.document().ele('root').dat('content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('{ $: content }')
  })

  test('comment', () => {
    const node = $$.document().ele('root').com('content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('{ !: content }')
  })

  test('processing instruction', () => {
    const node = $$.document().ele('root').ins('target', 'content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('{ ?: target content }')
  })

  test('attribute', () => {
    const root = $$.document().ele('root').att("att", "val")
    expect($$.printMap(root.toObject({ format: "object" }))).toBe($$.t`
      { root: { @att: val } }
    `)
  })

})
