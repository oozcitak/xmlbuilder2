import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/105
  test(`#105 - Illegal character does not get sanitized.`, () => {
    const b = $$.create()
    b.ele('doc').ele('test').txt('some & text; foo')
    expect(b.end()).toBe($$.t`<?xml version="1.0"?><doc><test>some &amp; text; foo</test></doc>`);
  })

})
