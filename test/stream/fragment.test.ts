import $$ from '../TestHelpers'

describe('basic XMLStream tests', () => {

  test('empty document', (done) => {
    const xmlStream = $$.fragmentStream()

    xmlStream.end()

    $$.expectStreamResult(xmlStream, ``, done)
  })

  test('ele', (done) => {
    const xmlStream = $$.fragmentStream()

    xmlStream.ele("root").end()

    $$.expectStreamResult(xmlStream, `<root/>`, done)
  })

  test('ele with children', (done) => {
    const xmlStream = $$.fragmentStream()

    xmlStream.ele("root")
      .ele("foo")
      .ele("bar").up()
      .ele("baz").up()
      .end()

    $$.expectStreamResult(xmlStream, `<root><foo><bar/><baz/></foo></root>`, done)
  })

  test('multiple elements at root level', (done) => {
    const xmlStream = $$.fragmentStream()

    xmlStream.ele("node").up()
      .ele("node")
        .ele("bar").up()
        .ele("baz").up()
      .up()
      .end()

    $$.expectStreamResult(xmlStream, `<node/><node><bar/><baz/></node>`, done)
  })

  test('dec', (done) => {
    const xmlStream = $$.fragmentStream()

    $$.expectStreamError(xmlStream, () => xmlStream.dec({ version: "1.0", encoding: "UTF-8", standalone: true }), done)
  })

  test('dtd', (done) => {
    const xmlStream = $$.fragmentStream()

    $$.expectStreamError(xmlStream, () => xmlStream.dtd({ name: "root", pubID: "pub", sysID: "sys" }), done)
  })

  test('txt', (done) => {
    const xmlStream = $$.fragmentStream()

    xmlStream.ele("root")
      .txt("text")
      .txt("")
      .end()

    $$.expectStreamResult(xmlStream, `<root>text</root>`, done)
  })

  test('txt at root level', (done) => {
    const xmlStream = $$.fragmentStream()

    xmlStream.txt("text")
      .end()

    $$.expectStreamResult(xmlStream, `text`, done)
  })

  test('com', (done) => {
    const xmlStream = $$.fragmentStream()

    xmlStream.ele("root")
      .com("text")
      .end()

    $$.expectStreamResult(xmlStream, `<root><!--text--></root>`, done)
  })

  test('dat', (done) => {
    const xmlStream = $$.fragmentStream()

    xmlStream.ele("root")
      .dat("text")
      .end()

    $$.expectStreamResult(xmlStream, `<root><![CDATA[text]]></root>`, done)
  })

  test('ins', (done) => {
    const xmlStream = $$.fragmentStream()

    xmlStream.ele("root")
      .ins("target", "value")
      .end()

    $$.expectStreamResult(xmlStream, `<root><?target value?></root>`, done)
  })

})
