import { Utility } from './Utility'
import { Node } from './Node'
import { Element } from './Element'

export class NonElementParentNode {
  /**
   * Returns an {@link Element}  who has an id attribute `elementId`.
   * 
   * @param id - the value of the `id` attribute to match
   */
  getElementById(id: string): Element | null {
    let nodeFound = Utility.Tree.forEachDescendant(<Node><unknown>this, {},
      function (node: Node) {
      if (node.nodeType === Node.Element && (<Element>node).id === id) {
          return node
      }
    })

    return nodeFound
  }
}