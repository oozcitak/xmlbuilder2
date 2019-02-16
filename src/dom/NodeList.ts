import { Node } from "./Node";

/**
 * Represents a collection of nodes.
 */
export class NodeList extends Array<Node> {


  /** 
   * Returns the node with index `index` from the collection.
   * The nodes are sorted in tree order.
   * 
   * @param index - the zero-based index of the node to return
   */
  item(index: number): Node | null { return this[index] || null }
}