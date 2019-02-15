import { NodeType } from "./NodeType";
import { Node } from "./Node";

/**
 * Represents a document fragment in the XML tree.
 */
export class DocumentFragment extends Node {

    protected _nodeType: NodeType = NodeType.DocumentFragment
    protected _nodeName: string = '#document-fragment'

  /**
   * Initializes a new instance of `DocumentFragment`.
   *
   */
  public constructor () 
  {
    super(null)
  }
}
