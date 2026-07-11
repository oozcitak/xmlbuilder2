import $$ from '../TestHelpers'

$$.suite('Replicate issue', () => {
  const content = 'before]]>after'
  const expected = '<root><![CDATA[before]]]]><![CDATA[>after]]></root>'

  $$.test('#230 - escapes CDATA terminators', () => {
    const doc = $$.create()
      .ele('root')
      .dat(content)
      .doc()

    $$.deepEqual(doc.root().node.textContent, content)
    $$.deepEqual(doc.end({ headless: true }), expected)
    $$.deepEqual(doc.end({ headless: true, prettyPrint: true }), expected)
    $$.deepEqual(doc.end({
      headless: true,
      prettyPrint: true,
      indentTextOnlyNodes: true
    }), expected)
  })

  $$.test('#230 - escapes CDATA terminators with the callback API', async () => {
    const xmlStream = $$.createCB()
      .ele('root')
      .dat(content)
      .end()

    await $$.expectCBResult(xmlStream, expected)
  })

  $$.test('#230 - escapes CDATA terminators from an object', () => {
    const xml = $$.create(
      { convert: { text: '#text', cdata: '#cdata' } },
      { root: { '#cdata': content } }
    )
      .end({ headless: true, prettyPrint: true })

    $$.deepEqual(xml, expected)
  })
})
