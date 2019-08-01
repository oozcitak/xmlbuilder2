import { Element } from './interfaces'
import { TreeQuery } from './util/TreeQuery'
import { NonElementParentNodeInternal } from './interfacesInternal'
import { Cast } from './util/Cast'

/**
 * Represents a mixin that extends non-element parent nodes. This mixin
 * is implemented by {@link Document} and {@link DocumentFragment}.
 */
export class NonElementParentNodeImpl implements NonElementParentNodeInternal {
  /**
   * Returns an {@link Element}  who has an id attribute `elementId`.
   * 
   * @param id - the value of the `id` attribute to match
   */
  getElementById(id: string): Element | null {
    for (const ele of TreeQuery.getDescendantElements(Cast.asNode(this))) {
      if (ele.id === id) {
        return ele
      }
    }

    return null
  }
}
