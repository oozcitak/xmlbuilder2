import { Node } from "../interfaces";

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
   * @param child - child node to insert node before
   */
  static insert(node: Node, parent: Node, child: Node | null): void {
    // an ordered set cannot contain duplicates
    for (let child of parent.childNodes) {
      if (node === child)
        return
    }

    const nodeImpl = <any>node
    nodeImpl._parentNode = parent

    const parentImpl = <any>parent
    const childImpl = <any>parent.childNodes
    if (!parentImpl.firstChild) {
      nodeImpl._previousSibling = null
      nodeImpl._nextSibling = null

      parentImpl._firstChild = nodeImpl
      parentImpl._lastChild = nodeImpl
      childImpl._length = 1
    } else {
      const prev = (child ? child.previousSibling : parentImpl.lastChild)
      const next = (child ? child : null)

      nodeImpl._previousSibling = prev
      nodeImpl._nextSibling = next

      if (prev) (<any>prev)._nextSibling = nodeImpl
      if (next) (<any>next)._previousSibling = nodeImpl

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
    const nodeImpl = <any>node
    nodeImpl._parentNode = null

    const prev = <any>(nodeImpl.previousSibling)
    const next = <any>(nodeImpl.nextSibling)

    nodeImpl._previousSibling = null
    nodeImpl._nextSibling = null

    if (prev) prev._nextSibling = next
    if (next) next._previousSibling = prev

    const parentImpl = <any>parent
    if (!prev) parentImpl._firstChild = next
    if (!next) parentImpl._lastChild = prev

    const childImpl = <any>(parentImpl.childNodes)
    childImpl._length--
  }
}