import { DocumentType, Node, Document, NodeType } from "./interfaces"
import { NodeImpl } from './NodeImpl'

/**
 * Represents an object providing methods which are not dependent on 
 * any particular document
 */
export class DocumentTypeImpl extends NodeImpl implements DocumentType {

  protected _nodeName: string
  protected _publicId: string
  protected _systemId: string

  /**
   * Initializes a new instance of `DocumentType`.
   *
   * @param ownerDocument - the owner document
   * @param name - the name of the node
   * @param publicId - the `PUBLIC` identifier
   * @param publicId - the `SYSTEM` identifier
   */
  public constructor(ownerDocument: Document | null,
    name: string, publicId: string = '', systemId: string = '') {
    super(ownerDocument)

    this._nodeName = name
    this._publicId = publicId
    this._systemId = systemId
  }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): number { return NodeType.DocumentType }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return this._nodeName }

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
   * @param deep - if `true`, recursively clone the subtree under the 
   * specified node; if `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(deep: boolean = false): Node {
    return new DocumentTypeImpl(this.ownerDocument, this.name,
      this.publicId, this.systemId)
  }

  /**
   * Determines if the given node is equal to this one.
   * 
   * @param node - the node to compare with
   */
  isEqualNode(node?: Node): boolean {
    if (!node || !super.isEqualNode(node))
      return false

    const other = <DocumentType>node
    if (!other || this.name !== other.name ||
      this.publicId !== other.publicId ||
      this.systemId !== other.systemId)
      return false
    else
      return true
  }

  // MIXIN: ChildNode
  /* istanbul ignore next */
  before(...nodes: Array<Node | string>): void { throw new Error("Mixin: ChildNode not implemented.") }
  /* istanbul ignore next */
  after(...nodes: Array<Node | string>): void { throw new Error("Mixin: ChildNode not implemented.") }
  /* istanbul ignore next */
  replaceWith(...nodes: Array<Node | string>): void { throw new Error("Mixin: ChildNode not implemented.") }
  /* istanbul ignore next */
  remove(): void { throw new Error("Mixin: ChildNode not implemented.") }

}