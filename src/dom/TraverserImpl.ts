import {
  Node, NodeFilter, WhatToShow, FilterResult
} from "./interfaces"
import { NodeFilterImpl } from "./NodeFilterImpl"
import { TraverserInternal } from "./interfacesInternal"

/**
 * Represents an object which can be used to iterate through the nodes
 * of a subtree.
 */
export abstract class TraverserImpl implements TraverserInternal {

  _activeFlag: boolean
  _root: Node
  _whatToShow: WhatToShow
  _filter: NodeFilter | null

  /**
   * Initializes a new instance of `TraverserImpl`.
   * 
   * @param root - the node to which the iterator is attached.
   * @param whatToShow - a filter on node type.
   * @param filter - a user defined filter.
   */
  constructor(root: Node, whatToShow: WhatToShow, filter: NodeFilter |
    ((node: Node) => FilterResult) | null) {
    this._activeFlag = false
    this._root = root
    this._whatToShow = whatToShow
    if (filter instanceof Function) {
      this._filter = new NodeFilterImpl(filter)
    } else {
      this._filter = filter
    }
  }

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
