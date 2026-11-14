import $$ from '../TestHelpers'

$$.suite('Replicate issue #241 - parsed XML whitespace', () => {
  $$.test('normalizes literal attribute whitespace and text line endings before references', () => {
    const doc = $$.create('<a b="x\ty\nz\r\nw\rv&#9;">p\r\nq\rr&#13;&#10;</a>')
    const root = doc.root().node
    $$.equal(root.getAttribute('b'), 'x y z w v\t')
    $$.equal(root.textContent, 'p\nq\nr\r\n')
    $$.equal(doc.end({ headless: true }), '<a b="x y z w v&#9;">p\nq\nr\r\n</a>')
  })

  $$.test('preserves encoded tab, LF and CR attributes with single or double quotes', () => {
    for (const quote of ['"', "'"]) {
      const doc = $$.create(`<a b=${quote}&#9;&#10;&#13;&#x9;&#xa;&#xD;${quote}/>`)
      $$.equal(doc.root().node.getAttribute('b'), '\t\n\r\t\n\r')
      $$.equal(doc.end({ headless: true }), '<a b="&#9;&#10;&#13;&#9;&#10;&#13;"/>')
    }
  })

  $$.test('normalizes namespace attribute whitespace before resolving prefixed nodes', () => {
    const root = $$.create('<p:a xmlns:p="urn:one\r\ntwo" p:b="x\ty"/>').root().node
    $$.equal(root.namespaceURI, 'urn:one two')
    $$.equal(root.getAttribute('xmlns:p'), 'urn:one two')
    $$.equal(root.getAttributeNS('urn:one two', 'b'), 'x y')
  })

  $$.test('passes normalized text and attributes to custom parser hooks', () => {
    const seen: string[] = []
    $$.create({ parser: {
      text(parent, data) { seen.push(data); return parent.txt(data) },
      attribute(parent, namespace, name, value) {
        seen.push(value)
        return namespace === undefined ? parent.att(name, value) : parent.att(namespace, name, value)
      }
    } }, '<a b="x\r\ny&#10;">p\rq&#13;</a>')
    $$.deepEqual(seen, ['x y\n', 'p\nq\r'])
  })

  $$.test('keeps raw CDATA, comment and processing instruction values per the parsing contract', () => {
    const doc = $$.create('<a><![CDATA[x\r\ny\r]]><!--x\r\ny\r--><?p x\r\ny\r?></a>')
    const children = Array.from(doc.root().node.childNodes)
    $$.deepEqual(children.map(node => node.textContent), ['x\r\ny\r', 'x\r\ny\r', 'x\r\ny\r'])
  })

  $$.test('keeps object and builder whitespace values and their attribute serialization', () => {
    const value = 'x\ty\nz\r\nw\rv'
    for (const doc of [$$.create({ a: { '@b': value, '#': value } }), $$.create().ele('a').att('b', value).txt(value)]) {
      $$.equal(doc.root().node.getAttribute('b'), value)
      $$.equal(doc.root().node.textContent, value)
      $$.equal(doc.end({ headless: true }), '<a b="x&#9;y&#10;z&#13;&#10;w&#13;v">x\ty\nz\r\nw\rv</a>')
    }
  })
})
