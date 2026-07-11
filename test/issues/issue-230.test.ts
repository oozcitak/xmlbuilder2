import $$ from '../TestHelpers'

$$.suite('Replicate issue', () => {
  const content = 'before]]>after'
  const expected = '<root><![CDATA[before]]]]><![CDATA[>after]]></root>'

  $$.test('#230 - escapes CDATA terminators', () => {
    const xml = $$.create()
      .ele('root')
      .dat(content)
      .doc()
      .end({ headless: true })

    $$.deepEqual(xml, expected)
  })

  $$.test('#230 - escapes CDATA terminators with the callback API', async () => {
    const xmlStream = $$.createCB()
      .ele('root')
      .dat(content)
      .end()

    await $$.expectCBResult(xmlStream, expected)
  })
})
