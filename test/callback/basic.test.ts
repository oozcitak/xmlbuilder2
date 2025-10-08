import $$ from '../TestHelpers'

$$.suite('basic callback API tests', () => {

  $$.test('empty document', async () => {
    const xmlStream = $$.createCB()

    xmlStream.dec().end()

    await $$.expectCBResult(xmlStream, `<?xml version="1.0"?>`)
  })

  $$.test('ele', async () => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root").end()

    await $$.expectCBResult(xmlStream, `<root/>`)
  })

  $$.test('ele with children', async () => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .ele("foo")
      .ele("bar").up()
      .ele("baz").up()
      .end()

    await $$.expectCBResult(xmlStream, `<root><foo><bar/><baz/></foo></root>`)
  })

  $$.test('dec', async () => {
    const xmlStream = $$.createCB()

    xmlStream.dec({ version: "1.0", encoding: "UTF-8", standalone: true })
      .ele("root")
      .end()

    await $$.expectCBResult(xmlStream, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root/>`)
  })

  $$.test('dtd', async () => {
    const xmlStream = $$.createCB()

    xmlStream.dtd({ name: "root", pubID: "pub", sysID: "sys" })
      .ele("root")
      .end()

    await $$.expectCBResult(xmlStream, `<!DOCTYPE root PUBLIC "pub" "sys"><root/>`)
  })

  $$.test('att', async () => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .att("att1", "val1")
      .att("att2", "val2")
      .end()

    await $$.expectCBResult(xmlStream, `<root att1="val1" att2="val2"/>`)
  })

  $$.test('txt', async () => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .txt("text")
      .txt("")
      .end()

    await $$.expectCBResult(xmlStream, `<root>text</root>`)
  })

  $$.test('com', async () => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .com("text")
      .end()

    await $$.expectCBResult(xmlStream, `<root><!--text--></root>`)
  })

  $$.test('dat', async () => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .dat("text")
      .end()

    await $$.expectCBResult(xmlStream, `<root><![CDATA[text]]></root>`)
  })

  $$.test('ins', async () => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .ins("target", "value")
      .end()

    await $$.expectCBResult(xmlStream, `<root><?target value?></root>`)
  })

  $$.test('import', async () => {
    const frag1 = $$.fragment().ele("node1")
    const frag2 = $$.fragment().ele("node2")

    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .import(frag1)
      .import(frag2)
      .end()

    await $$.expectCBResult(xmlStream, `<root><node1/><node2/></root>`)
  })

  $$.test('nodes at root level', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec()
      .dtd({ name: "root" })
      .com("comment1")
      .ele("root").up()
      .com("comment2")
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <!--comment1-->
      <root/>
      <!--comment2-->`)
  })

  $$.test('test level', async () => {
    const xmlStream = $$.createCB({
      data: (chunk: string, level: number) => {
        if (chunk === "<root>") {
          $$.deepEqual(level, 0)
        } else if (chunk === "<child>") {
          $$.deepEqual(level, 1)
        } else if (chunk === "<grandchild>") {
          $$.deepEqual(level, 2)
        }
      },
    })

    xmlStream.dec()
      .dtd({ name: "root" })
      .com("comment1")
      .ele("root")
    xmlStream.ele('child')
    xmlStream.ele('grandchild').txt("text")
    xmlStream.up()
    xmlStream.up()
    xmlStream.com("comment2")
    xmlStream.end()
  })

  $$.test('Encoding', async () => {
    const obj = {
      root: {
        '@att': 'attribute value with &amp; and &#38;',
        '#': 'XML entities for ampersand are &amp; and &#38;.'
      }
    }

    const xmlStream = $$.createCB()

    xmlStream.ele(obj).end()

    await $$.expectCBResult(xmlStream,
      '<root att="attribute value with &amp; and &amp;">' +
      'XML entities for ampersand are &amp; and &amp;.' +
      '</root>')
  })

  $$.test('empty ele should throw', async () => {
    const xmlStream = $$.createCB()

    await $$.expectCBError(xmlStream, () => xmlStream.ele(undefined as any))
  })

  $$.test('empty import should throw', async () => {
    const xmlStream = $$.createCB()

    await $$.expectCBError(xmlStream, () => xmlStream.import(undefined as any))
  })

})
