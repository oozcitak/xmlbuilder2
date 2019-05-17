/**
 * Applies the mixin to a given class.
 * 
 * @param baseClass - class to recieve te mixin
 * @param mixinClass - mixin class
 */
export function _applyMixin(baseClass: any, mixinClass: any): void {
  Object.getOwnPropertyNames(mixinClass.prototype).forEach(name => {
    const propDesc = Object.getOwnPropertyDescriptor(mixinClass.prototype, name)
    /* istanbul ignore else */
    if (propDesc) 
      Object.defineProperty(baseClass.prototype, name, propDesc)
  })
}

/**
 * Type guard for numeric types
 * 
 * @param x - a variable to type check
 */
export function isNumber(x: any): x is number {
  return typeof x === "number";
}

/**
 * Type guard for strings
 * 
 * @param x - a variable to type check
 */
export function isString(x: any): x is string {
  return typeof x === "string";
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
export function isArray(x: any): x is Array<any> {
  return Array.isArray(x)
}

/**
 * Determines if `x` is an empty Array or an Object with no own properties.
 * 
 * @param x - a variable to check
 */
export function isEmpty(x: any): boolean {
  if (isArray(x)) {
    return !x.length
  } else {
    for (const key in x) {
      if (!x.hasOwnProperty(key)) continue
      return false
    }
    return true
  }
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
 * Gets the primitive value of an object.
 */
export function getValue(obj: any): any {
  if (isFunction(obj.valueOf)) {
    return obj.valueOf()
  } else {
    return obj
  }
}
