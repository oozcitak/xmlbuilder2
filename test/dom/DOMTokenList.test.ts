import $$ from '../TestHelpers'

describe('DOMTokenList', function () {

  const doc = $$.dom.createDocument('myns', 'root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const ele = doc.createElement('tagged')
  doc.documentElement.appendChild(ele)
  ele.setAttribute('class', 'one two three')
  const list = ele.classList

  test('length', function () {
    expect(list.length).toBe(3)
  })

  test('item()', function () {
    expect(list.item(0)).toBe('one')
    expect(list.item(1)).toBe('two')
    expect(list.item(2)).toBe('three')
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

})