import $$ from '../TestHelpers'

describe('basic XMLStream tests', () => {

  test('empty document', (done) => {
    const xmlStream = $$.fragmentCB()

    xmlStream.end()

    $$.expectCBResult(xmlStream, ``, done)
  })

  test('ele', (done) => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root").end()

    $$.expectCBResult(xmlStream, `<root/>`, done)
  })

  test('ele with children', (done) => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root")
      .ele("foo")
      .ele("bar").up()
      .ele("baz").up()
      .end()

    $$.expectCBResult(xmlStream, `<root><foo><bar/><baz/></foo></root>`, done)
  })

  test('multiple elements at root level', (done) => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("node").up()
      .ele("node")
        .ele("bar").up()
        .ele("baz").up()
      .up()
      .end()

    $$.expectCBResult(xmlStream, `<node/><node><bar/><baz/></node>`, done)
  })

  test('dec', (done) => {
    const xmlStream = $$.fragmentCB()

    $$.expectCBError(xmlStream, () => xmlStream.dec({ version: "1.0", encoding: "UTF-8", standalone: true }), done)
  })

  test('dtd', (done) => {
    const xmlStream = $$.fragmentCB()

    $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: "root", pubID: "pub", sysID: "sys" }), done)
  })

  test('txt', (done) => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root")
      .txt("text")
      .txt("")
      .end()

    $$.expectCBResult(xmlStream, `<root>text</root>`, done)
  })

  test('txt at root level', (done) => {
    const xmlStream = $$.fragmentCB()

    xmlStream.txt("text")
      .end()

    $$.expectCBResult(xmlStream, `text`, done)
  })

  test('com', (done) => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root")
      .com("text")
      .end()

    $$.expectCBResult(xmlStream, `<root><!--text--></root>`, done)
  })

  test('dat', (done) => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root")
      .dat("text")
      .end()

    $$.expectCBResult(xmlStream, `<root><![CDATA[text]]></root>`, done)
  })

  test('ins', (done) => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root")
      .ins("target", "value")
      .end()

    $$.expectCBResult(xmlStream, `<root><?target value?></root>`, done)
  })

})
