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
