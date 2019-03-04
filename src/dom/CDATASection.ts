import { Node } from "./Node"
import { Text } from "./Text"
import { Document } from "./Document"

/**
 * Represents a CDATA node.
 */
export class CDATASection extends Text {

  /**
   * Initializes a new instance of `CDATASection`.
   *
   * @param ownerDocument - the owner document
   * @param data - the text content
   */
  public constructor(ownerDocument: Document | null = null,
    data: string | null = null) {
    super(ownerDocument, data)
  }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): number { return Node.CData }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return '#cdata-section' }

  /**
   * Returns a duplicate of this node, i.e., serves as a generic copy 
   * constructor for nodes. The duplicate node has no parent 
   * ({@link parentNode} returns `null`).
   *
   * @param deep - if `true`, recursively clone the subtree under the 
   * specified node; if `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(deep: boolean = false): Node {
    let clonedSelf = new CDATASection(this.ownerDocument, this.data)
    return clonedSelf
  }
}