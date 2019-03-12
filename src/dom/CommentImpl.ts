import { Comment, Node, Document, NodeType } from "./interfaces"
import { CharacterDataImpl } from "./CharacterDataImpl"

/**
 * Represents a comment node.
 */
export class CommentImpl extends CharacterDataImpl implements Comment {

  /**
   * Initializes a new instance of `Comment`.
   *
   * @param ownerDocument - the owner document
   * @param data - the text content
   */
  public constructor(ownerDocument: Document | null = null,
    data: string | null = null) {
    super(ownerDocument, data)
  }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): number { return NodeType.Comment }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return '#comment' }

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
    return new CommentImpl(this.ownerDocument, this.data)
  }
}