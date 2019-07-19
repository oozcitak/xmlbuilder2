import { Node, NodeType, Text } from '../interfaces'
import { DOMException } from '../DOMException'
import { TextImpl } from '../TextImpl'
import { CharacterDataUtility } from './CharacterDataUtility';
import { TreeMutation } from './TreeMutation';

/**
 * Includes common methods to manipulate text nodes.
 */
export class TextUtility {

  /**
   * Splits data at the given offset and returns the remainder as a text
   * node.
   * 
   * @param offset - the offset at which to split nodes.
   */
  static splitText(node: Text, offset: number): Text {
    const length = node.data.length

    if (offset > length) {
      throw DOMException.IndexSizeError
    }

    const count = length - offset
    const newData = CharacterDataUtility.substringData(node, offset, count)
    const newNode = new TextImpl(node.ownerDocument, newData)

    const parent = node.parentNode

    if (parent !== null) {
      TreeMutation.insertNode(newNode, parent, node.nextSibling)

      /**
       * TODO:
       * For each live range whose start node is node and start offset is
       * greater than offset, set its start node to new node and decrease its
       * start offset by offset.
       * 
       * For each live range whose end node is node and end offset is greater
       * than offset, set its end node to new node and decrease its end offset
       * by offset.
       * 
       * For each live range whose start node is parent and start offset is
       * equal to the index of node plus 1, increase its start offset by 1.
       * 
       * For each live range whose end node is parent and end offset is equal
       * to the index of node plus 1, increase its end offset by 1.
       */
    }

    CharacterDataUtility.replaceData(node, offset, count, '')

    return newNode
  }


  /**
   * Determines if the given node is a text node.
   * 
   * @param node - a node
   */
  static isTextNode(node: Node): node is Text {
    return (node.nodeType === NodeType.Text)
  }
}
