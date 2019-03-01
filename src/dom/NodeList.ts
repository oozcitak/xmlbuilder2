import { Node } from "./Node"

/**
 * Represents an ordered list of nodes.
 */
export class NodeList implements IterableIterator<Node> {

  _length = 0 // internal
  protected _parentNode: Node
  private _currentIterationNode: Node | null = null

  /**
   * Initializes a new instance of `NodeList`.
   */
  constructor(parentNode: Node) {
    this._parentNode = parentNode
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
      let node = this._parentNode.firstChild
      while (node !== null && i !== index) {
        node = node.nextSibling
        i++
      }
      return node
    }
    else {
      let i = this.length - 1
      let node = this._parentNode.lastChild
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
  keys(): IterableIterator<number> {
    return {
      _index: 0,
      _node: this._parentNode.firstChild,

      next(): IteratorResult<number> {
        if (this._node ) {
          this._node = this._node.nextSibling
          let item = this._index
          this._index++
          return { value: item, done: false }
        } else {
          return { done: true } as any as IteratorResult<number>
        }
      }
    } as any as IterableIterator<number>
  }

  /**
   * Returns an iterator for nodes.
   */
  values(): IterableIterator<Node> {
    return {
      _node: this._parentNode.firstChild,

      next(): IteratorResult<Node> {
        if (this._node) {
          let item = this._node
          this._node = this._node.nextSibling
          return { value: item, done: false }
        } else {
          return { done: true }as any as IteratorResult<Node>
        }
      }
    } as any as IterableIterator<Node>
  }

  /**
   * Returns an iterator for indices and nodes.
   */
  entries(): IterableIterator<[number, Node]> {
    return {
      _index: 0,
      _node: this._parentNode.firstChild,

      next(): IteratorResult<[number, Node]> {
        if (this._node) {
          let item = [this._index, this._node]
          this._index++
          this._node = this._node.nextSibling
          return { value: item, done: false } as any as IteratorResult<[number, Node]>
        } else {
          return { done: true } as any as IteratorResult<[number, Node]>
        }
      }
    } as any as IterableIterator<[number, Node]>
  }

  /**
   * Returns an iterator for the node list.
   */
  [Symbol.iterator](): IterableIterator<Node> {
    this._currentIterationNode = this._parentNode.firstChild
    return this
  }

  /**
   * Iterates through child nodes.
   */
  next(): IteratorResult<Node> {
    if (this._currentIterationNode) {
      let node = this._currentIterationNode
      this._currentIterationNode = this._currentIterationNode.nextSibling
      return { done: false, value: node }
    } else {
      return { done: true, value: null } as any as IteratorResult<Node>
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
    for (let item of this.entries()) {
      callback.call(thisArg, item[1], item[0], this)
    }
  }
}