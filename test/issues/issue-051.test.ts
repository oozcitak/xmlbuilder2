import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/51
  $$.test("#51 - NamespaceError: The operation is not allowed by Namespaces in XML. [XMLNS] Qualified name includes a prefix but the namespace is null.", () => {
    const root = $$.create({ version: '1.0', encoding: 'utf-8' })
      .ele('archive', {
        version: '4.0',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://xml.datev.de/bedi/tps/document/v04.0 document_v040.xsd',
        xmlns: 'http://xml.datev.de/bedi/tps/document/v04.0'
      })
    const xml = root.end({ headless: true, prettyPrint: true });

    $$.deepEqual(xml, $$.t`
    <archive version="4.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://xml.datev.de/bedi/tps/document/v04.0 document_v040.xsd" xmlns="http://xml.datev.de/bedi/tps/document/v04.0"/>
    `)
  })

})
