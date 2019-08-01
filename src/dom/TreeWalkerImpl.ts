import { Node, NodeFilter, WhatToShow, FilterResult } from "./interfaces"
import { TraverserImpl } from "./TraverserImpl"
import { Traverse } from "./util/Traverse"
import { TreeWalkerInternal } from "./interfacesInternal"

/**
 * Represents the nodes of a subtree and a position within them.
 */
export class TreeWalkerImpl extends TraverserImpl implements TreeWalkerInternal {

  _current: Node

  /**
   * Initializes a new instance of `TreeWalker`.
   * 
   * @param root - the node to which the iterator is attached.
   * @param whatToShow - a filter on node type.
   * @param filter - a user defined filter.
   */
  constructor(root: Node, whatToShow: WhatToShow, filter: NodeFilter |
    ((node: Node) => FilterResult) | null) {
    super(root, whatToShow, filter)

    this._current = root
  }

  /**
   * Gets or sets the node to which the iterator is pointing at.
   */
  get currentNode(): Node { return this._current }
  set currentNode(value: Node) { this._current = value }

  /**
   * Moves the iterator to the first parent node of current node, and
   * returns it. Returns `null` if no such node exists.
   */
  parentNode(): Node | null {
    let node: Node | null = this._current
    while (node && node !== this.root) {
      node = node.parentNode
      if (node && Traverse.filterNode(this, node) === FilterResult.Accept) {
        this._current = node
        return node
      }
    }

    return null
  }

  /**
   * Moves the iterator to the first child node of current node, and
   * returns it. Returns `null` if no such node exists.
   */
  firstChild(): Node | null {
    const [node, current] = Traverse.traverseChildren(this, true)
    this._current = current
    return node
  }

  /**
   * Moves the iterator to the last child node of current node, and
   * returns it. Returns `null` if no such node exists.
   */
  lastChild(): Node | null {
    const [node, current] = Traverse.traverseChildren(this, false)
    this._current = current
    return node
  }

  /**
   * Moves the iterator to the next sibling of current node, and
   * returns it. Returns `null` if no such node exists.
   */
  nextSibling(): Node | null {
    const [node, current] = Traverse.traverseSiblings(this, true)
    this._current = current
    return node
  }

  /**
   * Moves the iterator to the previous sibling of current node, and
   * returns it. Returns `null` if no such node exists.
   */
  previousSibling(): Node | null {
    const [node, current] = Traverse.traverseSiblings(this, false)
    this._current = current
    return node
  }

  /**
   * Returns the next node in the subtree, or `null` if there are none.
   */
  nextNode(): Node | null {
    let node: Node | null = this._current
    let result = FilterResult.Accept

    while (true) {
      while (result !== FilterResult.Reject && node.firstChild) {
        node = node.firstChild
        result = Traverse.filterNode(this, node)
        if (result === FilterResult.Accept) {
          this._current = node
          return node
        }
      }

      let sibling: Node | null = null
      let temporary: Node | null = node
      while (temporary) {
        if (temporary === this.root) {
          return null
        }
        sibling = temporary.nextSibling
        if (sibling) {
          node = sibling
          break
        }
        temporary = temporary.parentNode
      }

      result = Traverse.filterNode(this, node)
      if (result === FilterResult.Accept) {
        this._current = node
        return node
      }
    }
  }

  /**
   * Returns the previous node in the subtree, or `null` if there
   * are none.
   */
  previousNode(): Node | null {
    let node: Node | null = this._current

    while (node !== this.root) {
      let sibling: Node | null = node.previousSibling
      while (sibling) {
        node = sibling
        let result = Traverse.filterNode(this, node)
        while (result !== FilterResult.Reject && node.lastChild) {
          node = node.lastChild
          result = Traverse.filterNode(this, node)
        }

        if (result === FilterResult.Accept) {
          this._current = node
          return node
        }

        sibling = node.previousSibling
      }

      if (node === this.root || !node.parentNode) {
        return null
      }

      node = node.parentNode

      if (Traverse.filterNode(this, node) === FilterResult.Accept) {
        this._current = node
        return node
      }
    }

    return null
  }

}
