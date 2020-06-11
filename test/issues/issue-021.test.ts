import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/21
  test("#21 - Number 0 is omitted when converting object to xml", () => {
    expect($$.create().ele({ value: 0 }).end({ headless: true })).toBe('<value>0</value>')
  })

})
