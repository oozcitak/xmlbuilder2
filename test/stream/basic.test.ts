import $$ from '../TestHelpers'

describe('basic XMLStream tests', () => {

  test('empty document', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.dec().end()

    $$.expectStreamResult(xmlStream, `<?xml version="1.0"?>`, done)
  })

  test('ele', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.ele("root").end()

    $$.expectStreamResult(xmlStream, `<root/>`, done)
  })

  test('ele with children', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.ele("root")
      .ele("foo")
        .ele("bar").up()
        .ele("baz").up()
      .end()

    $$.expectStreamResult(xmlStream, `<root><foo><bar/><baz/></foo></root>`, done)
  })

  test('dec', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.dec({ version: "1.0", encoding: "UTF-8", standalone: true })
      .ele("root")
      .end()

    $$.expectStreamResult(xmlStream, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root/>`, done)
  })

  test('dtd', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.dtd({ name: "root", pubID: "pub", sysID: "sys" })
      .ele("root")
      .end()

    $$.expectStreamResult(xmlStream, `<!DOCTYPE root PUBLIC "pub" "sys"><root/>`, done)
  })

  test('att', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.ele("root")
      .att("att1", "val1")
      .att("att2", "val2")
      .end()

    $$.expectStreamResult(xmlStream, `<root att1="val1" att2="val2"/>`, done)
  })

  test('txt', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.ele("root")
      .txt("text")
      .txt("")
      .end()

    $$.expectStreamResult(xmlStream, `<root>text</root>`, done)
  })

  test('com', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.ele("root")
      .com("text")
      .end()

    $$.expectStreamResult(xmlStream, `<root><!--text--></root>`, done)
  })

  test('dat', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.ele("root")
      .dat("text")
      .end()

    $$.expectStreamResult(xmlStream, `<root><![CDATA[text]]></root>`, done)
  })

  test('ins', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.ele("root")
      .ins("target", "value")
      .end()

    $$.expectStreamResult(xmlStream, `<root><?target value?></root>`, done)
  })

  test('nodes at root level', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true })

    xmlStream.dec()
      .dtd({ name: "root" })
      .com("comment1")
      .ele("root").up()
      .com("comment2")
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <!--comment1-->
      <root/>
      <!--comment2-->`, done)
  })

})
