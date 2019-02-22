import { Node } from './Node'
import { HTMLCollection } from './HTMLCollection'
import { Element } from './Element'
import { Text } from './Text'
import { DocumentFragment } from './DocumentFragment'
import { Document } from './Document';
import { DOMException } from './DOMException';
import { NodeList } from './NodeList';

/**
 * Represents a node that can have children.
 */
export class ParentNode {
  /**
   * Returns the child elements.
   */
  get children(): HTMLCollection {
    let items = new HTMLCollection()
    let nodes = <NodeList>(<Node><unknown>this).childNodes

    for (let child of nodes) {
      if (child.nodeType === Node.Element) {
        items.push(<Element>child)
      }
    }
    return items
  }

  /**
   * Returns the first child that is an element, and `null` otherwise.
   */
  get firstElementChild(): Element | null {
    let nodes = (<Node><unknown>this).childNodes

    for (let child of nodes) {
      if (child.nodeType === Node.Element) {
        return <Element>child
      }
    }
    return null
  }

  /**
   * Returns the last child that is an element, and `null` otherwise.
   */
  get lastElementChild(): Element | null {
    let nodes = (<Node><unknown>this).childNodes
    let length = nodes.length
    
    for (let i = length - 1; i > 0; i--) {
      let child = nodes[i]
      if (child.nodeType === Node.Element) {
        return <Element>child
      }
    }

    return null
  }

  /**
   * Returns the number of children that are elements.
   */
  get childElementCount(): number {
    let nodes = (<Node><unknown>this).childNodes
    let count = 0

    for (let child of nodes) {
      if (child.nodeType === Node.Element) {
        count++
      }
    }
  
    return count
  }

  /**
   * Prepends the list of nodes or strings before the first child node.
   * Strings are converted into {@link Text} nodes.
   * 
   * @param nodes - the array of nodes or strings
   */
  prepend(nodes: [Node | string]): void {
    let node = <Node><unknown>this

    if(node.ownerDocument) {
      let childNode = this.convertNodesIntoNode(nodes, node.ownerDocument)
      node.insertBefore(childNode, node.firstChild)
    }
  }

  /**
   * Appends the list of nodes or strings after the last child node.
   * Strings are converted into {@link Text} nodes.
   * 
   * @param nodes - the array of nodes or strings
   */
  append(nodes: [Node | string]): void {
    let node = <Node><unknown>this

    if(node.ownerDocument) {
      let childNode = this.convertNodesIntoNode(nodes, node.ownerDocument)
      node.appendChild(childNode)
    }
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

  /**
   * Converts the given nodes or strings into a node (if there `nodes`
   * has only one element) or a document fragment.
   * 
   * @param nodes - the array of nodes or strings
   */
  protected convertNodesIntoNode(nodes: [Node | string], document: Document): Node {
    let node = <Node><unknown>this
    if (nodes.length === 1)
    {
      if (typeof nodes[0] === 'string')
        return new Text(node.ownerDocument, nodes[0])
      else
        return <Node>nodes[0]
    }
    else
    {
      let fragment = new DocumentFragment(node.ownerDocument)

      for(let child of nodes) {
        if (typeof child === 'string')
          fragment.appendChild(new Text(node.ownerDocument, child))
        else
          fragment.appendChild(node)
      }

      return fragment
    }
  }
}