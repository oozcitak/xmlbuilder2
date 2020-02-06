import $$ from '../TestHelpers'

describe('toObject() with map', () => {

  test('element', () => {
    const root = $$.create().ele('root', { "att": "val", "att2": "val2" })
      .ele('node1').up()
      .ele('node2').root()
    const obj = root.toObject({ format: "map" })
    expect($$.printMap(obj)).toBe($$.t`
      M{
        root: M{
          @: M{
            att: val,
            att2: val2
          },
          node1: M{ },
          node2: M{ }
        }
      }
    `)
  })

  test('document', () => {
    const obj = $$.create().ele('root').doc().toObject({ format: "map" })
    expect($$.printMap(obj)).toBe('M{ root: M{ } }')
  })

  test('document type', () => {
    const dtd = $$.create().dtd({ pubID: "pub", sysID: "sys" }).ele('root').doc().first()
    expect(dtd.toObject({ format: "map" })).toEqual(new Map())
  })

  test('document fragment', () => {
    const frag = $$.fragment().ele('foo').ele('bar').up().up()
    expect($$.printMap(frag.toObject({ format: "map" }))).toBe('M{ foo: M{ bar: M{ } } }')
  })

  test('element', () => {
    const root = $$.create().ele('root')
    expect($$.printMap(root.toObject({ format: "map" }))).toBe('M{ root: M{ } }')
  })

  test('text', () => {
    const node = $$.create().ele('root').txt('content').first()
    expect($$.printMap(node.toObject({ format: "map" }))).toBe('content')
  })

  test('cdata', () => {
    const node = $$.create().ele('root').dat('content').first()
    expect($$.printMap(node.toObject({ format: "map" }))).toBe('M{ $: content }')
  })

  test('comment', () => {
    const node = $$.create().ele('root').com('content').first()
    expect($$.printMap(node.toObject({ format: "map" }))).toBe('M{ !: content }')
  })

  test('processing instruction', () => {
    const node = $$.create().ele('root').ins('target', 'content').first()
    expect($$.printMap(node.toObject({ format: "map" }))).toBe('M{ ?: target content }')
  })

  test('attribute', () => {
    const root = $$.create().ele('root').att("att", "val")
    expect($$.printMap(root.toObject({ format: "map" }))).toBe($$.t`
      M{ root: M{ @att: val } }
    `)
  })

})

describe('toObject() with object', () => {

  test('object is the default format', () => {
    const obj = $$.create().ele('root').doc().toObject()
    expect(obj).toEqual({ root: { } })
  })

  test('element', () => {
    const root = $$.create().ele('root', { "att": "val", "att2": "val2" })
      .ele('node1').up()
      .ele('node2').root()
    const obj = root.toObject({ format: "object" })
    expect($$.printMap(obj)).toBe($$.t`
      {
        root: {
          @: {
            att: val,
            att2: val2
          },
          node1: { },
          node2: { }
        }
      }
    `)
  })

  test('document', () => {
    const obj = $$.create().ele('root').doc().toObject({ format: "object" })
    expect($$.printMap(obj)).toBe('{ root: { } }')
  })

  test('document type', () => {
    const dtd = $$.create().dtd({ pubID: "pub", sysID: "sys" }).ele('root').doc().first()
    expect(dtd.toObject({ format: "object" })).toEqual({})
  })

  test('document fragment', () => {
    const frag = $$.fragment().ele('foo').ele('bar').up().up()
    expect($$.printMap(frag.toObject({ format: "object" }))).toBe('{ foo: { bar: { } } }')
  })

  test('element', () => {
    const root = $$.create().ele('root')
    expect($$.printMap(root.toObject({ format: "object" }))).toBe('{ root: { } }')
  })

  test('text', () => {
    const node = $$.create().ele('root').txt('content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('content')
  })

  test('cdata', () => {
    const node = $$.create().ele('root').dat('content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('{ $: content }')
  })

  test('comment', () => {
    const node = $$.create().ele('root').com('content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('{ !: content }')
  })

  test('processing instruction', () => {
    const node = $$.create().ele('root').ins('target', 'content').first()
    expect($$.printMap(node.toObject({ format: "object" }))).toBe('{ ?: target content }')
  })

  test('attribute', () => {
    const root = $$.create().ele('root').att("att", "val")
    expect($$.printMap(root.toObject({ format: "object" }))).toBe($$.t`
      { root: { @att: val } }
    `)
  })

})
