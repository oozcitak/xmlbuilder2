import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/26
  test("#26 - double encoding of &#x9; &#xD; &#xA;", () => {
    const root = $$.create().ele('parent', {
      text: 'Hello&#x9;World!&#xD;&#xA;'
    }).ele('child').txt('Line&#x9;1&#xD;&#xA;Line 2&#xD;&#xA;Line 3')
    
    expect(root.end({ headless: true, prettyPrint: true, noDoubleEncoding: true, newline: '\r\n' })).toBe(
    '<parent text="Hello&#x9;World!&#xD;&#xA;">\r\n' +
    '  <child>Line&#x9;1&#xD;&#xA;Line 2&#xD;&#xA;Line 3</child>\r\n' +
    '</parent>'
    )
  })

})
