import { Traverser, Node, NodeFilter, WhatToShow, FilterResult } from "./interfaces"
import { DOMException } from "./DOMException"

/**
 * Represents an object which can be used to iterate through the nodes
 * of a subtree.
 */
export abstract class TraverserImpl implements Traverser {
  private _root: Node
  private _whatToShow: WhatToShow
  private _filter: NodeFilter | null

  /**
   * Initializes a new instance of `TraverserImpl`.
   * 
   * @param root - the node to which the iterator is attached.
   * @param whatToShow - a filter on node type.
   * @param filter - a user defined filter.
   */
  constructor(root: Node, whatToShow: WhatToShow, filter: NodeFilter | null) {
    this.active = false
    this._root = root
    this._whatToShow = whatToShow
    this._filter = filter
  }

  /**
   * A flag to avoid recursive invocations.
   */
  active: boolean

  /**
   * Gets the root node of the subtree.
   */
  get root(): Node { return this._root }

  /**
   * Gets the node types to match
   */
  get whatToShow(): WhatToShow { return this._whatToShow }

  /**
   * Gets the filter used to selected the nodes.
   */
  get filter(): NodeFilter | null { return this._filter }

}
