import $$ from '../TestHelpers'

$$.suite('Replicate issue', () => {

  // https://github.com/oozcitak/xmlbuilder2/issues/1
  $$.test('#1 - xmlns attribute added to the root element is shown on its child elements', () => {
    const doc = $$.create()
      .ele('SomeRootTag')
        .att({ xmlns: 'http://example.com', x: 0 })
        .ele('foo')
          .att({ a: 'A1', x: 1 })
          .doc()
    const root = doc.root()
    const foo = root.first()
    $$.deepEqual(foo.toString(), '<foo xmlns="http://example.com" a="A1" x="1"/>')
    $$.deepEqual(root.toString(), '<SomeRootTag xmlns="http://example.com" x="0"><foo a="A1" x="1"/></SomeRootTag>')
    $$.deepEqual(doc.end({ headless: true }), $$.t`
      <SomeRootTag xmlns="http://example.com" x="0"><foo a="A1" x="1"/></SomeRootTag>
    `)
  })

})
