import { Node, Document, NodeType } from "./interfaces"
import { NodeImpl } from './NodeImpl'
import { DocumentTypeInternal } from "./interfacesInternal"

/**
 * Represents an object providing methods which are not dependent on 
 * any particular document
 */
export class DocumentTypeImpl extends NodeImpl implements DocumentTypeInternal {

  _name: string
  _publicId: string
  _systemId: string

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

    this._name = name
    this._publicId = publicId
    this._systemId = systemId
  }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): NodeType { return NodeType.DocumentType }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return this._name }

  /**
   * Returns the name of the node.
   */
  get name(): string { return this._name }

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
   * specified node. If `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(deep: boolean = false): Node {
    return new DocumentTypeImpl(this._nodeDocument, this.name,
      this.publicId, this.systemId)
  }

  /**
   * Determines if the given node is equal to this one.
   * 
   * @param node - the node to compare with
   */
  isEqualNode(node: Node | null = null): boolean {
    if (!super.isEqualNode(node))
      return false

    const other = <DocumentTypeInternal>node
    if (!other || this._name !== other._name ||
      this._publicId !== other._publicId ||
      this._systemId !== other._systemId)
      return false
    else
      return true
  }

  // MIXIN: ChildNode
  /* istanbul ignore next */
  before(...nodes: (Node | string)[]): void { throw new Error("Mixin: ChildNode not implemented.") }
  /* istanbul ignore next */
  after(...nodes: (Node | string)[]): void { throw new Error("Mixin: ChildNode not implemented.") }
  /* istanbul ignore next */
  replaceWith(...nodes: (Node | string)[]): void { throw new Error("Mixin: ChildNode not implemented.") }
  /* istanbul ignore next */
  remove(): void { throw new Error("Mixin: ChildNode not implemented.") }

}