import { Node } from './interfaces'
import { Convert } from './util/Convert'
import { TreeMutation } from './util/TreeMutation'
import { ChildNodeInternal } from './interfacesInternal'
import { Cast } from './util/Cast'

/**
 * Represents a mixin that extends child nodes that can have siblings
 * including doctypes. This mixin is implemented by {@link Element},
 * {@link CharacterData} and {@link DocumentType}.
 */
export class ChildNodeImpl implements ChildNodeInternal {

  /**
   * Inserts nodes just before this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  before(...nodes: (Node | string)[]): void {
    const context = Cast.asNode(this)

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

    const node = Convert.nodesIntoNode(nodes, context._nodeDocument)

    if (!viablePreviousSibling)
      viablePreviousSibling = parent.firstChild
    else
      viablePreviousSibling = viablePreviousSibling.nextSibling

    TreeMutation.preInsert(node, parent, viablePreviousSibling)
  }

  /**
   * Inserts nodes just after this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  after(...nodes: (Node | string)[]): void {
    const context = Cast.asNode(this)

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

    const node = Convert.nodesIntoNode(nodes, context._nodeDocument)

    TreeMutation.preInsert(node, parent, viableNextSibling)
  }

  /**
   * Replaces nodes with this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  replaceWith(...nodes: (Node | string)[]): void {
    const context = Cast.asNode(this)

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

    const node = Convert.nodesIntoNode(nodes, context._nodeDocument)

    // Note: Context object could have been inserted into node.
    if (context.parentNode === parent)
      TreeMutation.replaceNode(context, node, parent)
    else
      TreeMutation.preInsert(node, parent, viableNextSibling)
  }

  /**
   * Removes this node form its tree.
   */
  remove(): void {
    const context = Cast.asNode(this)

    const parent = context.parentNode
    if (!parent) return

    TreeMutation.removeNode(context, parent)
  }
}
