import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/24
  $$.test("#24 - \r encoding in element txt", () => {
    const root = $$.create().ele('parent', {
      text: 'Hello \r\n'
    }).ele('child').txt('Line 1\r\nLine 2\r\nLine 3')

    $$.deepEqual(root.end({ headless: true, prettyPrint: true, newline: '\r\n' }),
    '<parent text="Hello \r\n">\r\n' +
    '  <child>Line 1\r\n' +
    'Line 2\r\n' +
    'Line 3</child>\r\n' +
    '</parent>'
    )
  })

})
