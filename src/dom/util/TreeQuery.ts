import {
  Node, CharacterData, ShadowRoot, Element, NodeType
} from '../interfaces'
import { Guard } from './Guard'
import { ElementInternal } from '../interfacesInternal'

/**
 * Includes query and traversal methods for trees.
 * A tree is a finite hierarchical tree structure.
 */
export class TreeQuery {

  /**
   * Traverses through all descendant nodes of the tree rooted at
   * `node` in depth-first preorder.
   * 
   * @param node - root node of the tree
   * @param self - whether to include `node` in traversal
   * @param shadow - whether to visit shadow tree nodes
   * @param filter - a function to filter nodes
   */
  static *getDescendantNodes(node: Node, self: boolean = false,
    shadow: boolean = false, filter?: (childNode: Node) => any): IterableIterator<Node> {

    if (self && (!filter || !!filter(node)))
      yield node

    // traverse shadow tree
    if (shadow && node.nodeType === NodeType.Element) {
      const ele = <Element>node
      if (ele.shadowRoot) {
        let child = ele.shadowRoot.firstChild
        while (child) {
          yield* TreeQuery.getDescendantNodes(child, true, shadow, filter)
          child = child.nextSibling
        }
      }
    }

    // traverse child nodes
    let child = node.firstChild
    while (child) {
      yield* TreeQuery.getDescendantNodes(child, true, shadow, filter)
      child = child.nextSibling
    }
  }

  /**
   * Traverses through all descendant element nodes of the tree rooted at
   * `node` in depth-first preorder.
   * 
   * @param node - root node of the tree
   * @param self - whether to include `node` in traversal
   * @param shadow - whether to visit shadow tree nodes
   * @param filter - a function to filter nodes
   */
  static *getDescendantElements(node: Node, self: boolean = false,
    shadow: boolean = false, filter?: (childNode: Element) => any): IterableIterator<Element> {

    for (const child of TreeQuery.getDescendantNodes(node, self, shadow,
      (node) => { return node.nodeType === NodeType.Element })) {
      const ele = child as ElementInternal
      if (!filter || !!filter(ele))
        yield ele
    }
  }

  /**
   * Traverses through all sibling nodes of `node`.
   * 
   * @param node - root node of the tree
   * @param self - whether to include `node` in traversal
   * @param filter - a function to filter nodes
   */
  static *getSiblingNodes(node: Node, self: boolean = false,
    filter?: (childNode: Node) => any): IterableIterator<Node> {

    if (node.parentNode) {
      let child = node.parentNode.firstChild
      while (child) {
        if (!filter || !!filter(child)) {
          if (child === node) {
            if (self) yield child
          } else {
            yield child
          }
        }
        child = child.nextSibling
      }
    }
  }

  /**
   * Traverses through all ancestor nodes `node` in reverse tree order.
   * 
   * @param node - root node of the tree
   * @param self - whether to include `node` in traversal
   * @param filter - a function to filter nodes
   */
  static *getAncestorNodes(node: Node, self: boolean = false,
    filter?: (ancestorNode: Node) => any): IterableIterator<Node> {

    if (self && (!filter || !!filter(node)))
      yield node

    let parent = node.parentNode
    while (parent !== null) {
      if (!filter || !!filter(node))
        yield node
      parent = parent.parentNode
    }
  }

  /**
   * Returns the node following `node` in depth-first preorder.
   * 
   * @param root - root of the subtree
   * @param node - a node
   */
  static getFollowingNode(root: Node, node: Node): Node | null {
    if (node.firstChild) {
      return node.firstChild
    } else if (node.nextSibling) {
      return node.nextSibling
    } else {
      while (true) {
        const parent: Node | null = node.parentNode
        if (!parent || parent === root) {
          return null
        } else if (parent.nextSibling) {
          return parent.nextSibling
        } else {
          node = parent
        }
      }
    }
  }

  /**
   * Returns the node preceding `node` in depth-first preorder.
   * 
   * @param root - root of the subtree
   * @param node - a node
   */
  static getPrecedingNode(root: Node, node: Node): Node | null {
    if (node === root) {
      return null
    }
    if (node.previousSibling) {
      node = node.previousSibling
      if (node.lastChild) {
        return node.lastChild
      } else {
        return node
      }
    } else {
      return node.parentNode
    }
  }

  /**
   * Determines if the node tree is constrained. A node tree is 
   * constrained as follows, expressed as a relationship between the 
   * type of node and its allowed children:
   *  - Document (In tree order)
   *    * Zero or more nodes each of which is ProcessingInstruction 
   *      or Comment.
   *    * Optionally one DocumentType node.
   *    * Zero or more nodes each of which is ProcessingInstruction
   *      or Comment.
   *    * Optionally one Element node.
   *    * Zero or more nodes each of which is ProcessingInstruction
   *      or Comment.
   *  - DocumentFragment, Element
   *    * Zero or more nodes each of which is Element, Text, 
   *      ProcessingInstruction, or Comment.
   *  - DocumentType, Text, ProcessingInstruction, Comment
   *    * None.
   * 
   * @param node - the root of the tree
   */
  static isConstrained(node: Node): boolean {
    switch (node.nodeType) {
      case NodeType.Document:
        let hasDocType = false
        let hasElement = false
        for (const childNode of node.childNodes) {
          switch (childNode.nodeType) {
            case NodeType.ProcessingInstruction:
            case NodeType.Comment:
              break
            case NodeType.DocumentType:
              if (hasDocType || hasElement) return false
              hasDocType = true
              break
            case NodeType.Element:
              if (hasElement) return false
              hasElement = true
              break
            default:
              return false
          }
        }
        break
      case NodeType.DocumentFragment:
      case NodeType.Element:
        for (const childNode of node.childNodes) {
          switch (childNode.nodeType) {
            case NodeType.Element:
            case NodeType.Text:
            case NodeType.ProcessingInstruction:
            case NodeType.CData:
            case NodeType.Comment:
              break
            default:
              return false
          }
        }
        break
      case NodeType.DocumentType:
      case NodeType.Text:
      case NodeType.ProcessingInstruction:
      case NodeType.CData:
      case NodeType.Comment:
        return (!node.hasChildNodes())
    }

    for (const childNode of node.childNodes) {
      // recursively check child nodes
      if (!TreeQuery.isConstrained(childNode))
        return false
    }
    return true
  }

  /**
   * Returns the length of a node.
   * 
   * @param node - a node to check
   */
  static nodeLength(node: Node): number {
    switch (node.nodeType) {
      case NodeType.DocumentType:
        return 0
      case NodeType.Text:
      case NodeType.ProcessingInstruction:
      case NodeType.Comment:
        return (<CharacterData>node).data.length
      default:
        return node.childNodes.length
    }
  }

  /**
   * Determines if a node is empty.
   * 
   * @param node - a node to check
   */
  static isEmpty(node: Node): boolean {
    return (TreeQuery.nodeLength(node) === 0)
  }

  /**
   * Returns the root node of a tree. The root of an object is itself,
   * if its parent is `null`, or else it is the root of its parent. 
   * The root of a tree is any object participating in that tree 
   * whose parent is `null`.
   * 
   * @param node - a node of the tree
   * @param shadow - `true` to return shadow-including root, otherwise 
   * `false`
   */
  static rootNode(node: Node, shadow = false): Node {
    if (shadow) {
      const root = TreeQuery.rootNode(node, false)
      const host = (<ShadowRoot>root).host
      if (host)
        return TreeQuery.rootNode(host, true)
      else
        return root
    } else {
      if (!node.parentNode)
        return node
      else
        return TreeQuery.rootNode(node.parentNode)
    }
  }

  /**
   * Determines whether `other` is a descendant of `node`. An object 
   * A is called a descendant of an object B, if either A is a child 
   * of B or A is a child of an object C that is a descendant of B.
   * 
   * @param node - a node
   * @param other - the node to check
   * @param self - if `true`, traversal includes `node` itself
   * @param shadow - if `true`, traversal includes the 
   * node's and its descendant's shadow trees as well.
   */
  static isDescendantOf(node: Node, other: Node,
    self: boolean = false, shadow: boolean = false): boolean {

    for (const child of TreeQuery.getDescendantNodes(node, self, shadow)) {
      if (child === other)
        return true
    }

    return false
  }

  /**
   * Determines whether `other` is an ancestor of `node`. An object A 
   * is called an ancestor of an object B if and only if B is a 
   * descendant of A.
   * 
   * @param node - a node
   * @param other - the node to check
   * @param self - if `true`, traversal includes `node` itself
   * @param shadow - if `true`, traversal includes the 
   * node's and its descendant's shadow trees as well.
   */
  static isAncestorOf(node: Node, other: Node,
    self: boolean = false, shadow: boolean = false): boolean {

    return TreeQuery.isDescendantOf(other, node, self, shadow)
  }

  /**
   * Determines whether `other` is a sibling of `node`. An object A is
   * called a sibling of an object B, if and only if B and A share 
   * the same non-null parent.
   * 
   * @param node - a node
   * @param other - the node to check
   * @param self - if `true`, traversal includes `node` itself
   */
  static isSiblingOf(node: Node, other: Node,
    self: boolean = false): boolean {

    if (node === other) {
      if (self) return true
    } else {
      return (!!node.parentNode &&
        node.parentNode === other.parentNode)
    }

    return false
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
    const nodePos = TreeQuery.treePosition(node)
    const otherPos = TreeQuery.treePosition(other)

    if (nodePos === -1 || otherPos === -1)
      return false
    else if (TreeQuery.rootNode(node) !== TreeQuery.rootNode(other))
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
    const nodePos = TreeQuery.treePosition(node)
    const otherPos = TreeQuery.treePosition(other)

    if (nodePos === -1 || otherPos === -1)
      return false
    else if (TreeQuery.rootNode(node) !== TreeQuery.rootNode(other))
      return false
    else
      return otherPos > nodePos
  }

  /**
   * Determines whether `other` is a child node of `node`.
   * 
   * @param node - a node
   * @param other - the node to check
   */
  static isChildOf(node: Node, other: Node): boolean {
    if (node.parentNode === null || other.parentNode === null) {
      return false
    }

    if (node.parentNode !== other.parentNode) {
      return false
    }

    for (const child of node.childNodes) {
      if (child === other)
        return true
    }

    return false
  }

  /**
   * Returns the first child node of `node` or null if it has no
   * children.
   * 
   * @param node 
   */
  static firstChild(node: Node): Node | null {
    return node.firstChild
  }

  /**
   * Returns the last child node of `node` or null if it has no
   * children.
   * 
   * @param node 
   */
  static lastChild(node: Node): Node | null {
    return node.lastChild
  }

  /**
   * Returns the zero-based index of `node` when counted preorder in
   * the tree rooted at `root`. Returns `-1` if `node` is not in 
   * the tree.
   * 
   * @param node - the node to get the index of
   */
  private static treePosition(node: Node): number {
    const root = TreeQuery.rootNode(node)

    let pos = 0
    for (const childNode of TreeQuery.getDescendantNodes(root)) {
      pos++
      if (childNode === node) return pos
    }

    return -1
  }

  /**
   * Determines the index of `node`. The index of an object is its number of 
   * preceding siblings, or 0 if it has none.
   * 
   * @param node - a node
   * @param other - the node to check
   */
  static index(node: Node): number {
    let n = 0

    while (node.previousSibling !== null) {
      n++
      node = node.previousSibling
    }

    return n
  }

  /**
   * Retargets an object against another object.
   * 
   * @param a - an object to retarget
   * @param b - an object to retarget against
   */
  static retarget(a: any, b: any): any {
    /**
     * To retarget an object A against an object B, repeat these steps until
     * they return an object:
     * 1. If one of the following is true
     * - A is not a node
     * - A's root is not a shadow root
     * - B is a node and A's root is a shadow-including inclusive ancestor
     * of B
     * then return A.
     * 2. Set A to A's root's host.
     */

    while (true) {
      if (!Guard.isNode(a)) {
        return a
      }

      const rootOfA = TreeQuery.rootNode(a)
      if (!Guard.isShadowRoot(rootOfA)) {
        return a
      }

      if (Guard.isNode(b) && TreeQuery.isAncestorOf(rootOfA, b, true, true)) {
        return a
      }

      a = rootOfA.host
    }
  }

}
