import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/18
  test("#18 - Bring back inherit namespaces", () => {
    const doc = $$.create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Invoice', { xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2', 'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2', 'xmlns:cbc': "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" })
    
    let frag = $$.fragment()
    frag.ele('cbc:StreetName').txt('Karl Johans gate 45')
    frag.ele('cbc:CityName').txt('Oslo')
    frag.ele('cbc:PostalZone').txt('0162')
    frag.ele('cac:Country')
      .ele('cbc:IdentificationCode', { listID: "ISO3166-1:Alpha2" })
        .txt('NO')
    
    doc.ele('cac:Address').import(frag)
    expect(doc.end({ prettyPrint: true })).toBe($$.t`
    <?xml version="1.0" encoding="UTF-8"?>
    <Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
      <cac:Address>
        <cbc:StreetName>Karl Johans gate 45</cbc:StreetName>
        <cbc:CityName>Oslo</cbc:CityName>
        <cbc:PostalZone>0162</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode listID="ISO3166-1:Alpha2">NO</cbc:IdentificationCode>
        </cac:Country>
      </cac:Address>
    </Invoice>    
    `)
  })
})
