import $$ from '../TestHelpers'
import { parseXml } from 'libxmljs2'

describe('Simple XSD validation', () => {

  test('XSD validation', () => {
    const xsdDoc = $$.create()
      .ele('xs:schema', { 'xmlns:xs': 'http://www.w3.org/2001/XMLSchema' })
        .ele('xs:element', { name: 'book' }).doc()
    const xmlDoc1 = $$.create().ele('book').doc()
    const xmlDoc2 = $$.create().ele('booze').doc()

    const xsd = parseXml(xsdDoc.end() as string)
    
    const  xml1 = parseXml(xmlDoc1.end() as string)
    const  xml2 = parseXml(xmlDoc2.end() as string)
    
    expect(xml1.validate(xsd)).toBe(true)
    expect(xml2.validate(xsd)).toBe(false)
  })
  
})
