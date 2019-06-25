import $$ from '../TestHelpers'

describe('withOptions()', () => {

  test('XML declaration', () => {
    expect(
      $$.withOptions({ version: "1.0", encoding: "UTF-8", standalone: true })
        .create('root').end()).toBe(
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root/>'
        )

    expect(
      $$.withOptions({ version: "1.1", encoding: "UTF-16", standalone: false })
        .create('root').end()).toBe(
          '<?xml version="1.1" encoding="UTF-16" standalone="no"?><root/>'
        )
  })

  test('DocType', () => {
    expect(
      $$.withOptions({ docType: { pubID: "pub", sysID: "sys" } }).create('root').end()).toBe(
        '<?xml version="1.0"?><!DOCTYPE root PUBLIC "pub" "sys"><root/>'
      )

    expect(
      $$.withOptions({ docType: { pubID: "pub" } }).create('root').end()).toBe(
        '<?xml version="1.0"?><!DOCTYPE root PUBLIC "pub"><root/>'
      )

    expect(
      $$.withOptions({ docType: { sysID: "sys" } }).create('root').end()).toBe(
        '<?xml version="1.0"?><!DOCTYPE root SYSTEM "sys"><root/>'
      )

    expect(
      $$.withOptions({ docType: { } }).create('root').end()).toBe(
        '<?xml version="1.0"?><!DOCTYPE root><root/>'
      )      
  })

  test('zero length converter strings', () => {
    expect(() => $$.withOptions({ convert: { att: "" } })).toThrow()
    expect(() => $$.withOptions({ convert: { ins: "" } })).toThrow()
    expect(() => $$.withOptions({ convert: { text: "" } })).toThrow()
    expect(() => $$.withOptions({ convert: { cdata: "" } })).toThrow()
    expect(() => $$.withOptions({ convert: { comment: "" } })).toThrow()
  })

})
