import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/56
  $$.test(`#56 - Throws TypeError "Cannot read property 'length' of null" when specifying null txt`, () => {
    const xml = $$.create().ele('test').txt(null as any).end({ headless: true })

    $$.deepEqual(xml, '<test/>')
  })

})
