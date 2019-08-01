import {
  NodeIterator, TreeWalker, Node, FilterResult
} from "../interfaces"
import { DOMException } from "../DOMException"
import { TreeQuery } from "./TreeQuery"

/**
 * Includes methods for tree traversal.
 */
export class Traverse {
  /**
   * Applies the filter to the given node and returns the result.
   * 
   * @param traverser - the `NodeIterator` or `TreeWalker` instance
   * @param node - the node to filter
   */
  static filterNode(traverser: NodeIterator | TreeWalker, node: Node): FilterResult {
    if (traverser._activeFlag) {
      throw DOMException.InvalidStateError
    }

    const n = node.nodeType - 1
    const mask = 1 << n
    if ((traverser.whatToShow & mask) === 0) {
      return FilterResult.Skip
    }
    if (!traverser.filter) {
      return FilterResult.Accept
    }

    let result: FilterResult = FilterResult.Reject
    try {
      traverser._activeFlag = true
      result = traverser.filter.acceptNode(node)
    } catch (err) {
      traverser._activeFlag = false
      throw err
    } finally {
      traverser._activeFlag = false
    }

    return result
  }

  /**
   * Returns the next or previous node in the subtree, or `null` if 
   * there are none. Also returns the modified values for `referenceNode`
   * and `pointerBeforeReferenceNode`.
   * 
   * @param iterator - the `NodeIterator` instance
   * @param forward- `true` to return the next node, or `false` to 
   * return the previous node.
   */
  static traverse(iterator: NodeIterator, forward: boolean): [Node | null, Node, boolean] {
    let node = iterator.referenceNode
    let beforeNode = iterator.pointerBeforeReferenceNode

    while (true) {
      if (forward) {
        if (!beforeNode) {
          // set node to the first node following node in iterator's
          // iterator collection. If there is no such node, then return null.
          const nextNode = TreeQuery.getFollowingNode(iterator.root, node)
          if (nextNode) {
            node = nextNode
          } else {
            return [null, iterator.referenceNode, false]
          }
        } else {
          beforeNode = false
        }
      } else {
        if (beforeNode) {
          // set node to the first node preceding node in iterator's
          // iterator collection. If there is no such node, then return null.
          const prevNode = TreeQuery.getPrecedingNode(iterator.root, node)
          if (prevNode) {
            node = prevNode
          } else {
            return [null, iterator.referenceNode, true]
          }
        } else {
          beforeNode = true
        }
      }

      // apply filter
      const result = Traverse.filterNode(iterator, node)
      if (result === FilterResult.Accept) {
        break
      }
    }

    return [node, node, beforeNode]
  }

  /**
   * Adjusts the iterator for removal of a node from its tree. Also
   * returns the modified values for `referenceNode` and 
   * `pointerBeforeReferenceNode`.
   * 
   * @param iterator - the `NodeIterator` instance
   * @param toBeRemovedNode- node to remove
   */
  static preRemove(iterator: NodeIterator, toBeRemovedNode: Node): [Node, boolean] {
    if (!TreeQuery.isAncestorOf(iterator.referenceNode, toBeRemovedNode, true) ||
      toBeRemovedNode === iterator.root) {
      return [iterator.referenceNode, iterator.pointerBeforeReferenceNode]
    }

    if (iterator.pointerBeforeReferenceNode) {
      while (true) {
        const nextNode = TreeQuery.getFollowingNode(iterator.root, toBeRemovedNode)
        if (!nextNode) {
          return [iterator.referenceNode, false]
        } else if (TreeQuery.isDescendantOf(iterator.root, nextNode, true) &&
          !TreeQuery.isDescendantOf(toBeRemovedNode, nextNode, true)) {
          return [nextNode, iterator.pointerBeforeReferenceNode]
        }
      }
    }

    const prevSibling = toBeRemovedNode.previousSibling
    if (prevSibling) {
      let referenceNode = prevSibling
      for (const node of TreeQuery.getDescendantNodes(prevSibling, true)) {
        referenceNode = node
      }
      return [referenceNode, iterator.pointerBeforeReferenceNode]
    } else {
      if (toBeRemovedNode.parentNode) {
        return [toBeRemovedNode.parentNode, iterator.pointerBeforeReferenceNode]
      } else {
        throw DOMException.InvalidStateError
      }
    }
  }

  /**
   * Returns the first or last child node, or `null` if there are none.
   * Also returns the modified value for `currentNode`.
   * 
   * @param walker - the `TreeWalker` instance
   * @param first - `true` to return the first child node, or `false` to 
   * return the last child node.
   */
  static traverseChildren(walker: TreeWalker, first: boolean): [Node | null, Node] {
    let node: Node | null = walker.currentNode
    node = (first ? node.firstChild : node.lastChild)
    while (node) {
      const result = Traverse.filterNode(walker, node)
      if (result === FilterResult.Accept) {
        return [node, node]
      } else if (result === FilterResult.Skip) {
        const child = (first ? node.firstChild : node.lastChild)
        if (child) {
          node = child
          continue
        }
      }

      while (node) {
        const sibling = (first ? node.nextSibling : node.previousSibling)
        if (sibling) {
          node = sibling
          break
        }
        const parent: Node | null = node.parentNode
        if (!parent || parent === walker.root || parent === walker.currentNode) {
          return [null, walker.currentNode]
        }
        node = parent
      }
    }

    return [null, walker.currentNode]
  }

  /**
   * Returns the next or previous sibling node, or `null` if there are none.
   * Also returns the modified value for `currentNode`.
   * 
   * @param walker - the `TreeWalker` instance
   * @param next - `true` to return the next sibling node, or `false` to 
   * return the previous sibling node.
   */
  static traverseSiblings(walker: TreeWalker, next: boolean): [Node | null, Node] {
    let node: Node | null = walker.currentNode
    if (node === walker.root) {
      return [null, walker.currentNode]
    }

    while (true) {
      let sibling: Node | null = (next ? node.nextSibling : node.previousSibling)
      while (sibling) {
        node = sibling
        const result = Traverse.filterNode(walker, node)
        if (result === FilterResult.Accept) {
          return [node, node]
        }
        sibling = (next ? node.firstChild : node.lastChild)
        if (result === FilterResult.Reject || !sibling) {
          sibling = (next ? node.nextSibling : node.previousSibling)
        }
      }

      node = node.parentNode
      if (!node || node === walker.root) {
        return [null, walker.currentNode]
      }

      if (Traverse.filterNode(walker, node) === FilterResult.Accept) {
        return [null, walker.currentNode]
      }
    }
  }
}