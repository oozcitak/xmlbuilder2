import $$ from '../TestHelpers'

$$.suite('examples in the home wiki page', () => {

  $$.test('example with ele', () => {
    const xmlStr = $$.t`
    <?xml version="1.0"?>
    <root att="val">
      <foo>
        <bar>foobar</bar>
      </foo>
      <baz/>
    </root>
    `
    const doc = $$.create({ version: "1.0" })
    .ele("root", { att: "val" })
      .ele("foo")
        .ele("bar").txt("foobar").up()
      .up()
      .ele("baz")
    .doc()

    $$.deepEqual(doc.end({ prettyPrint: true }), xmlStr)
  })

  $$.test('example with JS object', () => {
    const xmlStr = $$.t`
    <?xml version="1.0"?>
    <root att="val">
      <foo>
        <bar>foobar</bar>
      </foo>
      <baz/>
    </root>
    `
    const doc = $$.create({ version: "1.0" }, {
      root: {
        "@att": "val",
        "foo": {
          "bar": "foobar"
        },
        "baz": {}
      }
    })

    $$.deepEqual(doc.end({ prettyPrint: true }), xmlStr)
  })

  $$.test('example with parser', () => {
    const xmlStr1 = $$.t`
    <?xml version="1.0"?>
    <root att="val">
      <foo>
        <bar>foobar</bar>
      </foo>
    </root>
    `
    const xmlStr2 = $$.t`
    <?xml version="1.0"?>
    <root att="val">
      <foo>
        <bar>foobar</bar>
      </foo>
      <baz/>
    </root>
    `
    const doc = $$.create(xmlStr1)
    doc.root().ele("baz")
    $$.deepEqual(doc.end({ prettyPrint: true }), xmlStr2)
  })

})
