import $$ from '../TestHelpers'

$$.suite('Replicate issue', () => {

  // https://github.com/oozcitak/xmlbuilder2/issues/6
  $$.test('#6 - When using namespace, empty XMLNs shows up in various child node elements', () => {
    const doc = $$.create()
      .ele("http://example.com", "parent")
      .ele("child").doc()

    $$.deepEqual(doc.end({ headless: true }), $$.t`
      <parent xmlns="http://example.com"><child/></parent>
    `)
  })

})
