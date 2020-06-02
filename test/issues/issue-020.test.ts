import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/20
  test("#20 - Setting xmlns causes problem on children", () => {
    const node = $$.create().ele('root').ele('child').txt('child text')
    expect(node.end({ prettyPrint: true, headless: true })).toBe($$.t`
    <root>
      <child>child text</child>
    </root>
    `)

    node.root().att('xmlns', 'anything')
    expect(node.end({ prettyPrint: true, headless: true })).toBe($$.t`
    <root xmlns="anything">
      <child>child text</child>
    </root>
    `)
  })
})
