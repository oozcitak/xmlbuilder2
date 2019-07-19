import { CharacterData, Node, NodeType } from '../interfaces'
import { TreeQuery } from './TreeQuery'
import { DOMException } from '../DOMException'

/**
 * Includes common methods to manipulate character data nodes.
 */
export class CharacterDataUtility {

  /**
   * Replaces character data.
   * 
   * @param node - a character data node
   * @param offset - start offset
   * @param count - count of characters to replace
   * @param data - new data
   */
  static replaceData(node: CharacterData, offset: number, count: number, data: string): void {
    const length = TreeQuery.nodeLength(node)

    if (offset > length) {
      throw DOMException.IndexSizeError
    }

    if (offset + count > length) {
      count = length - offset
    }

    /**
     * TODO:
     * Queue a mutation record of "characterData" for node with 
     * null, null, node's data, « », « », null, and null.
     */

    const newData = node.data.substring(0, offset) + data + node.data.substring(offset + count)
    const nodeAsAny = <any><unknown>node
    nodeAsAny._data = newData

    /**
     * TODO:
     * For each live range whose start node is node and start offset is greater
     * than offset but less than or equal to offset plus count, set its start
     * offset to offset.
     * 
     * For each live range whose end node is node and end offset is greater 
     * than offset but less than or equal to offset plus count, set its end
     * offset to offset.
     * 
     * For each live range whose start node is node and start offset is greater
     * than offset plus count, increase its start offset by data's length and
     * decrease it by count.
     * 
     * For each live range whose end node is node and end offset is greater
     * than offset plus count, increase its end offset by data's length and
     * decrease it by count.
     *
     * If node is a Text node and its parent is not null, run the child text
     * content change steps for node's parent.
     */
  }

  /**
   * Returns `count` number of characters from `node` data starting at
   * the given `offset`.
   * 
   * @param node - a character data node
   * @param offset - start offset
   * @param count - count of characters to return
   */
  static substringData(node: CharacterData, offset: number, count: number): string {
    const length = TreeQuery.nodeLength(node)

    if (offset > length) {
      throw DOMException.IndexSizeError
    }

    if (offset + count > length) {
      return node.data.substr(offset)
    } else {
      return node.data.substr(offset, count)
    }
  }

  /**
   * Determines if the given node is a character data node.
   * 
   * @param node - a node
   */
  static isCharacterDataNode(node: Node): node is CharacterData {
    const type = node.nodeType

    return (type === NodeType.Text ||
      type === NodeType.ProcessingInstruction ||
      type === NodeType.Comment ||
      type === NodeType.CData)
  }
}
