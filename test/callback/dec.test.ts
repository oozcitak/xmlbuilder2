import $$ from '../TestHelpers'

$$.suite('dec()', () => {

  $$.test('dec() with default version', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec().ele('root').end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <root/>`)
  })

  $$.test('dec() with version', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ version: "1.0" }).ele('root').end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <root/>`)
  })

  $$.test('dec() with encoding', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ encoding: "US-ASCII" }).ele('root').end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0" encoding="US-ASCII"?>
      <root/>`)
  })

  $$.test('dec() with standalone true', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ standalone: true }).ele('root').end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0" standalone="yes"?>
      <root/>`)
  })

  $$.test('dec() with standalone false', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ standalone: false }).ele('root').end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0" standalone="no"?>
      <root/>`)
  })

  $$.test('dec() with all settings', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ version: "1.0", encoding: "US-ASCII", standalone: false }).ele('root').end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0" encoding="US-ASCII" standalone="no"?>
      <root/>`)
  })

})