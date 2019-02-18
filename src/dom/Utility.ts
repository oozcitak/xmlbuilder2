import { Node } from './Node'

export class Utility {
  /**
   * Applies the given function to all descendant nodes of the given
   * node.
   * 
   * @param node - the node whose descendants will be traversed
   * @param func - the function to apply to the descendant nodes. The
   * function receives each descendant node as an argument and should
   * return a truthy value to stop iteration, or falsey value to
   * continue with the next descendant.
   * 
   * @returns the value returned from `func`
   */
  static forEachDescendant(node: Node, func: (node: Node) => any): any {
    for (let child of node.childNodes) {
      let res = func(child)
      if (res) {
        return res
      } else {
        let res = Utility.forEachDescendant(child, func)
        if (res) return res
      }
    }
  }

  /**
   * Determines whether `other` is a descendant of `node`.
   * 
   * @param node - a node
   * @param other - the node to check
   */
  static isDescendantOf(node: Node, other: Node): boolean {
    for (let child of node.childNodes) {
      if (child === other) return true
      if (Utility.isDescendantOf(child, other)) return true
    }

    return false
  }

  /**
   * Determines whether `other` is an ancestor of `node`.
   * 
   * @param node - a node
   * @param other - the node to check
   */
  static isAncestorOf(node: Node, other: Node): boolean {
    return Utility.isDescendantOf(other, node)
  }

  /**
   * Returns the zero-based index of `node` when counted preorder in
   * the tree rooted at `root`. Returns `-1` if `node` is not in 
   * the tree.
   * 
   * @param root - the root node of the tree
   * @param node - the node to get the index of
   */
  static treePosition(root: Node | null, node: Node): number {
    if (root === null) return -1

    let pos = 0
    let found = false

    Utility.forEachDescendant(root, function (childNode) {
      pos++
      if (!found && (childNode === node)) found = true
    })

    if (found)
      return pos
    else
      return -1
  }

  /**
   * Determines whether `other` is preceding `node`. An object A is 
   * preceding an object B if A and B are in the same tree and A comes 
   * before B in tree order.
   * 
   * @param node - a node
   * @param other - the node to check
   */
  static isPreceding(node: Node, other: Node): boolean {
    let nodePos = Utility.treePosition(node.ownerDocument, node)
    let otherPos = Utility.treePosition(other.ownerDocument, other)

    if (nodePos === -1 || otherPos === -1)
      return false
    else
      return otherPos < nodePos
  }

  /**
   * Determines whether `other` is following `node`. An object A is 
   * following an object B if A and B are in the same tree and A comes 
   * after B in tree order.
   * 
   * @param node - a node
   * @param other - the node to check
   */
  static isFollowing(node: Node, other: Node): boolean {
    let nodePos = Utility.treePosition(node.ownerDocument, node)
    let otherPos = Utility.treePosition(other.ownerDocument, other)

    if (nodePos === -1 || otherPos === -1)
      return false
    else
      return otherPos > nodePos
  }
}