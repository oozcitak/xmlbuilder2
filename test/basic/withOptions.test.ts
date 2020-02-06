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

})
