import { NodeType } from "./NodeType"
import { Node } from "./Node"
import { Document } from "./Document"

/**
 * Represents a document fragment in the XML tree.
 */
export class DocumentFragment extends Node {

  protected _nodeType: NodeType = NodeType.DocumentFragment
  protected _nodeName: string = '#document-fragment'

  /**
   * Initializes a new instance of `DocumentFragment`.
   *
   * @param ownerDocument - the parent document
   */
  public constructor (ownerDocument: Document) 
  {
    super(ownerDocument)
  }
}
