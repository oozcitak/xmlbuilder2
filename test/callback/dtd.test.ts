import $$ from '../TestHelpers'

$$.suite('dtd()', () => {

  $$.test('doctype with both public and system identifier', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ version: "1.0" })
      .dtd({ name: 'root', pubID: "pub", sysID: "sys" })
      .ele('ns', 'root').end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub" "sys">
      <root xmlns="ns"/>`)
  })

  $$.test('doctype with public identifier', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ version: "1.0" })
      .dtd({ name: 'root', pubID: "pub" })
      .ele('ns', 'root').end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pub">
      <root xmlns="ns"/>`)
  })

  $$.test('doctype with system identifier', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ version: "1.0" })
      .dtd({ name: 'root', sysID: "sys" })
      .ele('ns', 'root').end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root SYSTEM "sys">
      <root xmlns="ns"/>`)
  })

  $$.test('doctype without identifiers', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec({ version: "1.0" })
      .dtd({ name: 'root' })
      .ele('ns', 'root').end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <root xmlns="ns"/>`)
  })

})