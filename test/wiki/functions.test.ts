import $$ from '../TestHelpers'

$$.suite('examples in the function reference wiki page', () => {

  $$.test('document()', () => {
    const doc1 = $$.create()
    $$.deepEqual(doc1.end(), '<?xml version="1.0"?>')

    const doc2 = $$.create({ version: "1.0" })
    $$.deepEqual(doc2.end(), '<?xml version="1.0"?>')

    const doc3 = $$.create('<root><foo><bar>foobar</bar></foo></root>')
    $$.deepEqual(doc3.end({ headless: true }),
      '<root><foo><bar>foobar</bar></foo></root>')
  })

  $$.test('fragment()', () => {
    const frag1 = $$.fragment()
    $$.deepEqual(frag1.toString(), '')

    const frag2 = $$.fragment({ version: "1.0" })
    $$.deepEqual(frag2.toString(), '')

    const frag3 = $$.fragment('<foo1>bar</foo1><foo2>baz</foo2>')
    $$.deepEqual(frag3.toString(), '<foo1>bar</foo1><foo2>baz</foo2>')
  })

  $$.test('ele()', () => {
    const doc1 = $$.create()
      .ele("http://myschema.com", "m:root", { "att1": "value1", "att2": "value2" })
    $$.deepEqual(doc1.end({ prettyPrint: true, headless: true }),
      '<m:root xmlns:m="http://myschema.com" att1="value1" att2="value2"/>')

    const doc2 = $$.create()
      .ele("root", { "att1": "value1", "att2": "value2" })
    $$.deepEqual(doc2.end({ prettyPrint: true, headless: true }),
      '<root att1="value1" att2="value2"/>')

    const doc3 = $$.create()
      .ele({ "root": { "@att1": "value1", "@att2": "value2", "#": "text" }})
    $$.deepEqual(doc3.end({ prettyPrint: true, headless: true }),
      '<root att1="value1" att2="value2">text</root>')
  })

})
