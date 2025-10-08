import $$ from '../TestHelpers'

$$.suite('basic XMLStream tests', () => {

  $$.test('empty document', async () => {
    const xmlStream = $$.fragmentCB()

    xmlStream.end()

    await $$.expectCBResult(xmlStream, ``)
  })

  $$.test('ele', async () => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root").end()

    await $$.expectCBResult(xmlStream, `<root/>`)
  })

  $$.test('ele with children', async () => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root")
      .ele("foo")
      .ele("bar").up()
      .ele("baz").up()
      .end()

    await $$.expectCBResult(xmlStream, `<root><foo><bar/><baz/></foo></root>`)
  })

  $$.test('multiple elements at root level', async () => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("node").up()
      .ele("node")
        .ele("bar").up()
        .ele("baz").up()
      .up()
      .end()

    await $$.expectCBResult(xmlStream, `<node/><node><bar/><baz/></node>`)
  })

  $$.test('dec', async () => {
    const xmlStream = $$.fragmentCB()

    await $$.expectCBError(xmlStream, () => xmlStream.dec({ version: "1.0", encoding: "UTF-8", standalone: true }))
  })

  $$.test('dtd', async () => {
    const xmlStream = $$.fragmentCB()

    await $$.expectCBError(xmlStream, () => xmlStream.dtd({ name: "root", pubID: "pub", sysID: "sys" }))
  })

  $$.test('txt', async () => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root")
      .txt("text")
      .txt("")
      .end()

    await $$.expectCBResult(xmlStream, `<root>text</root>`)
  })

  $$.test('txt at root level', async () => {
    const xmlStream = $$.fragmentCB()

    xmlStream.txt("text")
      .end()

    await $$.expectCBResult(xmlStream, `text`)
  })

  $$.test('com', async () => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root")
      .com("text")
      .end()

    await $$.expectCBResult(xmlStream, `<root><!--text--></root>`)
  })

  $$.test('dat', async () => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root")
      .dat("text")
      .end()

    await $$.expectCBResult(xmlStream, `<root><![CDATA[text]]></root>`)
  })

  $$.test('ins', async () => {
    const xmlStream = $$.fragmentCB()

    xmlStream.ele("root")
      .ins("target", "value")
      .end()

    await $$.expectCBResult(xmlStream, `<root><?target value?></root>`)
  })

})
