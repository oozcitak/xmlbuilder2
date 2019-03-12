import { Text, Document, Node, NodeType } from "./interfaces"
import { CharacterDataImpl } from "./CharacterDataImpl"
import { DOMException } from "./DOMException"

/**
 * Represents a text node.
 */
export class TextImpl extends CharacterDataImpl implements Text {

  /**
   * Initializes a new instance of `Text`.
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
  get nodeType(): number { return NodeType.Text }

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
    if (offset < 0 || offset > this.data.length)
      throw DOMException.IndexSizeError

    const newData = this.data.slice(offset)
    this.data = this.data.slice(0, offset)

    const newNode = new TextImpl(this.ownerDocument, newData)

    if (this.parentNode)
      this.parentNode.insertBefore(newNode, this.nextSibling)

    return newNode
  }

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
    return new TextImpl(this.ownerDocument, this.data)
  }

  // MIXIN: Slotable
  get assignedSlot(): undefined { throw new Error("Mixin: Slotable not implemented.") }

}