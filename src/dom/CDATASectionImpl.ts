import { Node, Document, NodeType } from "./interfaces"
import { TextImpl } from "./TextImpl"
import { CDATASectionInternal } from "./interfacesInternal"

/**
 * Represents a CDATA node.
 */
export class CDATASectionImpl extends TextImpl implements CDATASectionInternal {
  /**
   * Initializes a new instance of `CDATASection`.
   *
   * @param ownerDocument - the owner document
   * @param data - the text content
   */
  public constructor(ownerDocument: Document | null,
    data: string | null = null) {
    super(ownerDocument, data)
  }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): NodeType { return NodeType.CData }

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
   * specified node. If `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(deep: boolean = false): Node {
    return new CDATASectionImpl(this._nodeDocument, this.data)
  }
}