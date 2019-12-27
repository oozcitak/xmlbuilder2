import $$ from '../TestHelpers'

describe('upgrading from xmlbuilder examples in wiki', () => {

  test('JS object conversion syntax of CDATA section nodes is changed', () => {
    const xml1 = $$.document().ele("root").ele({ "$": "value" }).end({ format: "xml" })
    expect(xml1).toEqual(`<?xml version="1.0"?><root><![CDATA[value]]></root>`)
    const xml2 = $$.document({ convert: { text: '#text', cdata: '#cdata' } }).ele("root").ele({ "#cdata": "value" }).end({ format: "xml" })
    expect(xml2).toEqual(`<?xml version="1.0"?><root><![CDATA[value]]></root>`)
  })

  test('JS object conversion syntax of comment nodes is changed', () => {
    const xml1 = $$.document().ele("root").ele({ "!": "value" }).end({ format: "xml" })
    expect(xml1).toEqual(`<?xml version="1.0"?><root><!--value--></root>`)
    const xml2 = $$.document({ convert: { text: '#text', comment: '#comment' } }).ele("root").ele({ "#comment": "value" }).end({ format: "xml" })
    expect(xml2).toEqual(`<?xml version="1.0"?><root><!--value--></root>`)
  })

})

