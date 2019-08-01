import { Node, Element, HTMLCollection } from "./interfaces"
import { TreeQuery } from "./util/TreeQuery"
import { HTMLCollectionInternal } from "./interfacesInternal"

/**
 * Represents a collection of elements.
 */
export class HTMLCollectionImpl implements HTMLCollectionInternal {

  _live: boolean = true
  _root: Node
  _filter: ((element: Element) => any)

  protected static reservedNames = ['_root', '_live', '_filter', 'length',
    'item', 'namedItem', 'get']

  /**
   * Initializes a new instance of `HTMLCollection`.
   *
   * @param root - the root node
   * @param filter - a node filter
   */
  public constructor(root: Node, filter?: (element: Element) => any) {
    this._root = root

    this._filter = filter || function (element: Element) { return true }

    return new Proxy<HTMLCollectionImpl>(this, this)
  }

  /** 
   * Returns the number of elements in the collection.
   */
  get length(): number {
    let count = 0
    for (const node of this) {
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
    for (const node of this) {
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

    for (const node of this) {
      if (node.id === name || node.getAttribute('name') === name)
        return node
    }

    return null
  }

  /**
   * Returns an iterator for nodes.
   */
  *[Symbol.iterator](): IterableIterator<Element> {
    yield* TreeQuery.getDescendantElements(this._root, false, false,
      (ele) => { return !!this._filter(ele) })
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
    if (typeof key === 'string' && HTMLCollectionImpl.reservedNames.indexOf(key) === -1) {
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
