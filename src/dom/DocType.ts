import { Node } from "./Node"
import { NodeType } from "./NodeType"

/**
 * Represents an object providing methods which are not dependent on 
 * any particular document
 */
export class DocType extends Node {
  
  protected _nodeType: NodeType = NodeType.DocType
  protected _nodeName: string
  protected _publicId: string
  protected _systemId: string

  /**
   * Initializes a new instance of `DocType`.
   *
   * @param name - the name of the node
   * @param publicId - the `PUBLIC` identifier
   * @param publicId - the `SYSTEM` identifier
   */
  public constructor (name: string, publicId: string = '', systemId: string = '') 
  {
    super()

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
}