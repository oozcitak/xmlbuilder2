import $$ from '../TestHelpers'

describe('Replicate issue', () => {

  // https://github.com/oozcitak/xmlbuilder2/issues/15
  test('#15 - Fix decoding of entities on conversion from XML to object', () => {
    const originalXML = `<?xml version="1.0"?><example>&lt;p&gt;Hello&lt;/p&gt;</example>`
    const objectXML = $$.convert(originalXML, { format: "object", noDoubleEncoding: true })
    const recreatedXML = $$.convert(objectXML, { format: "xml", noDoubleEncoding: true })

    expect(recreatedXML).toBe(originalXML)
  })

})
