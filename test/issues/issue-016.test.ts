import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/16
  test("#16 - Named entities produce invalid XML", () => {
    expect(
      $$.convert(
        { example: "&lt;p&gt;Hello&nbsp;World&lt;/p&gt;" },
        { format: "xml" }
      )
    ).toBe(
      '<?xml version="1.0"?><example>&lt;p&gt;Hello&nbsp;World&lt;/p&gt;</example>'
    );
    expect(
      $$.convert(
        { example: "&notanentity&lt;" },
        { format: "xml" }
      )
    ).toBe('<?xml version="1.0"?><example>&amp;notanentity&lt;</example>')
  })
})
