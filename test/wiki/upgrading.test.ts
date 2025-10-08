import $$ from '../TestHelpers'

$$.suite('upgrading from xmlbuilder examples in wiki', () => {

  $$.test('JS object conversion syntax of CDATA section nodes is changed', () => {
    const xml1 = $$.create().ele("root").ele({ "$": "value" }).end({ format: "xml" })
    $$.deepEqual(xml1, `<?xml version="1.0"?><root><![CDATA[value]]></root>`)
    const xml2 = $$.create({ convert: { text: '#text', cdata: '#cdata' } }).ele("root").ele({ "#cdata": "value" }).end({ format: "xml" })
    $$.deepEqual(xml2, `<?xml version="1.0"?><root><![CDATA[value]]></root>`)
  })

  $$.test('JS object conversion syntax of comment nodes is changed', () => {
    const xml1 = $$.create().ele("root").ele({ "!": "value" }).end({ format: "xml" })
    $$.deepEqual(xml1, `<?xml version="1.0"?><root><!--value--></root>`)
    const xml2 = $$.create({ convert: { text: '#text', comment: '#comment' } }).ele("root").ele({ "#comment": "value" }).end({ format: "xml" })
    $$.deepEqual(xml2, `<?xml version="1.0"?><root><!--value--></root>`)
  })

})

