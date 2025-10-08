import $$ from '../TestHelpers'
import { sanitizeInput } from '../../src/builder/dom'

$$.suite('sanitizeInput', () => {

  $$.test('replacement char', () => {
    $$.deepEqual(sanitizeInput(undefined, ''), undefined)
    $$.deepEqual(sanitizeInput(null, ''), null)
    $$.deepEqual(sanitizeInput('hello\x00'), 'hello\x00')
    $$.deepEqual(sanitizeInput('\x09\x0A\x0D\x20\uE000', ''), '\x09\x0A\x0D\x20\uE000')
    // surrogate pair
    $$.deepEqual(sanitizeInput('😀', ''), '😀')
    $$.deepEqual(sanitizeInput('\uD83D\uDE00', ''), '😀')
    // lone surrogate
    $$.deepEqual(sanitizeInput('\uD83D\uFFFF', ''), '')
    // invalid surrogate pair
    $$.deepEqual(sanitizeInput('😀', ''), '😀')
  })

  $$.test('replacement function', () => {
    $$.deepEqual(sanitizeInput(undefined, () => ''), undefined)
    $$.deepEqual(sanitizeInput(null, () => ''), null)
    $$.deepEqual(sanitizeInput('hello\x00'), 'hello\x00')
    $$.deepEqual(sanitizeInput('\x09\x0A\x0D\x20\uE000', () => ''), '\x09\x0A\x0D\x20\uE000')
    // surrogate pair
    $$.deepEqual(sanitizeInput('😀', () => ''), '😀')
    $$.deepEqual(sanitizeInput('\uD83D\uDE00', () => ''), '😀')
    // lone surrogate
    $$.deepEqual(sanitizeInput('\uD83D\uFFFF', () => ''), '')
    // invalid surrogate pair
    $$.deepEqual(sanitizeInput('😀', () => ''), '😀')
  })

})
