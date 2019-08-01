import { Node } from "../interfaces"
import { NodeInternal, NodeListInternal } from "../interfacesInternal"

/**
 * Contains methods for manipulating a {@link NodeList}.
 */
export class List {
  /**
   * Appends a node into a parent node.
   * 
   * @param node - node to insert
   * @param parent - parent node to receive node
   */
  static append(node: Node, parent: Node): void {
    List.insert(node, parent, null)
  }

  /**
   * Inserts a node into a parent node before the given child node.
   * 
   * @param node - node to insert
   * @param parent - parent node to receive node
   * @param refChild - child node to insert node before
   */
  static insert(node: Node, parent: Node, refChild: Node | null): void {
    // an ordered set cannot contain duplicates
    for (const childNode of parent.childNodes) {
      if (node === childNode)
        return
    }

    const nodeImpl = node as NodeInternal
    nodeImpl._parentNode = parent

    const parentImpl = parent as NodeInternal
    const childImpl = parent.childNodes as NodeListInternal
    if (!parentImpl.firstChild) {
      nodeImpl._previousSibling = null
      nodeImpl._nextSibling = null

      parentImpl._firstChild = nodeImpl
      parentImpl._lastChild = nodeImpl
      childImpl._length = 1
    } else {
      const prev = (refChild ? refChild.previousSibling : parentImpl.lastChild) as NodeInternal | null
      const next = (refChild ? refChild : null) as NodeInternal | null

      nodeImpl._previousSibling = prev
      nodeImpl._nextSibling = next

      if (prev) prev._nextSibling = nodeImpl
      if (next) next._previousSibling = nodeImpl

      if (!prev) parentImpl._firstChild = nodeImpl
      if (!next) parentImpl._lastChild = nodeImpl
      childImpl._length++
    }
  }

  /**
   * Removes a child node from its parent.
   * 
   * @param node - node to remove
   * @param parent - parent node
   */
  static remove(node: Node, parent: Node): void {
    const nodeImpl = node as NodeInternal
    nodeImpl._parentNode = null

    const prev = nodeImpl.previousSibling as NodeInternal | null
    const next = nodeImpl.nextSibling as NodeInternal | null

    nodeImpl._previousSibling = null
    nodeImpl._nextSibling = null

    if (prev) prev._nextSibling = next
    if (next) next._previousSibling = prev

    const parentImpl = parent as NodeInternal
    if (!prev) parentImpl._firstChild = next
    if (!next) parentImpl._lastChild = prev

    const childImpl = parentImpl.childNodes as NodeListInternal
    childImpl._length--
  }
}