import { Node, ChildNode } from './interfaces'
import { Convert } from './util/Convert'
import { TreeMutation } from './util/TreeMutation'

/**
 * Represents a mixin that extends child nodes that can have siblings
 * including doctypes. This mixin is implemented by {@link Element},
 * {@link CharacterData} and {@link DocumentType}.
 */
export class ChildNodeImpl implements ChildNode {

  /**
   * Inserts nodes just before this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  before(...nodes: Array<Node | string>): void {
    const context = <Node><unknown>this

    const parent = context.parentNode
    if (!parent) return

    let viablePreviousSibling = context.previousSibling
    let flag = true
    while (flag && viablePreviousSibling) {
      flag = false
      for (const child of nodes) {
        if (child === viablePreviousSibling) {
          viablePreviousSibling = viablePreviousSibling.previousSibling
          flag = true
          break
        }
      }
    }

    if (context.ownerDocument) {
      const node = Convert.nodesIntoNode(nodes, context.ownerDocument)

      if (!viablePreviousSibling)
        viablePreviousSibling = parent.firstChild
      else
        viablePreviousSibling = viablePreviousSibling.nextSibling

      TreeMutation.preInsert(node, parent, viablePreviousSibling)
    }
  }

  /**
   * Inserts nodes just after this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  after(...nodes: Array<Node | string>): void {
    const context = <Node><unknown>this

    const parent = context.parentNode
    if (!parent) return

    let viableNextSibling = context.nextSibling
    let flag = true
    while (flag && viableNextSibling) {
      flag = false
      for (const child of nodes) {
        if (child === viableNextSibling) {
          viableNextSibling = viableNextSibling.nextSibling
          flag = true
          break
        }
      }
    }

    if (context.ownerDocument) {
      const node = Convert.nodesIntoNode(nodes, context.ownerDocument)

      TreeMutation.preInsert(node, parent, viableNextSibling)
    }
  }

  /**
   * Replaces nodes with this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  replaceWith(...nodes: Array<Node | string>): void {
    const context = <Node><unknown>this

    const parent = context.parentNode
    if (!parent) return

    let viableNextSibling = context.nextSibling
    let flag = true
    while (flag && viableNextSibling) {
      flag = false
      for (const child of nodes) {
        if (child === viableNextSibling) {
          viableNextSibling = viableNextSibling.nextSibling
          flag = true
          break
        }
      }
    }

    if (context.ownerDocument) {
      const node = Convert.nodesIntoNode(nodes, context.ownerDocument)

      // Note: Context object could have been inserted into node.
      if (context.parentNode === parent)
        TreeMutation.replaceNode(context, node, parent)
      else
        TreeMutation.preInsert(node, parent, viableNextSibling)
    }
  }

  /**
   * Removes this node form its tree.
   */
  remove(): void {
    const context = <Node><unknown>this

    const parent = context.parentNode
    if (!parent) return

    TreeMutation.removeNode(context, parent)
  }
}
