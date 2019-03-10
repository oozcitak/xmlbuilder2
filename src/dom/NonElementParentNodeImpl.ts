import { NonElementParentNode, Node, Element, NodeType } from './interfaces';
import { TreeQuery } from './util/TreeQuery';

/**
 * Represents a mixin that extends non-element parent nodes. This mixin
 * is imlpemented by {@link Document} and {@link DocumentFragment}.
 */
export class NonElementParentNodeImpl implements NonElementParentNode {
  /**
   * Returns an {@link Element}  who has an id attribute `elementId`.
   * 
   * @param id - the value of the `id` attribute to match
   */
  getElementById(id: string): Element | null {
    let nodeFound = TreeQuery.forEachDescendant(<Node><unknown>this, {},
      function (node: Node): Element | undefined {
        if (node.nodeType === NodeType.Element && (<Element>node).id === id) {
          return <Element>node
      }
    })

    return nodeFound
  }
}
