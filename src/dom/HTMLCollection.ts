import { Element } from "./Element"
import { Node } from "./Node"

/**
 * Represents a collection of elements.
 */
export class HTMLCollection implements IterableIterator<Element> {

  protected _parent: Node
  protected _filter: (element: Element) => any
  private _currentIterationNode: Node | null = null

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
  [Symbol.iterator](): IterableIterator<Element> {
    this._currentIterationNode = this._parent.firstChild
    return this
  }

  /**
   * Iterates through child nodes.
   */
  next(): IteratorResult<Element> {
    let ele = this._currentIterationNode
    if (this._currentIterationNode) {
      while (ele && (ele.nodeType !== Node.Element || !this._filter(<Element>ele))) {
        this._currentIterationNode = this._currentIterationNode.nextSibling
        ele = this._currentIterationNode
      }
      if (ele)
        return { done: false, value: <Element>ele }
      else
        return { done: true } as any as IteratorResult<Element>
    } else {
      return { done: true } as any as IteratorResult<Element>
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

