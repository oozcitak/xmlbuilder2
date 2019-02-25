import { Element } from "./Element"
import { Node } from "./Node"

/**
 * Represents a collection of elements.
 */
export class HTMLCollection {
  protected _parent: Node
  protected _filter: (element: Element) => any
    
  /**
   * Initializes a new instance of `HTMLCollection`.
   *
   * @param nodes - the associated {@link NodeList}.
   */
  public constructor(parent: Node, filter?: (element: Element) => any) {
    this._parent = parent
    this._filter = filter || function(element: Element) { return true }

    return new Proxy(this, this)
  }

  /** 
   * Returns the number of elements in the collection.
   */
  get length(): number {
    let count = 0
    for (let node of this) {
        count++
    }
    return count
  }

  /** 
   * Returns the element with index `index` from the collection.
   * 
   * @param index - the zero-based index of the element to return
   */
  item(index: number): Element | null {
    let i = 0
    for (let node of this) {
      if (i === index)
        return node
      else
        i++
    }

    return null
  }

  /** 
   * Returns the first element with ID or name `name` from the
   * collection.
   * 
   * @param name - the name of the element to return
   */
  namedItem(name: string): Element | null {
    if (!name) return null

    let i = 0
    for (let node of this) {
      if (node.id === name || node.getAttribute('name') === name)
        return node
    }

    return null
  }

  /**
   * Returns an iterator for nodes.
   */
  [Symbol.iterator](): any {
    let node = this._parent.firstChild
    let filter = this._filter

    return {
      next: function () {
        if (node) {
          while (node && (node.nodeType !== Node.Element || !filter(<Element>node))) {
            node = node.nextSibling
          }
          if (node)
            return { done: false, value: <Element>node }
          else
            return { done: true }
        } else {
            return { done: true }
        }
      }
    }
  }

  get(target: HTMLCollection, propertyKey: string | number | symbol, receiver: any): Element | null {
    if (typeof propertyKey === 'number')
      return target.item(propertyKey)
    else if (typeof propertyKey === 'string')
      return target.namedItem(propertyKey)
    else
      return Reflect.get(target, propertyKey, receiver)
  }

  /**
   * TODO:
   * element = collection[index]
   *   Returns the element with index index from the collection. The 
   *   elements are sorted in tree order.
   * element = collection[name]
   *   Returns the first element with ID or name name from the 
   *   collection.
   */
}

