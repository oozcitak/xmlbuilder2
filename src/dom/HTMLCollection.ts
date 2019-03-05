import { Element } from "./Element"
import { Node } from "./Node"
import { Utility } from "./Utility"

/**
 * Represents a collection of elements.
 */
export class HTMLCollection implements Iterable<Element> {

  protected static reservedNames = ['_parent', '_filter', 'length', 'item', 'namedItem', 'get']

  protected _parent: Node
  protected _filter: (element: Element) => any

  /**
   * Initializes a new instance of `HTMLCollection`.
   *
   * @param nodes - the associated {@link NodeList}.
   */
  public constructor(parent: Node, filter?: (element: Element) => any) {
    this._parent = parent
    this._filter = filter || function (element: Element) { return true }

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

    for (let node of this) {
      if (node.id === name || node.getAttribute('name') === name)
        return node
    }

    return null
  }

  /**
   * Returns an iterator for nodes.
   */
  *[Symbol.iterator](): IterableIterator<Element> {
    yield* Utility.Tree.getDescendants<Element>(this._parent, false, false,
      (node: Node) => {
        if (node.nodeType === Node.Element) {
          const ele = <Element>node
          if (this._filter(ele)) return true
        }
        return false
      }
    )
  }

  /**
   * Returns the element with index index from the collection. The 
   * elements are sorted in tree order.
   */
  [index: number]: any

  /*
   * Returns the first element with ID or name name from the 
   * collection.
   */
  [key: string]: any

  /**
   * Implements a proxy get trap to provide array-like access.
   */
  get(target: HTMLCollection, key: string | symbol, receiver: any): Element | null {
    if (typeof key === 'string' && HTMLCollection.reservedNames.indexOf(key) === -1) {
      const index = Number(key)
      if (isNaN(Number(index)))
        return target.namedItem(key)
      else
        return target.item(index)
    } else {
      return Reflect.get(target, key, receiver)
    }
  }
}
