import { NodeType } from "./NodeType"
import { Node } from "./Node"
import { Document } from "./Document"

/**
 * Represents an element node.
 */
export class Element extends Node {

  protected _nodeType: NodeType = NodeType.Element
  protected _nodeName: string = ''

  protected _namespaceURI: string | null
  protected _prefix: string | null
  protected _localName: string
  
  /**
   * Initializes a new instance of `Element`.
   *
   * @param ownerDocument - the parent document
   * @param namespaceURI - the namespace URI
   * @param prefix - the namespace prefix
   * @param localName - the local name of the element
   */
  public constructor (ownerDocument: Document | null = null, 
    namespaceURI: string | null, prefix: string, localName: string) 
  {
    super(ownerDocument)

    this._namespaceURI = namespaceURI
    this._prefix = prefix
    this._localName = localName
  }
  
  /** 
   * Gets the namespace URI.
   */
  get namespaceURI(): string | null { return this._namespaceURI }
    
  /** 
   * Gets the namespace prefix.
   */
  get prefix(): string | null { return this._prefix }

  /** 
   * Gets the local name.
   */
  get localName(): string { return this._localName }

  /** 
   * If namespace prefix is not `null`, returns the concatenation of
   * namespace prefix, `":"`, and local name. Otherwise it returns the
   * local name.
   */
  get tagName(): string {
    return (this._prefix ? 
      this._prefix + ':' + this.localName : 
      this.localName)
  }
}