import { Node, Text, CharacterData } from '../interfaces'
import { DOMException } from '../DOMException'
import { TreeMutation } from './TreeMutation'
import { TreeQuery } from './TreeQuery'
import {
  CharacterDataInternal, DocumentInternal, TextInternal, RangeInternal
} from '../interfacesInternal'
import { Guard } from './Guard'

/**
 * Includes common methods to manipulate text nodes.
 */
export class TextUtility {

  /**
   * Replaces character data.
   * 
   * @param node - a character data node
   * @param offset - start offset
   * @param count - count of characters to replace
   * @param data - new data
   */
  static replaceData(node: CharacterDataInternal, offset: number, count: number, data: string): void {
    const length = TreeQuery.nodeLength(node)

    if (offset > length) {
      throw DOMException.IndexSizeError
    }

    if (offset + count > length) {
      count = length - offset
    }

    TreeMutation.queueMutationRecord("characterData", node, null, null,
      node.data, [], [], null, null)

    const newData = node.data.substring(0, offset) + data + node.data.substring(offset + count)
    node._data = newData

    /**
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
     */
    const doc = node._nodeDocument
    for (const item of doc._rangeList) {
      const range = item as RangeInternal
      if (range._start[0] === node && range._start[1] > offset && range._start[1] <= offset + count) {
        range._start[1] += offset
      }
      if (range._end[0] === node && range._end[1] > offset && range._end[1] <= offset + count) {
        range._end[1] += offset
      }
      if (range._start[0] === node && range._start[1] > offset + count) {
        range._start[1] += data.length - count
      }
      if (range._end[0] === node && range._end[1] > offset + count) {
        range._end[1] += data.length - count
      }
    }

    /**
     * If node is a Text node and its parent is not null, run the child
     * text content change steps for node's parent.
     */
    if (Guard.isTextNode(node) && node.parentNode !== null) {
      TextUtility.childTextContentChanged(node.parentNode)
    }

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
   * Splits data at the given offset and returns the remainder as a text
   * node.
   * 
   * @param offset - the offset at which to split nodes.
   */
  static splitText(node: TextInternal, offset: number): Text {
    const length = node.data.length

    if (offset > length) {
      throw DOMException.IndexSizeError
    }

    const count = length - offset
    const newData = TextUtility.substringData(node, offset, count)
    const newNode = node._nodeDocument.createTextNode(newData)

    const parent = node.parentNode

    if (parent !== null) {
      TreeMutation.insertNode(newNode, parent, node.nextSibling)

      /**
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
      const doc = node._nodeDocument
      for (const item of doc._rangeList) {
        const range = item as RangeInternal
        if (range._start[0] === node && range._start[1] > offset) {
          range._start[0] = newNode
          range._start[1] -= offset
        }
        if (range._end[0] === node && range._end[1] > offset) {
          range._end[0] = newNode
          range._end[1] -= offset
        }
        const index = TreeQuery.index(node)
        if (range._start[0] === parent && range._start[1] === index + 1) {
          range._start[1]++
        }
        if (range._end[0] === parent && range._end[1] === index + 1) {
          range._end[1]++
        }
      }
    }

    TextUtility.replaceData(node, offset, count, '')

    return newNode
  }

  /**
   * Applies any child text content change steps defined in the specifications
   * to the node.
   * 
   * @param node - a parent node whose child text nodes were changed
   */
  static childTextContentChanged(node: Node): void {

  }
}
