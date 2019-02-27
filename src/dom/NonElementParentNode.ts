import { Utility } from './Utility'
import { Node } from './Node'
import { Element } from './Element'
import { Document } from './Document'
import { DocumentFragment } from './DocumentFragment'

/**
 * Represents a mixin that extends non-element parent nodes. This mixin
 * is imlpemented by {@link Document} and {@link DocumentFragment}.
 */
class NonElementParentNode {
  /**
   * Returns an {@link Element}  who has an id attribute `elementId`.
   * 
   * @param id - the value of the `id` attribute to match
   */
  getElementById(id: string): Element | null {
    let nodeFound = Utility.Tree.forEachDescendant(<Node><unknown>this, {},
      function (node: Node): Element | undefined {
        if (node.nodeType === Node.Element && (<Element>node).id === id) {
          return <Element>node
      }
    })

    return nodeFound
  }
}

// Apply mixins
Utility.Internal.applyMixin(Document, NonElementParentNode)
Utility.Internal.applyMixin(DocumentFragment, NonElementParentNode)
