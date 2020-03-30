import $$ from '../TestHelpers'
import { sanitizeInput } from '../../src/builder/dom'

describe('sanitizeInput', () => {

  test('parser', () => {
    expect(sanitizeInput(undefined, '')).toBe(undefined)
    expect(sanitizeInput(null, '')).toBe(null)
    expect(sanitizeInput('hello\x00')).toBe('hello\x00')
    expect(sanitizeInput('\x09\x0A\x0D\x20\uE000', '')).toBe('\x09\x0A\x0D\x20\uE000')
    // surrogate pair
    expect(sanitizeInput('😀', '')).toBe('😀')
    expect(sanitizeInput('\uD83D\uDE00', '')).toBe('😀')
    // lone surrogate
    expect(sanitizeInput('\uD83D\uFFFF', '')).toBe('')
    // invalid surrogate pair
    expect(sanitizeInput('😀', '')).toBe('😀')

    
  })

})
