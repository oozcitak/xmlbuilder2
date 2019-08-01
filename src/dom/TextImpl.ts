import { Text, Document, Node, NodeType } from "./interfaces"
import { CharacterDataImpl } from "./CharacterDataImpl"
import { TextUtility } from "./util/TextUtility"
import { TextInternal } from "./interfacesInternal"
import { HTMLSlotElement } from "../htmldom/interfaces"

/**
 * Represents a text node.
 */
export class TextImpl extends CharacterDataImpl implements TextInternal {

  /**
   * Initializes a new instance of `Text`.
   *
   * @param ownerDocument - the owner document
   * @param data - the text content
   */
  public constructor(ownerDocument: Document | null,
    data: string | null = null) {
    super(ownerDocument, data)
  }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): NodeType { return NodeType.Text }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return '#text' }

  /** 
   * Returns the combined data of all direct text node siblings.
   */
  get wholeText(): string {
    let text = ''

    let prev = this.previousSibling
    while (prev && prev.nodeType === NodeType.Text) {
      text = (<Text>prev).data + text
      prev = prev.previousSibling
    }

    text += this.data

    let next = this.nextSibling
    while (next && next.nodeType === NodeType.Text) {
      text += (<Text>next).data
      next = next.nextSibling
    }

    return text
  }

  /**
   * Splits data at the given offset and returns the remainder as a text
   * node.
   * 
   * @param offset - the offset at which to split nodes.
   */
  splitText(offset: number): Text {
    return TextUtility.splitText(this, offset)
  }

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
    return new TextImpl(this._nodeDocument, this.data)
  }

  // MIXIN: Slotable
  /* istanbul ignore next */
  get assignedSlot(): HTMLSlotElement | null { throw new Error("Mixin: Slotable not implemented.") }

}