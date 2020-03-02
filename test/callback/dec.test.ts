import $$ from '../TestHelpers'

describe('dec()', () => {

  test('dec() with default version', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec().ele('root').end()

    $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <root/>`, done)
  })

  test('dec() with version', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ version: "1.0" }).ele('root').end()

    $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <root/>`, done)
  })

  test('dec() with encoding', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ encoding: "US-ASCII" }).ele('root').end()

    $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0" encoding="US-ASCII"?>
      <root/>`, done)
  })

  test('dec() with standalone true', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ standalone: true }).ele('root').end()

    $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0" standalone="yes"?>
      <root/>`, done)
  })

  test('dec() with standalone false', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ standalone: false }).ele('root').end()

    $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0" standalone="no"?>
      <root/>`, done)
  })

  test('dec() with all settings', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ version: "1.0", encoding: "US-ASCII", standalone: false }).ele('root').end()

    $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0" encoding="US-ASCII" standalone="no"?>
      <root/>`, done)
  })

})