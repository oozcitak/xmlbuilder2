/**
 * Applies the mixin to a given class.
 * 
 * @param baseClass - class to recieve te mixin
 * @param mixinClass - mixin class
 * @param overrides - an array with names of function overrides. Base class 
 * functions whose names are in this array will be kept by prepending an
 * underscore to their names.
 */
export function applyMixin(baseClass: any, mixinClass: any, ...overrides: string[]): void {
  Object.getOwnPropertyNames(mixinClass.prototype).forEach(name => {
    if (overrides.includes(name)) {
      const orgPropDesc = Object.getOwnPropertyDescriptor(baseClass.prototype, name)
      /* istanbul ignore else */
      if (orgPropDesc) {
        Object.defineProperty(baseClass.prototype, "_" + name, orgPropDesc)
      }
    }
    const propDesc = Object.getOwnPropertyDescriptor(mixinClass.prototype, name)
    /* istanbul ignore else */
    if (propDesc) {
      Object.defineProperty(baseClass.prototype, name, propDesc)
    }
  })
}

/**
 * Deep clones the given object.
 * 
 * @param obj - an object
 */
export function clone<T>(obj: T): T {
  if (isFunction(obj)) {
    return obj
  } else if (isArray(obj)) {
    const result: any = []
    for (const item of obj) {
      result.push(clone(item))
    }
    return result
  } else if (isObject(obj)) {
    const result: any = {}
    for (const [key, val] of Object.entries(obj)) {
      result[key] = clone(val)
    }
    return result
  } else {
    return obj
  }
}

/**
 * Applies default values to the given object.
 * 
 * @param obj - an object
 * @param defaults - an object with default values
 * @param overwrite - if set to `true` defaults object always overwrites object 
 * values, whether they are `undefined` or not.
 */
export function applyDefaults<T>(
  obj: { [key: string]: any } | undefined,
  defaults: { [key: string]: any }, overwrite: boolean = false): T {

  const result = clone(obj || {})

  for (const [key, val] of Object.entries(defaults)) {
    if (!overwrite && result[key] !== undefined) continue

    if (isObject(val)) {
      result[key] = applyDefaults(result[key], val)
    } else {
      result[key] = val
    }
  }

  return <T>result
}

/**
 * Iterates over items pairs of an array.
 * 
 * @param arr - array to iterate
 */
export function* forEachArray<T>(arr: Array<T>): IterableIterator<T> {
  for (let i = 0, len = arr.length; i < len; i++) {
    yield arr[i]
  }
}

/**
 * Iterates over key/value pairs of a map or object.
 * 
 * @param obj - map or object to iterate
 */
export function* forEachObject<T>(obj: Map<string, T> | { [key: string]: T }):
  IterableIterator<[string, T]> {
  if (isMap(obj)) {
    for (const [key, val] of obj.entries()) {
      yield [key, val]
    }
  } else {
    for (const key in obj) {
      /* istanbul ignore next */
      if (!obj.hasOwnProperty(key)) continue
      yield [key, obj[key]]
    }
  }
}

/**
 * Returns the number of entries in a map or object.
 * 
 * @param obj - map or object
 */
export function objectLength(obj: Map<string, any> | { [key: string]: any }):
  number {
  if (isMap(obj)) {
    return obj.size
  } else {
    return Object.keys(obj).length
  }
}

/**
 * Gets the value of a key from a map or object.
 * 
 * @param obj - map or object
 * @param key - the key to retrieve
 */
export function getObjectValue<T>(obj: Map<string, T> |
{ [key: string]: T }, key: string): T | undefined {
  if (isMap(obj)) {
    return obj.get(key)
  } else {
    return obj[key]
  }
}

/**
 * Removes a property from a map or object.
 * 
 * @param obj - map or object
 * @param key - the key to remove
 */
export function removeObjectValue<T>(obj: Map<string, T> |
{ [key: string]: T }, key: string): void {
  if (isMap(obj)) {
    obj.delete(key)
  } else {
    delete obj[key]
  }
}

/**
 * Type guard for boolean types
 * 
 * @param x - a variable to type check
 */
export function isBoolean(x: any): x is boolean {
  return typeof x === "boolean"
}

/**
 * Type guard for numeric types
 * 
 * @param x - a variable to type check
 */
export function isNumber(x: any): x is number {
  return typeof x === "number"
}

/**
 * Type guard for strings
 * 
 * @param x - a variable to type check
 */
export function isString(x: any): x is string {
  return typeof x === "string"
}

/**
 * Type guard for function objects
 * 
 * @param x - a variable to type check
 */
export function isFunction(x: any): x is Function {
  return !!x && Object.prototype.toString.call(x) === '[object Function]'
}

/**
 * Type guard for JS objects
 * 
 * _Note:_ Functions are objects too
 * 
 * @param x - a variable to type check
 */
export function isObject(x: any): x is { [key: string]: any } {
  const type = typeof x
  return !!x && (type === 'function' || type === 'object')
}

/**
 * Type guard for arrays
 * 
 * @param x - a variable to type check
 */
export function isArray(x: any): x is any[] {
  return Array.isArray(x)
}

/**
 * Type guard for maps.
 * 
 * @param x - a variable to check
 */
export function isMap(x: any): x is Map<string, any> {
  return x instanceof Map
}

/**
 * Determines if `x` is an empty Array or an Object with no own properties.
 * 
 * @param x - a variable to check
 */
export function isEmpty(x: any): boolean {
  if (isArray(x)) {
    return !x.length
  } else if (isMap(x) || isObject(x)) {
    for (const [,] of forEachObject(x)) {
      return false
    }
    return true
  }

  return false
}

/**
 * Determines if `x` is a plain Object.
 * 
 * @param x - a variable to check
 */
export function isPlainObject(x: any): boolean {
  if (isObject(x)) {
    const proto = Object.getPrototypeOf(x)
    const ctor = proto.constructor
    return proto && ctor &&
      (typeof ctor === 'function') && (ctor instanceof ctor) &&
      (Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object))
  }

  return false
}

/**
 * Determines if `x` is an iterable Object.
 * 
 * @param x - a variable to check
 */
export function isIterable(x: any): boolean {
  return x && (typeof x[Symbol.iterator] === 'function')
}

/**
 * Gets the primitive value of an object.
 */
export function getValue(obj: any): any {
  if (isFunction(obj.valueOf)) {
    return obj.valueOf()
  } else {
    return obj
  }
}
