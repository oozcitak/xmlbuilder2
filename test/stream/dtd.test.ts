import $$ from '../TestHelpers'

describe('dtd()', () => {

  test('doctype with both public and system identifier', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true })

    xmlStream.dec({ version: "1.0" })
      .dtd({ name: 'root', pubID: "pub", sysID: "sys" })
      .ele('ns', 'root').end()

    $$.expectStreamResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub" "sys">
      <root xmlns="ns"/>`, done)
  })

  test('doctype with public identifier', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true })

    xmlStream.dec({ version: "1.0" })
      .dtd({ name: 'root', pubID: "pub" })
      .ele('ns', 'root').end()

    $$.expectStreamResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub">
      <root xmlns="ns"/>`, done)
  })

  test('doctype with system identifier', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true })

    xmlStream.dec({ version: "1.0" })
      .dtd({ name: 'root', sysID: "sys" })
      .ele('ns', 'root').end()

    $$.expectStreamResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root SYSTEM "sys">
      <root xmlns="ns"/>`, done)
  })

  test('doctype without identifiers', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true })

    xmlStream.dec({ version: "1.0" })
      .dtd({ name: 'root' })
      .ele('ns', 'root').end()

    $$.expectStreamResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <root xmlns="ns"/>`, done)
  })

})