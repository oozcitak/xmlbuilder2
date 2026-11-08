import $$ from '../TestHelpers'

$$.suite('#243 - default namespaces do not apply to prefixed names', () => {
  for (const defaultNamespace of ['urn:default', '', 'urn:prefix']) {
    for (const declarations of [
      `xmlns:p="urn:prefix" xmlns="${defaultNamespace}"`,
      `xmlns="${defaultNamespace}" xmlns:p="urn:prefix"`
    ]) {
      $$.test(`prefixed elements with ${declarations}`, () => {
        const xml = `<p:a ${declarations}><p:b/><c/></p:a>`
        const doc = $$.create(xml)
        const root = doc.root().node as any

        $$.deepEqual(root.namespaceURI, 'urn:prefix')
        $$.deepEqual(root.firstChild.namespaceURI, 'urn:prefix')
        $$.deepEqual(root.lastChild.namespaceURI || null, defaultNamespace || null)
        const expected = defaultNamespace === 'urn:prefix' ? xml.replace('<p:b/>', '<b/>') : xml
        $$.deepEqual(doc.end({ headless: true }), expected)
      })
    }
  }

  for (const attributes of [
    'xmlns="urn:shared" xmlns:p="urn:shared" p:x="1"',
    'xmlns:p="urn:shared" xmlns="urn:shared" p:x="1"',
    'xmlns="urn:shared" p:x="1" xmlns:p="urn:shared"',
    'xmlns:p="urn:shared" p:x="1" xmlns="urn:shared"',
    'p:x="1" xmlns="urn:shared" xmlns:p="urn:shared"',
    'p:x="1" xmlns:p="urn:shared" xmlns="urn:shared"'
  ]) {
    $$.test(`prefixed attributes with ${attributes}`, () => {
      const doc = $$.create(`<a ${attributes} x="2"/>`)
      const root = doc.root().node as any

      $$.deepEqual(root.namespaceURI, 'urn:shared')
      $$.deepEqual(root.getAttributeNode('p:x').namespaceURI, 'urn:shared')
      $$.deepEqual(root.getAttributeNS('urn:shared', 'x'), '1')
      $$.deepEqual(root.getAttributeNode('x').namespaceURI, null)
      $$.deepEqual(root.getAttributeNS(null, 'x'), '2')

      const reparsed = $$.create(doc.end()).root().node as any
      $$.deepEqual(reparsed.getAttributeNS('urn:shared', 'x'), '1')
      $$.deepEqual(reparsed.getAttributeNS(null, 'x'), '2')
    })
  }

  for (const defaultNamespace of ['urn:other', '', 'urn:prefix']) {
    $$.test(`inherited prefixes with default namespace ${defaultNamespace}`, () => {
      const doc = $$.create(`<a xmlns:p="urn:prefix" xmlns="urn:parent">` +
        `<p:b xmlns="${defaultNamespace}" p:x="1" x="2"><p:c/><d/></p:b>` +
        '<e/></a>')
      const root = doc.root().node as any
      const child = root.firstChild

      $$.deepEqual(child.namespaceURI, 'urn:prefix')
      $$.deepEqual(child.getAttributeNode('p:x').namespaceURI, 'urn:prefix')
      $$.deepEqual(child.getAttributeNode('x').namespaceURI, null)
      $$.deepEqual(child.firstChild.namespaceURI, 'urn:prefix')
      $$.deepEqual(child.lastChild.namespaceURI || null, defaultNamespace || null)
      $$.deepEqual(root.lastChild.namespaceURI, 'urn:parent')
    })
  }

  $$.test('unprefixed elements still inherit and override the default namespace', () => {
    const doc = $$.create('<a xmlns="urn:parent"><b/><c xmlns="urn:child">' +
      '<d/><e xmlns=""/></c></a>')
    const root = doc.root().node as any

    $$.deepEqual(root.namespaceURI, 'urn:parent')
    $$.deepEqual(root.firstChild.namespaceURI, 'urn:parent')
    $$.deepEqual(root.lastChild.namespaceURI, 'urn:child')
    $$.deepEqual(root.lastChild.firstChild.namespaceURI, 'urn:child')
    $$.deepEqual(root.lastChild.lastChild.namespaceURI || null, null)
  })

  $$.test('fragments appended to an existing element retain inherited prefixes', () => {
    const parent = $$.create('<a xmlns:p="urn:prefix"/>').root()
    const child = parent.ele('<p:b xmlns="urn:child" p:x="1"/><p:c xmlns=""/>')

    $$.deepEqual((parent.first().node as any).namespaceURI, 'urn:prefix')
    $$.deepEqual((parent.first().node as any).getAttributeNode('p:x').namespaceURI, 'urn:prefix')
    $$.deepEqual((child.node as any).namespaceURI, 'urn:prefix')
  })
})
