import { Element } from "./Element"
import { NodeList } from "./NodeList"
import { Node } from "./Node"

/**
 * Represents a collection of elements.
 */
export class HTMLCollection {

  protected _nodes: NodeList

  /**
   * Initializes a new instance of `HTMLCollection`.
   *
   * @param nodes - the associated {@link NodeList}.
   */
  public constructor(nodes: NodeList) {
    this._nodes = nodes
  }

  /** 
   * Returns the number of elements in the collection.
   */
  get length(): number {
    let count = 0
    let node: Node
    for (node of this._nodes) {
      if (node.nodeType === Node.Element) {
          count++
      }
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
    let node: Node
    for (node of this._nodes) {
      if (node.nodeType === Node.Element) {
        if (i === index)
          return <Element>node
        else
          i++
      }
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
    let node: Node
    for (node of this._nodes) {
      if (node.nodeType === Node.Element) {
        let ele = <Element>node
        if (ele.id === name)
          return ele
        if (ele.getAttribute('name') === name)
          return ele
      }
    }

    return null
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