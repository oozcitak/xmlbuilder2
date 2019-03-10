import { Node, Document } from '../interfaces'
import { TextImpl } from '../TextImpl'
import { DocumentFragmentImpl } from '../DocumentFragmentImpl'

/**
 * Includes conversion methods.
 */
export class Convert {

  /**
   * Converts the given nodes or strings into a node (if `nodes` has
   * only one element) or a document fragment.
   * 
   * @param nodes - the array of nodes or strings
   */
  static nodesIntoNode(nodes: Array<Node | string>, document: Document): Node {
    if (nodes.length === 1) {
      if (typeof nodes[0] === 'string')
        return new TextImpl(document, <string>nodes[0])
      else
        return <Node>nodes[0]
    }
    else {
      let fragment = new DocumentFragmentImpl(document)
  
      for (let child of nodes) {
        if (typeof child === 'string')
          fragment.appendChild(new TextImpl(document, child))
        else
          fragment.appendChild(child)
      }
  
      return fragment
    }
  }
}