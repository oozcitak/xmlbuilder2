import $$ from '../TestHelpers'

$$.suite('toObject() with map', () => {

  $$.test('element', () => {
    const root = $$.create().ele('root', { "att": "val", "att2": "val2" })
      .ele('node1').up()
      .ele('node2').root()
    const obj = root.toObject({ format: "map", group: true })
    $$.deepEqual($$.printMap(obj), $$.t`
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

  $$.test('document', () => {
    const obj = $$.create().ele('root').doc().toObject({ format: "map" })
    $$.deepEqual($$.printMap(obj), 'M{ root: M{ } }')
  })

  $$.test('document type', () => {
    const dtd = $$.create().dtd({ pubID: "pub", sysID: "sys" }).ele('root').doc().first()
    $$.deepEqual(dtd.toObject({ format: "map" }), new Map())
  })

  $$.test('document fragment', () => {
    const frag = $$.fragment().ele('foo').ele('bar').up().up()
    $$.deepEqual($$.printMap(frag.toObject({ format: "map" })), 'M{ foo: M{ bar: M{ } } }')
  })

  $$.test('element', () => {
    const root = $$.create().ele('root')
    $$.deepEqual($$.printMap(root.toObject({ format: "map" })), 'M{ root: M{ } }')
  })

  $$.test('text', () => {
    const node = $$.create().ele('root').txt('content').first()
    $$.deepEqual($$.printMap(node.toObject({ format: "map" })), 'content')
  })

  $$.test('cdata', () => {
    const node = $$.create().ele('root').dat('content').first()
    $$.deepEqual($$.printMap(node.toObject({ format: "map" })), 'M{ $: content }')
  })

  $$.test('comment', () => {
    const node = $$.create().ele('root').com('content').first()
    $$.deepEqual($$.printMap(node.toObject({ format: "map" })), 'M{ !: content }')
  })

  $$.test('processing instruction', () => {
    const node = $$.create().ele('root').ins('target', 'content').first()
    $$.deepEqual($$.printMap(node.toObject({ format: "map" })), 'M{ ?: target content }')
  })

  $$.test('attribute', () => {
    const root = $$.create().ele('root').att("att", "val")
    $$.deepEqual($$.printMap(root.toObject({ format: "map" })), $$.t`
      M{ root: M{ @att: val } }
    `)
  })

})

$$.suite('toObject() with object', () => {

  $$.test('object is the default format', () => {
    const obj = $$.create().ele('root').doc().toObject()
    $$.deepEqual(obj, { root: { } })
  })

  $$.test('element', () => {
    const root = $$.create().ele('root', { "att": "val", "att2": "val2" })
      .ele('node1').up()
      .ele('node2').root()
    const obj = root.toObject({ format: "object", group: true })
    $$.deepEqual($$.printMap(obj), $$.t`
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

  $$.test('document', () => {
    const obj = $$.create().ele('root').doc().toObject({ format: "object" })
    $$.deepEqual($$.printMap(obj), '{ root: { } }')
  })

  $$.test('document type', () => {
    const dtd = $$.create().dtd({ pubID: "pub", sysID: "sys" }).ele('root').doc().first()
    $$.deepEqual(dtd.toObject({ format: "object" }), {})
  })

  $$.test('document fragment', () => {
    const frag = $$.fragment().ele('foo').ele('bar').up().up()
    $$.deepEqual($$.printMap(frag.toObject({ format: "object" })), '{ foo: { bar: { } } }')
  })

  $$.test('element', () => {
    const root = $$.create().ele('root')
    $$.deepEqual($$.printMap(root.toObject({ format: "object" })), '{ root: { } }')
  })

  $$.test('text', () => {
    const node = $$.create().ele('root').txt('content').first()
    $$.deepEqual($$.printMap(node.toObject({ format: "object" })), 'content')
  })

  $$.test('cdata', () => {
    const node = $$.create().ele('root').dat('content').first()
    $$.deepEqual($$.printMap(node.toObject({ format: "object" })), '{ $: content }')
  })

  $$.test('comment', () => {
    const node = $$.create().ele('root').com('content').first()
    $$.deepEqual($$.printMap(node.toObject({ format: "object" })), '{ !: content }')
  })

  $$.test('processing instruction', () => {
    const node = $$.create().ele('root').ins('target', 'content').first()
    $$.deepEqual($$.printMap(node.toObject({ format: "object" })), '{ ?: target content }')
  })

  $$.test('attribute', () => {
    const root = $$.create().ele('root').att("att", "val")
    $$.deepEqual($$.printMap(root.toObject({ format: "object" })), $$.t`
      { root: { @att: val } }
    `)
  })

})
