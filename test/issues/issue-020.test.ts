import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/20
  $$.test("#20 - Setting xmlns causes problem on children", () => {
    const node = $$.create({ root: { child: 'child text' } })
    const node2 = $$.create().ele('root').ele('child').txt('child text').up().up();

    $$.deepEqual(node.end({ prettyPrint: true, headless: true }), $$.t`
    <root>
      <child>child text</child>
    </root>
    `)
    $$.deepEqual(node.root().att('xmlns', 'anything').end({ prettyPrint: true, headless: true }), $$.t`
    <root xmlns="anything">
      <child>child text</child>
    </root>
    `)

    $$.deepEqual(node2.end({ prettyPrint: true, headless: true }), $$.t`
    <root>
      <child>child text</child>
    </root>
    `)
    $$.deepEqual(node2.root().att('xmlns', 'anything').end({ prettyPrint: true, headless: true }), $$.t`
    <root xmlns="anything">
      <child>child text</child>
    </root>
    `)
  })

})
