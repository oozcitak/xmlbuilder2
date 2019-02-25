import { Node } from "./Node"

/**
 * Represents an ordered list of nodes.
 */
export class NodeList {

  _length = 0
  _parentNode: Node

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
  keys(): any {
    let list = this

    return {
      _index: 0,

      next: function () {
        if (this._index < list.length) {
          let item = this._index
          this._index++
          return { value: item, done: false }
        } else {
          return { done: true }
        }
      }
    }
  }

  /**
   * Returns an iterator for nodes.
   */
  values(): any {
    let list = this

    return {
      _node: this._parentNode.firstChild,

      next: function () {
        if (this._node !== null) {
          let item = this._node
          this._node = this._node.nextSibling
          return { value: item, done: false }
        } else {
          return { done: true }
        }
      }
    }
  }

  /**
   * Returns an iterator for indices and nodes.
   */
  entries(): any {
    let list = this

    return {
      _index: 0,
      _node: this._parentNode.firstChild,

      next: function () {
        if (this._node !== null) {
          let item = [this._index, this._node]
          this._index++
          this._node = this._node.nextSibling
          return { value: item, done: false }
        } else {
          return { done: true }
        }
      }
    }
  }

  /**
   * Returns an iterator for the node list.
   */
  [Symbol.iterator]() {
    return this.values()
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
  forEach(callback: (node: string, index: number, list: NodeList) => any,
    thisArg: any): void {
    for (let item of this.entries()) {
      callback.call(thisArg, item[1], item[0], this)
    }
  }
}