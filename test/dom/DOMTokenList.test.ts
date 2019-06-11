import $$ from './TestHelpers'

describe('DOMTokenList', function () {

  const doc = $$.dom.createDocument('myns', 'root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const ele = doc.createElement('tagged')
  doc.documentElement.appendChild(ele)
  ele.setAttribute('class', 'one two three')
  const list = ele.classList
  const ele2 = doc.createElement('node')
  doc.documentElement.appendChild(ele2)
  const list2 = ele2.classList

  test('length', function () {
    expect(list.length).toBe(3)
  })

  test('item()', function () {
    expect(list.item(0)).toBe('one')
    expect(list.item(1)).toBe('two')
    expect(list.item(2)).toBe('three')
    expect(list.item(-1)).toBe(null)
    expect(list.item(1001)).toBe(null)
  })

  test('contains()', function () {
    expect(list.contains('one')).toBeTruthy()
    expect(list.contains('two')).toBeTruthy()
    expect(list.contains('three')).toBeTruthy()
    expect(list.contains('none')).toBeFalsy()
  })

  test('add()', function () {
    list.add('four', 'five')
    expect(list.length).toBe(5)
  })

  test('remove()', function () {
    list.remove('four', 'five')
    expect(list.length).toBe(3)
    expect(() => list.remove('')).toThrow()
    expect(() => list.remove(' ')).toThrow()
  })

  test('toggle()', function () {
    expect(list.toggle('one')).toBeFalsy()
    expect(list.toggle('one')).toBeTruthy()
    expect(list.toggle('one', false)).toBeFalsy()
    expect(list.length).toBe(2)
    expect(list.toggle('one', false)).toBeFalsy()
    expect(list.length).toBe(2)
    expect(list.toggle('one', true)).toBeTruthy()
    expect(list.length).toBe(3)
    expect(list.toggle('one', true)).toBeTruthy()
    expect(list.length).toBe(3)
  })

  test('replace()', function () {
    expect(() => list.replace('', '1')).toThrow()
    expect(() => list.replace('one', '')).toThrow()
    expect(() => list.replace(' ', '1')).toThrow()
    expect(() => list.replace('one', ' ')).toThrow()
    expect(list.replace('one', '1')).toBeTruthy()
    expect(list.replace('one', '1')).toBeFalsy()
    expect(list.length).toBe(3)
  })

  test('supports()', function () {
    expect(() => list.supports('feature')).toThrow()
  })

  test('value', function () {
    list.value = 'four five six seven'
    expect(list.length).toBe(4)
    list.add('eight')
    expect(list.value).toBe('four five six seven eight')
    expect(list.length).toBe(5)
  })

  test('iteration', function () {
    list.value = 'one two three'
    let names = ''
    for (const name of list) {
      names += '_' + name
    }
    expect(names).toBe('_one_two_three')
  })

  test('empty token list', function () {
    list2.value = ''
    expect(list2.length).toBe(0)
  })

})