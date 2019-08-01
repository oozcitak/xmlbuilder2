import { Node, NodeList } from "./interfaces"
import { NodeListInternal } from "./interfacesInternal"

/**
 * Represents an ordered list of nodes.
 */
export class NodeListImpl implements NodeListInternal {

  _live: boolean = true
  _root: Node
  _filter: ((node: Node) => any)
  _length = 0

  /**
   * Initializes a new instance of `NodeList`.
   * 
   * @param root - root node
   */
  constructor(root: Node) {
    this._root = root
    this._filter = function (node: Node) { return true }
  }

  /**
   * Returns the number of nodes in the list.
   */
  get length(): number {
    return this._length
  }

  /** 
   * Returns the node with index `index` from the collection.
   * 
   * @param index - the zero-based index of the node to return
   */
  item(index: number): Node | null {
    if (index < 0 || index > this.length - 1) return null

    if (index < this.length / 2) {
      let i = 0
      let node = this._root.firstChild
      while (node !== null && i !== index) {
        node = node.nextSibling
        i++
      }
      return node
    }
    else {
      let i = this.length - 1
      let node = this._root.lastChild
      while (node !== null && i !== index) {
        node = node.previousSibling
        i--
      }
      return node
    }
  }

  /**
   * Returns an iterator for node indices.
   */
  *keys(): IterableIterator<number> {
    let index = 0
    for (const child of this) {
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
    for (const child of this) {
      yield [index++, child]
    }
  }

  /**
   * Returns an iterator for the node list.
   */
  *[Symbol.iterator](): IterableIterator<Node> {
    let child = this._root.firstChild
    while (child) {
      yield child
      child = child.nextSibling
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