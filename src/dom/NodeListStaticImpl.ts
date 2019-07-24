import { Node, NodeList } from "./interfaces"

/**
 * Represents an ordered list of nodes.
 * This is a static implementation of `NodeList`.
 */
export class NodeListStaticImpl implements NodeList {

  _items: Node[] = []

  /**
   * Initializes a new instance of `NodeList`.
   */
  constructor(items: Node[]) {
    this._items = items
  }

  /**
   * Returns the number of nodes in the list.
   */
  get length(): number {
    return this._items.length
  }

  /** 
   * Returns the node with index `index` from the collection.
   * 
   * @param index - the zero-based index of the node to return
   */
  item(index: number): Node | null {
    if (index < 0 || index > this.length - 1) return null

    return this._items[index]
  }

  /**
   * Returns an iterator for the node list.
   */
  *[Symbol.iterator](): IterableIterator<Node> {
    for (const node of this._items) {
      yield node
    }
  }
}