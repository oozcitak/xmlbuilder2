import { NodeType } from "./NodeType";
import { CharacterData } from "./CharacterData";
import { Document } from "./Document";

/**
 * Represents a processing instruction node.
 */
export class ProcessingInstruction extends CharacterData {

  protected _nodeType: NodeType = NodeType.ProcessingInstruction
  protected _nodeName: string = '#text'
  protected _target: string

  /**
   * Initializes a new instance of `ProcessingInstruction`.
   *
   * @param ownerDocument - the parent document
   * @param data - the text content
   */
  public constructor (ownerDocument: Document | null = null, 
    target: string, data: string | null = null)
  {
    super(ownerDocument, data)
    this._target = target
  }
    
  /** 
   * Gets the target of the {@link ProcessingInstruction} node.
   */
  get target(): string { return this._target }
}