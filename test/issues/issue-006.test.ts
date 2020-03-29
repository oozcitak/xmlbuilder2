import $$ from '../TestHelpers'

describe('Replicate issue', () => {

  // https://github.com/oozcitak/xmlbuilder2/issues/6
  test('#6 - When using namespace, empty XMLNs shows up in various child node elements', () => {
    const doc = $$.create()
      .ele("http://example.com", "parent")
      .ele("child").doc()

    expect(doc.end({ headless: true })).toBe($$.t`
      <parent xmlns="http://example.com"><child/></parent>
    `)
  })

})
