import { Node } from "./Node";
import { CharacterData } from "./CharacterData";
import { Document } from "./Document";

/**
 * Represents a processing instruction node.
 */
export class ProcessingInstruction extends CharacterData {

  protected _target: string

  /**
   * Initializes a new instance of `ProcessingInstruction`.
   *
   * @param ownerDocument - the parent document
   * @param data - the text content
   */
  public constructor(ownerDocument: Document | null = null,
    target: string, data: string | null = null) {
    super(ownerDocument, data)
    this._target = target
  }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): number { return Node.ProcessingInstruction }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return this._target }

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

    if (!document)
      document = this.ownerDocument

    let clonedSelf = new ProcessingInstruction(document,
      this.target, this.data)
    clonedSelf._parentNode = null

    return clonedSelf
  }

  /**
   * Determines if the given node is equal to this one.
   * 
   * @param node - the node to compare with
   */
  isEqualNode(node?: Node | null): boolean {
    if (!super.isEqualNode(node))
      return false

    if (!node || this.target !== (<ProcessingInstruction>node).target)
      return false
    else
      return true
  }
}