import { Node, NodeFilter, WhatToShow, FilterResult } from "./interfaces"
import { TraverserImpl } from "./TraverserImpl"
import { Traverse } from "./util/Traverse"
import { NodeIteratorInternal, CollectionInternal } from "./interfacesInternal"
import { NodeListImpl } from ".";

/**
 * Represents an object which can be used to iterate through the nodes
 * of a subtree.
 */
export class NodeIteratorImpl extends TraverserImpl implements NodeIteratorInternal {

  _iteratorCollection: CollectionInternal
  _reference: Node
  _pointerBeforeReference: boolean

  /**
   * Initializes a new instance of `NodeIterator`.
   * 
   * @param root - the node to which the iterator is attached.
   * @param whatToShow - a filter on node type.
   * @param filter - a user defined filter.
   */
  constructor(root: Node, whatToShow: WhatToShow, filter: NodeFilter | 
    ((node: Node) => FilterResult) | null) {
    super(root, whatToShow, filter)

    this._iteratorCollection = new NodeListImpl(root)
    this._reference = root
    this._pointerBeforeReference = true
  }

  /**
   * Gets the node current nofe of the.
   */
  get referenceNode(): Node { return this._reference }

  /**
   * Gets a flag that indicates whether the iterator is before
   * or after  the reference node. If is `true`, the iterator is 
   * before the node, otherwise it is after the node.
   */
  get pointerBeforeReferenceNode(): boolean { return this._pointerBeforeReference }

  /**
   * Returns the next node in the subtree, or `null` if there are none.
   */
  nextNode(): Node | null {
    const [node, ref, beforeNode] = Traverse.traverse(this, true)
    this._reference = ref
    this._pointerBeforeReference = beforeNode
    return node
  }

  /**
   * Returns the previous node in the subtree, or `null` if there
   * are none.
   */
  previousNode(): Node | null {
    const [node, ref, beforeNode] = Traverse.traverse(this, false)
    this._reference = ref
    this._pointerBeforeReference = beforeNode
    return node
  }

  /**
   * This method is a no-op and is not used.
   */
  detach(): void { }

}
