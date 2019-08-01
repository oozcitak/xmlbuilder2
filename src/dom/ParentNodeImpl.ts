import { Node, NodeType, HTMLCollection, NodeList, Element } from './interfaces'
import { HTMLCollectionImpl } from './HTMLCollectionImpl'
import { DOMException } from './DOMException'
import { Convert } from './util/Convert'
import { ParentNodeInternal } from './interfacesInternal'
import { Cast } from './util/Cast'

/**
 * Represents a mixin that extends parent nodes that can have children.
 * This mixin is implemented by {@link Element}, {@link Document} and
 * {@link DocumentFragment}.
 */
export class ParentNodeImpl implements ParentNodeInternal {
  /**
   * Returns the child elements.
   */
  get children(): HTMLCollection {
    return new HTMLCollectionImpl(Cast.asNode(this))
  }

  /**
   * Returns the first child that is an element, and `null` otherwise.
   */
  get firstElementChild(): Element | null {
    let node = Cast.asNode(this).firstChild

    while (node) {
      if (node.nodeType === NodeType.Element)
        return <Element>node
      else
        node = node.nextSibling
    }
    return null
  }

  /**
   * Returns the last child that is an element, and `null` otherwise.
   */
  get lastElementChild(): Element | null {
    let node = Cast.asNode(this).lastChild

    while (node) {
      if (node.nodeType === NodeType.Element)
        return <Element>node
      else
        node = node.previousSibling
    }
    return null
  }

  /**
   * Returns the number of children that are elements.
   */
  get childElementCount(): number {
    let node = Cast.asNode(this).firstChild
    let count = 0

    while (node) {
      if (node.nodeType === NodeType.Element)
        count++

      node = node.nextSibling
    }

    return count
  }

  /**
   * Prepends the list of nodes or strings before the first child node.
   * Strings are converted into {@link Text} nodes.
   * 
   * @param nodes - the array of nodes or strings
   */
  prepend(...nodes: (Node | string)[]): void {
    const node = Cast.asNode(this)

    const childNode = Convert.nodesIntoNode(nodes, node._nodeDocument)
    node.insertBefore(childNode, node.firstChild)
  }

  /**
   * Appends the list of nodes or strings after the last child node.
   * Strings are converted into {@link Text} nodes.
   * 
   * @param nodes - the array of nodes or strings
   */
  append(...nodes: (Node | string)[]): void {
    const node = Cast.asNode(this)

    const childNode = Convert.nodesIntoNode(nodes, node._nodeDocument)
    node.appendChild(childNode)
  }

  /**
   * Returns the first element that is a descendant of node that
   * matches selectors.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param selectors - a selectors string
   */
  querySelector(selectors: string): Element | null {
    throw DOMException.NotSupportedError
  }

  /**
   * Returns all element descendants of node that match selectors.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param selectors - a selectors string
   */
  querySelectorAll(selectors: string): NodeList {
    throw DOMException.NotSupportedError
  }

}
