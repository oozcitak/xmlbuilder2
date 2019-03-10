import { Node, NonDocumentTypeChildNode, Element, NodeType } from './interfaces'

/**
 * Represents a mixin that extends child nodes that can have siblings
 * other than doctypes. This mixin is implemented by {@link Element} and
 * {@link CharacterData}.
 */
export class NonDocumentTypeChildNodeImpl implements NonDocumentTypeChildNode {

  /**
   * Returns the previous sibling that is an element node.
   */
  get previousElementSibling(): Element | null {
    let node = (<Node><unknown>this).previousSibling
    while(node) {
      if (node.nodeType === NodeType.Element)
        return <Element>node
      else
        node.previousSibling
    }
    return null
  }
  set previousElementSibling(value: Element | null) { throw new Error("This property is read-only.") }

  /**
   * Returns the next sibling that is an element node.
   */
  get nextElementSibling(): Element | null {
    let node = (<Node><unknown>this).nextSibling
    while(node) {
      if (node.nodeType === NodeType.Element)
        return <Element>node
      else
        node.nextSibling
    }
    return null
  }  
  set nextElementSibling(value: Element | null) { throw new Error("This property is read-only.") }
  
}
