import $$ from '../TestHelpers'
import { Char } from '../../src/util'

describe('Char', () => {

  test('escapeText', () => {
    const str = 'abc&def<ghi>jkl'
    expect(Char.escapeText(str)).toBe('abc&amp;def&lt;ghi&gt;jkl')
  })

  test('escapeAttrValue', () => {
    const str = 'abc&def<ghi>jkl"in quotes"'
    expect(Char.escapeAttrValue(str)).toBe('abc&amp;def&lt;ghi&gt;jkl&quot;in quotes&quot;')
  })

  test('assertChar 1.0', () => {
    expect(() => Char.assertChar('invalid char \u{0000}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0001}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0002}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0003}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0004}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0005}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0006}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0007}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0008}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0000}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0001}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0002}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0003}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0004}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0005}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0006}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0007}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0008}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{000B}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{000C}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{000E}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{000F}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0010}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0011}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0012}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0013}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0014}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0015}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0016}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0017}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{0018}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{001A}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{001B}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{001C}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{001D}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{001E}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{001F}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{D800}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{DFFF}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{FFFE}', '1.0')).toThrow()
    expect(() => Char.assertChar('invalid char \u{FFFF}', '1.0')).toThrow()
  })

  test('assertChar 1.1', () => {
    expect(() => Char.assertChar('invalid char \u{0008}', '1.1')).not.toThrow()

    expect(() => Char.assertChar('invalid char \u{0000}', '1.1')).toThrow()
    expect(() => Char.assertChar('invalid char \u{D800}', '1.1')).toThrow()
    expect(() => Char.assertChar('invalid char \u{DFFF}', '1.1')).toThrow()
    expect(() => Char.assertChar('invalid char \u{FFFE}', '1.1')).toThrow()
    expect(() => Char.assertChar('invalid char \u{FFFF}', '1.1')).toThrow()
  })

  test('assertName', () => {
    expect(() => Char.assertName('.test', '1.0')).toThrow()
    expect(() => Char.assertName('_?test', '1.0')).toThrow()
  })

  test('assertPubId', () => {
    expect(() => Char.assertPubId('-//W3C//DTD SVG 1.0//EN', '1.0')).not.toThrow()

    expect(() => Char.assertPubId('c:\\test', '1.0')).toThrow()
    expect(() => Char.assertPubId('weird~quote`', '1.0')).toThrow()
  })

})
