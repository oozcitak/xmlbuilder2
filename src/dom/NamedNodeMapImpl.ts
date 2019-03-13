import { NamedNodeMap, Element, Attr } from "./interfaces"
import { DOMException } from "./DOMException"

/**
 * Represents a collection of nodes.
 */
export class NamedNodeMapImpl implements NamedNodeMap {

  protected _ownerElement: Element
  protected _items: Array<Attr>

  constructor(ownerElement: Element) {
    this._ownerElement = ownerElement
    this._items = new Array<Attr>()
  }

  /** 
   * Returns the number of attribute in the collection.
   */
  get length(): number { return this._items.length }

  /** 
   * Returns the attribute with index `index` from the collection.
   * 
   * @param index - the zero-based index of the attribute to return
   */
  item(index: number): Attr | null { return this._items[index] || null }

  /**
   * Returns the attribute with the given `qualifiedName`.
   * 
   * @param qualifiedName - qualified name to search for
   */
  getNamedItem(qualifiedName: string): Attr | null {
    for (const att of this._items) {
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
  getNamedItemNS(namespace: string | null, localName: string): Attr | null {
    for (const att of this._items) {
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
    return this.setNamedItemNS(attr)
  }

  /**
   * Sets the attribute given with `attr`.
   * 
   * @param attr - attribute to set
   */
  setNamedItemNS(attr: Attr): Attr | null {
    if (attr.ownerElement && attr.ownerElement !== this._ownerElement)
      throw DOMException.InUseAttributeError

    const oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName)
    if (oldAttr === attr) return attr
    if (oldAttr) {
      const index = this._items.indexOf(oldAttr)
      this._items[index] = attr
    } else {
      this._items.push(attr)
    }

    return oldAttr
  }

  /**
   * Removes the attribute with the given `qualifiedName`.
   * 
   * @param qualifiedName - qualified name to search for
   */
  removeNamedItem(qualifiedName: string): Attr {
    let index = -1
    for (let i = 0; i < this.length; i++) {
      const att = this._items[i]
      if (att.name === qualifiedName) {
        index = i
        break
      }
    }

    if (index === -1)
      throw DOMException.NotFoundError

    const removed = this._items[index]
    this._items.splice(index, 1)
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
    for (let i = 0; i < this.length; i++) {
      const att = this._items[i]
      if (att.namespaceURI === namespace && att.localName === localName) {
        index = i
        break
      }
    }

    if (index === -1)
      throw DOMException.NotFoundError

    const removed = this._items[index]
    this._items.splice(index, 1)
    return removed
  }

  /**
   * Returns an iterator for nodes.
   */
  *[Symbol.iterator](): IterableIterator<Attr> {
    yield* this._items
  }
}