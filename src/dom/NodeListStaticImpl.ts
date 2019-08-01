import { Node, NodeList } from "./interfaces"
import { NodeListInternal } from "./interfacesInternal"

/**
 * Represents an ordered list of nodes.
 * This is a static implementation of `NodeList`.
 */
export class NodeListStaticImpl implements NodeListInternal {

  _live: boolean = false
  _root: Node
  _filter: ((element: Node) => any)
  _items: Node[] = []
  _length = 0

  /**
   * Initializes a new instance of `NodeList`.
   */
  constructor(items: Node[]) {
    this._items = items
    this._root = <Node><unknown>undefined
    this._filter = function (node: Node) { return true }
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
   * Returns an iterator for node indices.
   */
  *keys(): IterableIterator<number> {
    for (let index = 0; index < this._items.length; index++) {
      yield index++
    }
  }

  /**
   * Returns an iterator for nodes.
   */
  *values(): IterableIterator<Node> {
    yield* this
  }

  /**
   * Returns an iterator for indices and nodes.
   */
  *entries(): IterableIterator<[number, Node]> {
    let index = 0
    for (const child of this._items) {
      yield [index++, child]
    }
  }

  /**
   * Returns an iterator for the node list.
   */
  *[Symbol.iterator](): IterableIterator<Node> {
    for (const node of this._items) {
      yield node
    }
  }

  /**
   * Calls the callback function for each node in the list. The callback
   * receives arguments as follows:
   *   - the current node
   *   - index of the current node
   *   - the node list object
   * 
   * @param callback - function to execute for each node 
   * @param thisArg - value to use as `this` when executing callback 
   */
  forEach(callback: (node: Node, index: number, list: NodeList) => any,
    thisArg: any): void {
    for (const [index, node] of this.entries()) {
      callback.call(thisArg, node, index, this)
    }
  }
}