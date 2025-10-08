import $$ from '../TestHelpers'

$$.suite('parse()', () => {

  $$.test('XML string', async () => {
    const str = '<root att="val">text</root>'

    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele(str).end()

    await $$.expectCBResult(xmlStream, $$.t`
    <root att="val">text</root>
    `)
  })


})
