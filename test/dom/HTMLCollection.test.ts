import $$ from './TestHelpers'

describe('HTMLCollection', function () {

  const doc = $$.dom.createDocument('myns', 'root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const ele1 = doc.createElement('tagged')
  ele1.id = 'ele1'
  const ele2 = doc.createElement('tagged')
  ele2.id = 'ele2'
  const ele3 = doc.createElement('tagged')
  ele3.id = 'ele3'
  doc.documentElement.appendChild(ele1)
  doc.documentElement.appendChild(ele2)
  ele1.appendChild(ele3)
  const list = doc.getElementsByTagName('tagged')

  test('length', function () {
    expect(list.length).toBe(3)
  })

  test('item & namedItem', function () {
    expect(list.item(0)).toBe(ele1)
    expect(list.item(1)).toBe(ele3)
    expect(list.item(2)).toBe(ele2)
    expect(list.item(-1)).toBeNull()
    expect(list.item(1001)).toBeNull()
    expect(list.namedItem('ele1')).toBe(ele1)
    expect(list.namedItem('ele2')).toBe(ele2)
    expect(list.namedItem('ele3')).toBe(ele3)
    expect(list.namedItem('')).toBeNull()
    expect(list.namedItem('none')).toBeNull()
  })

  test('indexers', function () {
    expect(list[0]).toBe(ele1)
    expect(list[1]).toBe(ele3)
    expect(list[2]).toBe(ele2)
    expect(list['ele1']).toBe(ele1)
    expect(list['ele2']).toBe(ele2)
    expect(list['ele3']).toBe(ele3)
  })

  test('iteration', function () {
    let names = ''
    for (const ele of list) {
      names += '_' + ele.id
    }
    expect(names).toBe('_ele1_ele3_ele2')
  })

})