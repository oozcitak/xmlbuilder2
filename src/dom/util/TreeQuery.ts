import { Node, CharacterData, ShadowRoot, Element, NodeType } from '../interfaces'

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
  static *getDescendants<T>(node: Node, self: boolean = false,
    shadow: boolean = false, filter?: (childNode: Node) => any): IterableIterator<T> {

    if (self && (!filter || filter(node)))
      yield <T><unknown>node

    // traverse shadow tree
    if (shadow && node.nodeType === NodeType.Element) {
      let ele = <Element>node
      if (ele.shadowRoot) {
        let child = ele.shadowRoot.firstChild
        while (child) {
          yield* TreeQuery.getDescendants<T>(child, true, shadow, filter)
          child = child.nextSibling
        }
      }
    }

    // traverse child nodes
    let child = node.firstChild
    while (child) {
      yield* TreeQuery.getDescendants<T>(child, true, shadow, filter)
      child = child.nextSibling
    }
  }

  /**
   * Applies the given function to all descendant nodes of the given
   * node, optionaly including shadow trees. In tree order is 
   * preorder, depth-first traversal of a tree.
   * 
   * @param node - the node whose descendants will be traversed
   * @param options - an object to set traversal settings.
   * If `options.self` is truthy, traversal includes `node`
   * itself. If `options.shadow` is truthy, traversal includes the 
   * node's and its descendant's shadow trees as well.
   * @param func - the function to apply to the descendant nodes. The
   * function receives each descendant node as an argument and should
   * return a value to stop iteration, or `undefined` to continue 
   * with the next descendant.
   * 
   * @returns the value returned from `func` or `shadowFunc` whichever
   * returns a value first.
   */
  static forEachDescendant(node: Node,
    options: { self?: boolean, shadow?: boolean } = { self: false, shadow: false },
    func: (childNode: Node) => any): any {
    // apply to node itself
    if (options && options.self) {
      let res = func(node)
      if (res !== undefined)
        return res
    }

    // traverse shadow tree
    if (options && options.shadow && node.nodeType === NodeType.Element) {
      let ele = <Element>node
      if (ele.shadowRoot) {
        for (let child of ele.shadowRoot.childNodes) {
          let res = func(child)
          if (res !== undefined) {
            return res
          } else {
            let res = TreeQuery.forEachDescendant(child, options, func)
            if (res !== undefined) return res
          }
        }
      }
    }

    // traverse child nodes
    for (let child of node.childNodes) {
      let res = func(child)
      if (res !== undefined) {
        return res
      } else {
        let res = TreeQuery.forEachDescendant(child, options, func)
        if (res !== undefined) return res
      }
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
   *  - DocumentFragment
   *  - Element
   *    * Zero or more nodes each of which is Element, Text, 
   *      ProcessingInstruction, or Comment.
   *  - DocumentType
   *  - Text
   *  - ProcessingInstruction
   *  - Comment
   *    * None.
   * 
   * @param node - the root of the tree
   */
  static isConstrained(node: Node): boolean {
    switch (node.nodeType) {
      case NodeType.Document:
        let hasDocType = false
        let hasElement = false
        for (let childNode of node.childNodes) {
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
        for (let childNode of node.childNodes) {
          switch (childNode.nodeType) {
            case NodeType.Element:
            case NodeType.Text:
            case NodeType.ProcessingInstruction:
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
      case NodeType.Comment:
        return (!node.hasChildNodes())
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
   */
  static rootNode(node: Node): Node {
    if (!node.parentNode)
      return node
    else
      return TreeQuery.rootNode(node.parentNode)
  }

  /**
   * Determines whether `other` is a descendant of `node`. An object 
   * A is called a descendant of an object B, if either A is a child 
   * of B or A is a child of an object C that is a descendant of B.
   * 
   * @param node - a node
   * @param other - the node to check
   * @param options - an object to set traversal settings.
   * If `options.self` is truthy, traversal includes `node`
   * itself. If `options.shadow` is truthy, traversal includes the 
   * node's and its descendant's shadow trees as well.
   */
  static isDescendantOf(node: Node, other: Node,
    options: { self?: boolean, shadow?: boolean } = { self: false, shadow: false }
  ): boolean {

    if (options && options.self && node === other)
      return true

    for (let child of node.childNodes) {
      if (child === other)
        return true
      if (TreeQuery.isDescendantOf(child, other, options))
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
   * @param options - an object to set traversal settings.
   * If `options.self` is truthy, traversal includes `node`
   * itself. If `options.shadow` is truthy, traversal includes the 
   * node's and its descendant's shadow trees as well.
   */
  static isAncestorOf(node: Node, other: Node,
    options: { self?: boolean, shadow?: boolean } = { self: false, shadow: false }
  ): boolean {

    if (TreeQuery.isDescendantOf(other, node, options))
      return true

    if (options && options.shadow) {
      let root = TreeQuery.rootNode(node)
      if (root && (<ShadowRoot>root).host) {
        let nodeHost = (<ShadowRoot>root).host
        return TreeQuery.isAncestorOf(nodeHost, other, options)
      }
    }

    return false
  }

  /**
   * Determines whether `other` is a sibling of `node`. An object A is
   * called a sibling of an object B, if and only if B and A share 
   * the same non-null parent.
   * 
   * @param node - a node
   * @param other - the node to check
   * @param options - an object to set traversal settings.
   * If `options.self` is truthy, traversal includes `node`
   * itself. If `options.shadow` is truthy, traversal includes the 
   * node's and its descendant's shadow trees as well.
   */
  static isSiblingOf(node: Node, other: Node,
    options: { self?: boolean, shadow?: boolean } = { self: false, shadow: false }
  ): boolean {

    if (options && options.self && node === other)
      return true

    return (node.parentNode != null &&
      node.parentNode === other.parentNode)
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
    let nodePos = TreeQuery.treePosition(node)
    let otherPos = TreeQuery.treePosition(other)

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
    let nodePos = TreeQuery.treePosition(node)
    let otherPos = TreeQuery.treePosition(other)

    if (nodePos === -1 || otherPos === -1)
      return false
    else if (TreeQuery.rootNode(node) !== TreeQuery.rootNode(other))
      return false
    else
      return otherPos > nodePos
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
    let root = TreeQuery.rootNode(node)
    if (root === null) return -1

    let pos = 0
    let found = false

    TreeQuery.forEachDescendant(root, {}, function (childNode) {
      pos++
      if (!found && (childNode === node)) found = true
    })

    if (found)
      return pos
    else
      return -1
  }
}
