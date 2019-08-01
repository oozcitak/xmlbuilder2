import { NodeInternal } from '../interfacesInternal'

/**
 * Contains type casts for DOM objects.
 */
export class Cast {

  /**
   * Casts the given object to a `Node`.
   * 
   * @param a - the object to cast
   */
  static asNode(a: any): NodeInternal {
    return (a as unknown as NodeInternal)
  }
}