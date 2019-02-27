import { Node } from './Node'
import { CharacterData } from './CharacterData'
import { Element } from './Element'
import { Utility } from './Utility'

/**
 * Represents a mixin that extends child nodes that can have siblings
 * other than doctypes. This mixin is implemented by {@link Element} and
 * {@link CharacterData}.
 */
class NonDocumentTypeChildNode {

  /**
   * Returns the previous sibling that is an element node.
   */
  get previousElementSibling(): Element | null {
    let node = (<Node><unknown>this).previousSibling
    while(node) {
      if (node.nodeType === Node.Element)
        return <Element>node
      else
        node.previousSibling
    }
    return null
  }

  /**
   * Returns the next sibling that is an element node.
   */
  get nextElementSibling(): Element | null {
    let node = (<Node><unknown>this).nextSibling
    while(node) {
      if (node.nodeType === Node.Element)
        return <Element>node
      else
        node.nextSibling
    }
    return null
  }
}

// Apply mixins
Utility.Internal.applyMixin(Element, NonDocumentTypeChildNode)
Utility.Internal.applyMixin(CharacterData, NonDocumentTypeChildNode)
