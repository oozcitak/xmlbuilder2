import { TupleSet } from '../../../src/dom/serializer/TupleSet'

describe('TupleSet', function () {

  test('size', function () {
    const set = new TupleSet<number, string>()
    set.set([1, "a"])
    set.set([1, "aa"])
    set.set([2, "b"])
    set.set([3, "c"])
    set.set([3, "c"])
    expect(set.size).toBe(4)
  })

  test('set()', function () {
    const set = new TupleSet<number, string>()
    set.set([1, "a"])
    set.set([1, "aa"])
    set.set([2, "b"])
    set.set([3, "c"])
    set.set([3, "c"])
    expect(set.size).toBe(4)
    expect(set.has([1, "aa"])).toBeTruthy()
    expect(set.has([3, "c"])).toBeTruthy()
  })

  test('clear()', function () {
    const set = new TupleSet<number, string>()
    set.set([1, "a"])
    set.set([1, "aa"])
    set.set([2, "b"])
    set.set([3, "c"])
    set.set([3, "c"])
    expect(set.size).toBe(4)
    expect(set.has([1, "aa"])).toBeTruthy()
    expect(set.has([3, "c"])).toBeTruthy()
    set.clear()
    expect(set.size).toBe(0)
    expect(set.has([1, "aa"])).toBeFalsy()
    expect(set.has([3, "c"])).toBeFalsy()
  })

  test('delete()', function () {
    const set = new TupleSet<number, string>()
    set.set([1, "a"])
    set.set([1, "aa"])
    set.set([2, "b"])
    set.set([3, "c"])
    set.set([3, "c"])
    expect(set.size).toBe(4)
    expect(set.has([1, "a"])).toBeTruthy()
    expect(set.has([1, "aa"])).toBeTruthy()
    expect(set.has([2, "b"])).toBeTruthy()
    expect(set.has([3, "c"])).toBeTruthy()
    set.delete([1, "aa"])
    set.delete([3, "c"])
    expect(set.size).toBe(2)
    expect(set.has([1, "a"])).toBeTruthy()
    expect(set.has([2, "b"])).toBeTruthy()
    expect(set.has([1, "aa"])).toBeFalsy()
    expect(set.has([3, "c"])).toBeFalsy()
  })

  test('entries()', function () {
    const set = new TupleSet<number, string>()
    set.set([1, "a"])
    set.set([1, "aa"])
    set.set([2, "b"])
    set.set([3, "c"])
    set.set([3, "c"])
    let keys = ""
    let vals = ""
    for (const val of set.entries()) {
      keys += val[0].toString()
      vals += val[1].toString()
    }
    expect(keys).toBe("1123")
    expect(vals).toBe("aaabc")
  })

  test('values()', function () {
    const set = new TupleSet<number, string>()
    set.set([1, "a"])
    set.set([1, "aa"])
    set.set([2, "b"])
    set.set([3, "c"])
    set.set([3, "c"])
    let keys = ""
    let vals = ""
    for (const val of set.values()) {
      keys += val[0].toString()
      vals += val[1].toString()
    }
    expect(keys).toBe("1123")
    expect(vals).toBe("aaabc")
  })

  test('foreach()', function () {
    const set = new TupleSet<number, string>()
    set.set([1, "a"])
    set.set([1, "aa"])
    set.set([2, "b"])
    set.set([3, "c"])
    set.set([3, "c"])
    let keys = ""
    let vals = ""
    set.forEach((val, setRef) => {
      keys += val[0].toString()
      vals += val[1].toString()
    })
    expect(keys).toBe("1123")
    expect(vals).toBe("aaabc")

    set.clear()
    set.set([1, "a"])
    let thisObj: { x: string } = { x: "abc" }
    set.forEach(function(this: { x: string }, val, setRef) {
      expect(val[0]).toBe(1)
      expect(val[1]).toBe("a")
      expect(this).toBe(thisObj)
      expect(setRef).toBe(set)
    }, thisObj)
  })

  test('has()', function () {
    const set = new TupleSet<number, string>()
    set.set([1, "a"])
    set.set([1, "aa"])
    set.set([2, "b"])
    set.set([3, "c"])
    set.set([3, "c"])
    expect(set.size).toBe(4)
    expect(set.has([1, "a"])).toBeTruthy()
    expect(set.has([1, "aa"])).toBeTruthy()
    expect(set.has([2, "b"])).toBeTruthy()
    expect(set.has([3, "c"])).toBeTruthy()
    set.clear()
    expect(set.size).toBe(0)
    expect(set.has([1, "a"])).toBeFalsy()
    expect(set.has([2, "b"])).toBeFalsy()
    expect(set.has([1, "aa"])).toBeFalsy()
    expect(set.has([3, "c"])).toBeFalsy()
  })

  test('iterator', function () {
    const set = new TupleSet<number, string>()
    set.set([1, "a"])
    set.set([1, "aa"])
    set.set([2, "b"])
    set.set([3, "c"])
    set.set([3, "c"])
    let keys = ""
    let vals = ""
    for (const val of set) {
      keys += val[0].toString()
      vals += val[1].toString()
    }
    expect(keys).toBe("1123")
    expect(vals).toBe("aaabc")
  })

})