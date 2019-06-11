import $$ from './TestHelpers'

describe('NodeList', function () {

  const doc = $$.dom.createDocument('myns', 'root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const ele1 = doc.createElement('tag1')
  const ele2 = doc.createElement('tag2')
  const ele3 = doc.createElement('tag3')
  const ele4 = doc.createElement('tag4')
  const ele5 = doc.createElement('tag5')

  doc.documentElement.appendChild(ele1)
  doc.documentElement.appendChild(ele2)
  doc.documentElement.appendChild(ele3)
  doc.documentElement.appendChild(ele4)
  doc.documentElement.appendChild(ele5)

  const list = doc.documentElement.childNodes

  test('length', function () {
    expect(list.length).toBe(5)
  })

  test('item()', function () {
    expect(list.item(0)).toBe(ele1)
    expect(list.item(1)).toBe(ele2)
    expect(list.item(2)).toBe(ele3)
    expect(list.item(3)).toBe(ele4)
    expect(list.item(4)).toBe(ele5)
    expect(list.item(-1)).toBeNull()
    expect(list.item(1001)).toBeNull()
  })

  test('keys()', function () {
    let i = 0
    for (const index of list.keys()) {
      expect(index).toBe(i)
      i++
    }
  })

  test('values()', function () {
    let i = 0
    let arr = [ele1, ele2, ele3, ele4, ele5]
    for (const ele of list.values()) {
      expect(ele).toBe(arr[i])
      i++
    }
  })

  test('entries()', function () {
    let i = 0
    let arr = [ele1, ele2, ele3, ele4, ele5]
    for (const entry of list.entries()) {
      expect(entry[0]).toBe(i)
      expect(entry[1]).toBe(arr[i])
      i++
    }
  })

  test('iteration()', function () {
    let i = 0
    let arr = [ele1, ele2, ele3, ele4, ele5]
    for (const ele of list) {
      expect(ele).toBe(arr[i])
      i++
    }
  })

  test('forEach()', function () {
    let i = 0
    let arr = [ele1, ele2, ele3, ele4, ele5]
    list.forEach((node, index) => {
      expect(node).toBe(arr[i])
      expect(index).toBe(i)
      i++
    }, list)
  })

})