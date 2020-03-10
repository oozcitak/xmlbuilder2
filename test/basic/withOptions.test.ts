import $$ from '../TestHelpers'

describe('withOptions()', () => {

  test('XML declaration', () => {
    expect(
      $$.create({ version: "1.0", encoding: "UTF-8", standalone: true })
        .ele('root').end()).toBe(
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root/>'
        )

    expect(
      $$.create({ version: "1.0", encoding: "UTF-16", standalone: false })
        .ele('root').end()).toBe(
          '<?xml version="1.0" encoding="UTF-16" standalone="no"?><root/>'
        )
  })

  test('zero length converter strings', () => {
    expect(() => $$.create({ convert: { att: "" } })).toThrow()
    expect(() => $$.create({ convert: { ins: "" } })).toThrow()
    expect(() => $$.create({ convert: { text: "" } })).toThrow()
    expect(() => $$.create({ convert: { cdata: "" } })).toThrow()
    expect(() => $$.create({ convert: { comment: "" } })).toThrow()
  })

  test('with inheritNS', () => {
    const doc = $$.create({ inheritNS: true })
      .ele("http://example.com", "parent")
      .ele("child").doc()

    expect(doc.end({ headless: true })).toBe($$.t`
      <parent xmlns="http://example.com"><child/></parent>
    `)
  })

  test('without inheritNS', () => {
    const doc = $$.create({ inheritNS: false })
      .ele("http://example.com", "parent")
      .ele("child").doc()

    expect(doc.end({ headless: true })).toBe($$.t`
      <parent xmlns="http://example.com"><child xmlns=""/></parent>
    `)
  })

  test('change inheritNS with set ', () => {
    const doc = $$.create()
      .ele("http://example.com", "parent")
      .set({ inheritNS: true })
      .ele("child").up()
      .set({ inheritNS: false })
      .ele("child").up().
      doc()

    expect(doc.end({ headless: true })).toBe($$.t`
      <parent xmlns="http://example.com"><child/><child xmlns=""/></parent>
    `)
  })

})
