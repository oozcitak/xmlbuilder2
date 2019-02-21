import { Node } from "./Node"
import { CharacterData } from "./CharacterData"
import { Document } from "./Document"

/**
 * Represents a text node.
 */
export class Text extends CharacterData {

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
  get nodeType(): number { return Node.Text }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return '#text' }

  /** 
   * Returns the combined data of all direct text node siblings.
   */
  get wholeText(): string {
    let prev = this.previousSibling
    let prevText = ''
    if (prev && prev.nodeType === Node.Text)
      prevText = (<Text>prev).wholeText

    let next = this.nextSibling
    let nextText = ''
    if (next && next.nodeType === Node.Text)
      nextText = (<Text>next).wholeText

    return prevText + this.data + nextText
  }

  /**
   * Splits data at the given offset and returns the remainder as a text
   * node.
   * 
   * @param offset - the offset at which to split nodes.
   */
  splitText(offset: number): Text {
    let newData = this.data.slice(offset)
    this.data = this.data.slice(0, offset)

    let newNode = new Text(this.ownerDocument, newData)

    if (this.parentNode)
      this.parentNode.insertBefore(newNode, this)

    return newNode
  }

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

    let ownerDocument = (typeof document === "boolean" ? null : document)
    deep = (typeof document === "boolean" ? document : false)

    if (!ownerDocument)
      ownerDocument = this.ownerDocument

    let clonedSelf = new Text(ownerDocument, this.data)
    clonedSelf._parentNode = null

    return clonedSelf
  }
}