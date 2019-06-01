import * as util from '../../src/util'

describe('util', function () {

  test('isNumber', function () {
    expect(util.isNumber(1)).toBeTruthy()
    expect(util.isNumber(0)).toBeTruthy()
    expect(util.isNumber(NaN)).toBeTruthy()
    expect(util.isNumber(Infinity)).toBeTruthy()
    expect(util.isNumber("x")).toBeFalsy()
    expect(util.isNumber(["x"])).toBeFalsy()
    expect(util.isNumber({ x: "x" })).toBeFalsy()
    expect(util.isNumber(() => {})).toBeFalsy()
  })

  test('isString', function () {
    expect(util.isString("")).toBeTruthy()
    expect(util.isString("0")).toBeTruthy()
    expect(util.isString(1)).toBeFalsy()
    expect(util.isString(["x"])).toBeFalsy()
    expect(util.isString({ x: "x" })).toBeFalsy()
    expect(util.isString(() => {})).toBeFalsy()
  })

  test('isFunction', function () {
    expect(util.isFunction(() => {})).toBeTruthy()
    expect(util.isFunction("0")).toBeFalsy()
    expect(util.isFunction(1)).toBeFalsy()
    expect(util.isFunction(["x"])).toBeFalsy()
    expect(util.isFunction({ x: "x" })).toBeFalsy()
  })
  
  test('isObject', function () {
    expect(util.isObject(() => {})).toBeTruthy()
    expect(util.isObject(["x"])).toBeTruthy()
    expect(util.isObject({ x: "x" })).toBeTruthy()
    expect(util.isObject("0")).toBeFalsy()
    expect(util.isObject(1)).toBeFalsy()
  })

  test('isArray', function () {
    expect(util.isArray(["x"])).toBeTruthy()
    expect(util.isArray(() => {})).toBeFalsy()
    expect(util.isArray({ x: "x" })).toBeFalsy()
    expect(util.isArray("0")).toBeFalsy()
    expect(util.isArray(1)).toBeFalsy()
  })

  test('isEmpty', function () {
    expect(util.isEmpty([ ])).toBeTruthy()
    expect(util.isEmpty({ })).toBeTruthy()
    expect(util.isEmpty(["x"])).toBeFalsy()
    expect(util.isEmpty({ x: "x" })).toBeFalsy()
  })

  test('isPlainObject', function () {
    expect(util.isPlainObject({ x: "x" })).toBeTruthy()
    expect(util.isPlainObject(new Number(1))).toBeFalsy()
    expect(util.isPlainObject(["x"])).toBeFalsy()
    expect(util.isPlainObject(() => {})).toBeFalsy()
    expect(util.isPlainObject("0")).toBeFalsy()
    expect(util.isPlainObject(1)).toBeFalsy()
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