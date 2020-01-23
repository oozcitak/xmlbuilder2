import $$ from '../TestHelpers'

describe('withOptions()', () => {

  test('XML declaration', () => {
    expect(
      $$.document({ version: "1.0", encoding: "UTF-8", standalone: true })
        .ele('root').end()).toBe(
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root/>'
        )

    expect(
      $$.document({ version: "1.0", encoding: "UTF-16", standalone: false })
        .ele('root').end()).toBe(
          '<?xml version="1.0" encoding="UTF-16" standalone="no"?><root/>'
        )
  })

  test('zero length converter strings', () => {
    expect(() => $$.document({ convert: { att: "" } })).toThrow()
    expect(() => $$.document({ convert: { ins: "" } })).toThrow()
    expect(() => $$.document({ convert: { text: "" } })).toThrow()
    expect(() => $$.document({ convert: { cdata: "" } })).toThrow()
    expect(() => $$.document({ convert: { comment: "" } })).toThrow()
  })

})
