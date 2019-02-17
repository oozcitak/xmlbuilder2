import { Node } from "./Node";
import { CharacterData } from "./CharacterData";
import { Document } from "./Document";

/**
 * Represents a processing instruction node.
 */
export class ProcessingInstruction extends CharacterData {

  protected _nodeType: number = Node.ProcessingInstruction
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

  /**
   * Returns a duplicate of this node, i.e., serves as a generic copy 
   * constructor for nodes. The duplicate node has no parent 
   * ({@link parentNode} returns `null`).
   *
   * @param document - new owner document
   * @param deep - if `true`, recursively clone the subtree under the 
   * specified node; if `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(document: Document | boolean | null = null,
    deep: boolean = false): Node {

    if (typeof document === "boolean") {
      deep = document
      document = null
    }

    if(!document)
      document = this.ownerDocument
      
    let clonedSelf = new ProcessingInstruction(document,
      this.target, this.data)
    clonedSelf._parentNode = null

    return clonedSelf
  }
}