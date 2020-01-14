/**
 * Represents a set of unique attribute namespaceURI and localName pairs.
 * This set will contain tuples of unique attribute namespaceURI and 
 * localName pairs, and is populated as each attr is processed. This set is 
 * used to [optionally] enforce the well-formed constraint that an element
 * cannot have two attributes with the same namespaceURI and localName. 
 * This can occur when two otherwise identical attributes on the same 
 * element differ only by their prefix values.
 */
export class LocalNameSet {

  // tuple storage
  private _items: { [key: string]: { [key: string]: boolean } } = {}
  private _nullItems: { [key: string]: boolean } = {}

  /**
   * Adds or replaces a tuple.
   * 
   * @param ns - namespace URI
   * @param localName - attribute local name
   */
  set(ns: string | null, localName: string): void {
    if (ns === null) {
      this._nullItems[localName] = true
    } else if (this._items[ns]) {
      this._items[ns][localName] = true
    } else {
      this._items[ns] = {}
      this._items[ns][localName] = true
    }
  }

  /**
   * Determines if the given tuple exists in the set.
   * 
   * @param ns - namespace URI
   * @param localName - attribute local name
   */
  has(ns: string | null, localName: string): boolean {
    if (ns === null) {
      return this._nullItems[localName] === true
    } else if (this._items[ns]) {
      return this._items[ns][localName] === true
    } else {
      return false
    }
  }

}
