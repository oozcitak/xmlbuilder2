import { Node } from "./Node"
import { Document } from "./Document"

/**
 * Represents an object providing methods which are not dependent on 
 * any particular document
 */
export class DocType extends Node {
  
  protected _nodeType: number = Node.DocumentType
  protected _nodeName: string
  protected _publicId: string
  protected _systemId: string

  /**
   * Initializes a new instance of `DocType`.
   *
   * @param ownerDocument - the owner document
   * @param name - the name of the node
   * @param publicId - the `PUBLIC` identifier
   * @param publicId - the `SYSTEM` identifier
   */
  public constructor (ownerDocument: Document | null = null, 
    name: string, publicId: string = '', systemId: string = '') 
  {
    super(ownerDocument)

    this._nodeName = name
    this._publicId = publicId
    this._systemId = systemId
  }

  /**
   * Returns the name of the node.
   */
  get name(): string { return this._nodeName }

  /**
   * Returns the `PUBLIC` identifier of the node.
   */
  get publicId(): string { return this._publicId }

  /**
   * Returns the `SYSTEM` identifier of the node.
   */
  get systemId(): string { return this._systemId }

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
      
    let clonedSelf = new DocType(document, this.name, 
      this.publicId, this.systemId)
    clonedSelf._parentNode = null
    return clonedSelf
  }
}