import * as util from '../../src/util'

describe('util', function () {

  test('clone', function () {
    expect(util.clone(1)).toBe(1)
    expect(util.clone(true)).toBe(true)
    expect(util.clone("x")).toBe("x")
    expect(util.clone(["x"])).toEqual(["x"])
    expect(util.clone({ x: "x" })).toEqual({ x: "x" })

    const obj1 = {
      a: 1,
      b: [1, 2, 3],
      c: "x",
      d: (val: string): string => 'hello ' + val
    }
    const  obj2 = util.clone(obj1)
    expect(obj2.a).toBe(1)
    expect(obj2.b).toEqual([1, 2, 3])
    expect(obj2.c).toBe("x")
    expect(obj2.d("world")).toBe("hello world")
  })

  test('isBoolean', function () {
    expect(util.isBoolean(true)).toBeTruthy()
    expect(util.isBoolean(true)).toBeTruthy()
    expect(util.isBoolean(1)).toBeFalsy()
    expect(util.isBoolean(0)).toBeFalsy()
    expect(util.isBoolean("x")).toBeFalsy()
    expect(util.isBoolean(["x"])).toBeFalsy()
    expect(util.isBoolean({ x: "x" })).toBeFalsy()
    expect(util.isBoolean(() => { })).toBeFalsy()
  })

  test('isNumber', function () {
    expect(util.isNumber(1)).toBeTruthy()
    expect(util.isNumber(0)).toBeTruthy()
    expect(util.isNumber(NaN)).toBeTruthy()
    expect(util.isNumber(Infinity)).toBeTruthy()
    expect(util.isNumber("x")).toBeFalsy()
    expect(util.isNumber(["x"])).toBeFalsy()
    expect(util.isNumber({ x: "x" })).toBeFalsy()
    expect(util.isNumber(() => { })).toBeFalsy()
  })

  test('isString', function () {
    expect(util.isString("")).toBeTruthy()
    expect(util.isString("0")).toBeTruthy()
    expect(util.isString(1)).toBeFalsy()
    expect(util.isString(["x"])).toBeFalsy()
    expect(util.isString({ x: "x" })).toBeFalsy()
    expect(util.isString(() => { })).toBeFalsy()
  })

  test('isFunction', function () {
    expect(util.isFunction(() => { })).toBeTruthy()
    expect(util.isFunction("0")).toBeFalsy()
    expect(util.isFunction(1)).toBeFalsy()
    expect(util.isFunction(["x"])).toBeFalsy()
    expect(util.isFunction({ x: "x" })).toBeFalsy()
  })

  test('isObject', function () {
    expect(util.isObject(() => { })).toBeTruthy()
    expect(util.isObject(["x"])).toBeTruthy()
    expect(util.isObject({ x: "x" })).toBeTruthy()
    expect(util.isObject("0")).toBeFalsy()
    expect(util.isObject(1)).toBeFalsy()
  })

  test('isArray', function () {
    expect(util.isArray(["x"])).toBeTruthy()
    expect(util.isArray(() => { })).toBeFalsy()
    expect(util.isArray({ x: "x" })).toBeFalsy()
    expect(util.isArray("0")).toBeFalsy()
    expect(util.isArray(1)).toBeFalsy()
  })

  test('isEmpty', function () {
    expect(util.isEmpty([])).toBeTruthy()
    expect(util.isEmpty({})).toBeTruthy()
    expect(util.isEmpty(["x"])).toBeFalsy()
    expect(util.isEmpty({ x: "x" })).toBeFalsy()

    class Obj { }
    const emptyObj = new Obj()
    Reflect.setPrototypeOf(emptyObj, { id: 42 })
    expect(util.isEmpty(emptyObj)).toBeTruthy()
  })

  test('isPlainObject', function () {
    expect(util.isPlainObject({ x: "x" })).toBeTruthy()
    expect(util.isPlainObject(new Number(1))).toBeFalsy()
    expect(util.isPlainObject(["x"])).toBeFalsy()
    expect(util.isPlainObject(() => { })).toBeFalsy()
    expect(util.isPlainObject("0")).toBeFalsy()
    expect(util.isPlainObject(1)).toBeFalsy()
  })

  test('isIterable', function () {
    expect(util.isIterable(["x"])).toBeTruthy()
    expect(util.isIterable(new Map<string, number>([["a", 1]]))).toBeTruthy()
    expect(util.isIterable("0")).toBeTruthy()
    expect(util.isIterable({ x: "x" })).toBeFalsy()
    expect(util.isIterable(() => { })).toBeFalsy()
    expect(util.isIterable(1)).toBeFalsy()
  })

  test('isMap', function () {
    expect(util.isMap(new Map<string, number>([["a", 1]]))).toBeTruthy()
    expect(util.isMap({ x: "x" })).toBeFalsy()
    expect(util.isMap(["x"])).toBeFalsy()
    expect(util.isMap(() => { })).toBeFalsy()
    expect(util.isMap("0")).toBeFalsy()
    expect(util.isMap(1)).toBeFalsy()
  })

  test('getValue', function () {
    expect(util.getValue(new Number(1))).toBe(1)
    expect(util.getValue(new String("x"))).toBe("x")
    expect(util.getValue({ x: "x" })).toEqual({ x: "x" })
    expect(util.getValue(["x"])).toEqual(["x"])
    const withValueOf = new Number(1)
    const withoutValueOf = withValueOf as any
    withoutValueOf.valueOf = undefined
    expect(util.getValue(withoutValueOf).toString()).toBe("1")
  })

})