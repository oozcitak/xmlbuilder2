import { Node } from './Node'
import { CharacterData } from './CharacterData'
import { Element } from './Element'
import { DocumentType } from './DocumentType'
import { Utility } from './Utility'

/**
 * Represents a mixin that extends child nodes that can have siblings
 * including doctypes. This mixin is implemented by {@link Element},
 * {@link CharacterData} and {@link DocumentType}.
 */
class ChildNode {

  /**
   * Inserts nodes just before this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  before(nodes: [Node | string]): void {
    let context = <Node><unknown>this

    let parent = context.parentNode
    if (!parent) return

    let viablePreviousSibling = context.previousSibling
    let flag = true
    while (flag && viablePreviousSibling) {
      flag = false
      for(let child of nodes) {
        if (child === viablePreviousSibling)
        {
          viablePreviousSibling = viablePreviousSibling.previousSibling
          flag = true
          break
        }
      }
    }

    if(context.ownerDocument) {
      let node = Utility.Tree.Mutation.convertNodesIntoNode(nodes, context.ownerDocument)

      if (!viablePreviousSibling)
        viablePreviousSibling = parent.firstChild
      else
        viablePreviousSibling = viablePreviousSibling.nextSibling

      Utility.Tree.Mutation.preInsert(node, parent, viablePreviousSibling)
    }
  }

  /**
   * Inserts nodes just after this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  after(nodes: [Node | string]): void {
    let context = <Node><unknown>this

    let parent = context.parentNode
    if (!parent) return

    let viableNextSibling = context.nextSibling
    let flag = true
    while (flag && viableNextSibling) {
      flag = false
      for(let child of nodes) {
        if (child === viableNextSibling)
        {
          viableNextSibling = viableNextSibling.nextSibling
          flag = true
          break
        }
      }
    }

    if(context.ownerDocument) {
      let node = Utility.Tree.Mutation.convertNodesIntoNode(nodes, context.ownerDocument)

      Utility.Tree.Mutation.preInsert(node, parent, viableNextSibling)
    }
  }

  /**
   * Replaces nodes with this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  replaceWith(nodes: [Node | string]): void {
    let context = <Node><unknown>this

    let parent = context.parentNode
    if (!parent) return

    let viableNextSibling = context.nextSibling
    let flag = true
    while (flag && viableNextSibling) {
      flag = false
      for(let child of nodes) {
        if (child === viableNextSibling)
        {
          viableNextSibling = viableNextSibling.nextSibling
          flag = true
          break
        }
      }
    }

    if(context.ownerDocument) {
      let node = Utility.Tree.Mutation.convertNodesIntoNode(nodes, context.ownerDocument)

    // Note: Context object could have been inserted into node.
    if (context.parentNode === parent)
        Utility.Tree.Mutation.replaceNode(context, node, parent)
      else
        Utility.Tree.Mutation.preInsert(node, parent, viableNextSibling)
    }
  }

  /**
   * Removes this node form its tree.
   */
  remove(): void {
    let context = <Node><unknown>this

    let parent = context.parentNode
    if (!parent) return

    Utility.Tree.Mutation.removeNode(context, parent)
  }
}

// Apply mixins
Utility.Internal.applyMixin(Element, ChildNode)
Utility.Internal.applyMixin(CharacterData, ChildNode)
Utility.Internal.applyMixin(DocumentType, ChildNode)
