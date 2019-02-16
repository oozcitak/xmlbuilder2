import { NodeType } from "./NodeType"
import { CharacterData } from "./CharacterData"
import { Document } from "./Document"

/**
 * Represents a comment node.
 */
export class Comment extends CharacterData {

  protected _nodeType: NodeType = NodeType.Comment
  protected _nodeName: string = '#comment'

  /**
   * Initializes a new instance of `Comment`.
   *
   * @param ownerDocument - the parent document
   * @param data - the text content
   */
  public constructor (ownerDocument: Document | null = null, 
    data: string | null = null)
  {
    super(ownerDocument, data)
  }
}