import { Attr } from "./Attr";
import { DOMException } from "./DOMException";

/**
 * Represents a collection of nodes.
 */
export class NamedNodeMap extends Array<Attr> {

  /** 
   * Returns the attribute with index `index` from the collection.
   * 
   * @param index - the zero-based index of the attribute to return
   */
  item(index: number): Attr | null { return this[index] || null }

  /**
   * Returns the attribute with the given `qualifiedName`.
   * 
   * @param qualifiedName - qualified name to search for
   */
  getNamedItem(qualifiedName: string): Attr | null {
    for(let att of this) {
      if (att.name === qualifiedName) return att
    }
    return null
  }

  /**
   * Returns the attribute with the given `namespace` and 
   * `qualifiedName`.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  getNamedItemNS(namespace: string, localName: string): Attr | null {
    for(let att of this) {
      if (att.namespaceURI === namespace && att.localName === localName)
        return att
    }
    return null
  }
  
  /**
   * Sets the attribute given with `attr`.
   * 
   * @param attr - attribute to set
   */
  setNamedItem(attr: Attr): Attr | null {
    if (!attr.ownerElement)
      throw DOMException.InUseAttributeError

    let oldAttr = this.getNamedItemNS(attr.namespaceURI || '', attr.localName)
    if (oldAttr === attr) return attr
    if (oldAttr) {
      let index = this.indexOf(oldAttr)
      this[index] = attr
    } else {
      this.push(attr)
    }

    return oldAttr
  }

  /**
   * Sets the attribute given with `attr`.
   * 
   * @param attr - attribute to set
   */
  setNamedItemNS(attr: Attr): Attr | null {
    return this.setNamedItem(attr)
  }

  /**
   * Removes the attribute with the given `qualifiedName`.
   * 
   * @param qualifiedName - qualified name to search for
   */
  removeNamedItem(qualifiedName: string): Attr {
    let index = -1
    for(let i = 0; i < this.length; i++) {
      let att = this[i]
      if (att.name === qualifiedName) {
        index = i
        break
      }
    }

    if(index === -1)
      throw DOMException.NotFoundError

    let removed = this[index]
    this.splice(index, 1)
    return removed
  }

  /**
   * Removes the attribute with the given `namespace` and 
   * `qualifiedName`.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  removeNamedItemNS(namespace: string, localName: string): Attr {
    let index = -1
    for(let i = 0; i < this.length; i++) {
      let att = this[i]
      if (att.namespaceURI === namespace && att.localName === localName) {
        index = i
        break
      }
    }

    if(index === -1)
      throw DOMException.NotFoundError

    let removed = this[index]
    this.splice(index, 1)
    return removed
  }
}