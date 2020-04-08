import $$ from '../TestHelpers'

describe('basic callback API tests', () => {

  test('empty document', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.dec().end()

    $$.expectCBResult(xmlStream, `<?xml version="1.0"?>`, done)
  })

  test('ele', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root").end()

    $$.expectCBResult(xmlStream, `<root/>`, done)
  })

  test('ele with children', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .ele("foo")
      .ele("bar").up()
      .ele("baz").up()
      .end()

    $$.expectCBResult(xmlStream, `<root><foo><bar/><baz/></foo></root>`, done)
  })

  test('dec', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.dec({ version: "1.0", encoding: "UTF-8", standalone: true })
      .ele("root")
      .end()

    $$.expectCBResult(xmlStream, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root/>`, done)
  })

  test('dtd', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.dtd({ name: "root", pubID: "pub", sysID: "sys" })
      .ele("root")
      .end()

    $$.expectCBResult(xmlStream, `<!DOCTYPE root PUBLIC "pub" "sys"><root/>`, done)
  })

  test('att', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .att("att1", "val1")
      .att("att2", "val2")
      .end()

    $$.expectCBResult(xmlStream, `<root att1="val1" att2="val2"/>`, done)
  })

  test('txt', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .txt("text")
      .txt("")
      .end()

    $$.expectCBResult(xmlStream, `<root>text</root>`, done)
  })

  test('com', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .com("text")
      .end()

    $$.expectCBResult(xmlStream, `<root><!--text--></root>`, done)
  })

  test('dat', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .dat("text")
      .end()

    $$.expectCBResult(xmlStream, `<root><![CDATA[text]]></root>`, done)
  })

  test('ins', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.ele("root")
      .ins("target", "value")
      .end()

    $$.expectCBResult(xmlStream, `<root><?target value?></root>`, done)
  })

  test('nodes at root level', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec()
      .dtd({ name: "root" })
      .com("comment1")
      .ele("root").up()
      .com("comment2")
      .end()

    $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <!--comment1-->
      <root/>
      <!--comment2-->`, done)
  })

  test('test level', (done) => {
    const xmlStream = $$.createCB({
      data: (chunk: string, level: number) => {
        if (chunk === "<root>") {
          expect(level).toBe(0)
        } else if (chunk === "<child>") {
          expect(level).toBe(1)
        } else if (chunk === "<grandchild>") {
          expect(level).toBe(2)
        }

        done()
      }
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
  })

  test('No double encoding', (done) => {
    const obj = {
      root: {
        '@att': 'attribute value with &amp; and &#38;',
        '#': 'XML entities for ampersand are &amp; and &#38;.'
      }
    }

    const xmlStream = $$.createCB({ noDoubleEncoding: true })

    xmlStream.ele(obj).end()

    $$.expectCBResult(xmlStream,
      '<root att="attribute value with &amp; and &amp;#38;">' +
      'XML entities for ampersand are &amp; and &amp;#38;.' +
      '</root>', done)
  })

  test('Double encoding', (done) => {
    const obj = {
      root: {
        '@att': 'attribute value with &amp; and &#38;',
        '#': 'XML entities for ampersand are &amp; and &#38;.'
      }
    }

    const xmlStream = $$.createCB({ noDoubleEncoding: false })

    xmlStream.ele(obj).end()

    $$.expectCBResult(xmlStream,
      '<root att="attribute value with &amp;amp; and &amp;#38;">' +
      'XML entities for ampersand are &amp;amp; and &amp;#38;.' +
      '</root>', done)
  })

  test('Double encoding - default behavior', (done) => {
    const obj = {
      root: {
        '@att': 'attribute value with &amp; and &#38;',
        '#': 'XML entities for ampersand are &amp; and &#38;.'
      }
    }

    const xmlStream = $$.createCB()

    xmlStream.ele(obj).end()

    $$.expectCBResult(xmlStream,
      '<root att="attribute value with &amp;amp; and &amp;#38;">' +
      'XML entities for ampersand are &amp;amp; and &amp;#38;.' +
      '</root>', done)
  })

})
