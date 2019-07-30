import { Node, BoundaryPosition, BoundaryPoint } from '../interfaces'
import { TreeQuery } from './TreeQuery'

/**
 * Includes common methods for boundary points.
 */
export class BPUtil {

  /**
   * Defines the position of a boundary point relative to another.
   * 
   * @param bp - a boundary point
   * @param relativeTo - a boundary point to compare to
   */
  static position(bp: BoundaryPoint, relativeTo: BoundaryPoint): BoundaryPosition {

    const nodeA = bp[0]
    const offsetA = bp[1]
    const nodeB = relativeTo[0]
    const offsetB = relativeTo[1]

    if (TreeQuery.rootNode(nodeA) !== TreeQuery.rootNode(nodeB)) {
      throw new Error("Boundary points must share the same root node.")
    }

    if (nodeA.isSameNode(nodeB)) {
      if (offsetA === offsetB) {
        return BoundaryPosition.Equal
      } else if (offsetA < offsetB) {
        return BoundaryPosition.Before
      } else {
        return BoundaryPosition.After        
      }
    }

    if (TreeQuery.isFollowing(nodeB, nodeA)) {
      if (BPUtil.position(relativeTo, bp) === BoundaryPosition.Before) {
        return BoundaryPosition.After
      } else {
        return BoundaryPosition.Before
      }
    }

    if (TreeQuery.isAncestorOf(nodeB, nodeA)) {
      let child = nodeB

      while (!TreeQuery.isChildOf(nodeA, child)) {
        if (child.parentNode === null) {
          throw new Error("Node has no parent node.")
        } else {
          child = child.parentNode
        }
      }

      if (TreeQuery.index(child) < offsetA) {
        return BoundaryPosition.After
      }
    }

    return BoundaryPosition.Before
  }

  /**
   * Returns the boundary point for the start of a node.
   * 
   * @param node - a node
   */
  static nodeStart(node: Node): BoundaryPoint {
    return [node, 0]
  }

  /**
   * Returns the boundary point for the end of a node.
   * 
   * @param node - a node
   */
  static nodeEnd(node: Node): BoundaryPoint {
    return [node, TreeQuery.nodeLength(node)]
  }
}
