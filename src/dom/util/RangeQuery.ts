import { Node, Range, BoundaryPosition } from '../interfaces'
import { TreeQuery } from './TreeQuery'
import { BoundaryPoint } from './BoundaryPoint';

/**
 * Includes methods to query ranges.
 */
export class RangeQuery {

  /**
   * Gets the root node of a range.
   * 
   * @param range - a range
   */
  static root(range: Range): Node {
    return TreeQuery.rootNode(range.startContainer)
  }

  /**
   * Traverses through all contained nodes of a range.
   * 
   * @param range - a range
   */
  static *getContainedNodes(range: Range): IterableIterator<Node> {
    const root = RangeQuery.root(range)
    const container = range.commonAncestorContainer

    const rangeAsAny = <any><unknown>range
    const start: [Node, number] = rangeAsAny._start
    const end: [Node, number] = rangeAsAny._end

    for (const node of TreeQuery.getDescendantNodes(container)) {
      if (root === TreeQuery.rootNode(node)) {
        const nodeStart = BoundaryPoint.nodeStart(node)
        const nodeEnd = BoundaryPoint.nodeEnd(node)
        if (BoundaryPoint.position(nodeStart, start) === BoundaryPosition.After &&
          BoundaryPoint.position(nodeEnd, end) === BoundaryPosition.Before) {
          yield node
        }
      }
    }
  }

  /**
   * Determines whether the given node is contained in the range.
   * 
   * A node is contained in a live range if node's root is range's 
   * root, and (node, 0) is after range's start, and (node, node's length)
   * is before range's end.
   * 
   * @param range - a range
   * @param node - the node to check
   */
  static isContained(range: Range, node: Node): boolean {
    const root = RangeQuery.root(range)

    const rangeAsAny = <any><unknown>range
    const start: [Node, number] = rangeAsAny._start
    const end: [Node, number] = rangeAsAny._end

    if (root === TreeQuery.rootNode(node)) {
      const nodeStart = BoundaryPoint.nodeStart(node)
      const nodeEnd = BoundaryPoint.nodeEnd(node)
      if (BoundaryPoint.position(nodeStart, start) === BoundaryPosition.After &&
        BoundaryPoint.position(nodeEnd, end) === BoundaryPosition.Before) {
        return true
      }
    }

    return false
  }
}
