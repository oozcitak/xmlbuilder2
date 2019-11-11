import $$ from '../TestHelpers'

describe('withOptions()', () => {

  test('XML declaration', () => {
    expect(
      $$.xml({ version: "1.0", encoding: "UTF-8", standalone: true })
        .document().ele('root').end()).toBe(
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root/>'
        )

    expect(
      $$.xml({ version: "1.1", encoding: "UTF-16", standalone: false })
        .document().ele('root').end()).toBe(
          '<?xml version="1.1" encoding="UTF-16" standalone="no"?><root/>'
        )
  })

  test('DocType', () => {
    expect(
      $$.xml({ docType: { pubID: "pub", sysID: "sys" } }).document().ele('root').end()).toBe(
        '<?xml version="1.0"?><!DOCTYPE root PUBLIC "pub" "sys"><root/>'
      )

    expect(
      $$.xml({ docType: { pubID: "pub" } }).document().ele('root').end()).toBe(
        '<?xml version="1.0"?><!DOCTYPE root PUBLIC "pub"><root/>'
      )

    expect(
      $$.xml({ docType: { sysID: "sys" } }).document().ele('root').end()).toBe(
        '<?xml version="1.0"?><!DOCTYPE root SYSTEM "sys"><root/>'
      )

    expect(
      $$.xml({ docType: { } }).document().ele('root').end()).toBe(
        '<?xml version="1.0"?><!DOCTYPE root><root/>'
      )      
  })

  test('zero length converter strings', () => {
    expect(() => $$.xml({ convert: { att: "" } })).toThrow()
    expect(() => $$.xml({ convert: { ins: "" } })).toThrow()
    expect(() => $$.xml({ convert: { text: "" } })).toThrow()
    expect(() => $$.xml({ convert: { cdata: "" } })).toThrow()
    expect(() => $$.xml({ convert: { comment: "" } })).toThrow()
  })

})
