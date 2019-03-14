import { CharacterData, Document, Element, Node } from "./interfaces"
import { NodeImpl } from "./NodeImpl"

/**
 * Represents a generic text node.
 */
export abstract class CharacterDataImpl extends NodeImpl implements CharacterData {

  protected _data: string

  /**
   * Initializes a new instance of `CharacterData`.
   *
   * @param ownerDocument - the owner document
   * @param data - the text content
   */
  protected constructor(ownerDocument: Document | null,
    data: string | null) {
    super(ownerDocument)

    this._data = data || ''
  }

  /**
   * Determines if the given node is equal to this one.
   * 
   * @param node - the node to compare with
   */
  isEqualNode(node: Node | null = null): boolean {
    if (!super.isEqualNode(node))
      return false

    return (this.data === (<CharacterData>node).data)
  }

  /** 
   * Gets or sets the data associated with a {@link CharacterData} node.
   */
  get nodeValue(): string | null { return this.data }
  set nodeValue(value: string | null) { this.data = value || '' }

  /** 
   * Gets or sets the data associated with a {@link CharacterData} node.
   */
  get textContent(): string | null { return this.data }
  set textContent(value: string | null) { this.data = value || '' }

  /** 
   * Gets or sets the text data of the node. 
   */
  get data(): string { return this._data }
  set data(value: string) { this._data = value }

  /** 
   * Returns the number of code units in {@link data}.
   */
  get length(): number { return this._data.length }

  /**
   * Appends the given string to text data of the node.
   * 
   * @param data - the string of text to add to node data
   */
  appendData(data: string): void {
    this.data += data
  }

  /**
   * Inserts the given string into the text data of the node starting at
   * the given `offset`.
   * 
   * @param offset - the offset at which insertion starts
   * @param data - the string of text to add to node data
   */
  insertData(offset: number, data: string): void {
    this.data =
      this.data.slice(0, offset) +
      data +
      this.data.slice(offset)
  }

  /**
   * Deletes `count` number of characters from node data starting at
   * the given `offset`.
   * 
   * @param offset - the offset at which removal starts
   * @param count - the number of characters to delete
   */
  deleteData(offset: number, count: number): void {
    this.data =
      this.data.slice(0, offset) +
      this.data.slice(offset + count)
  }

  /**
   * Deletes `count` number of characters from node data starting at
   * the given `offset` and replaces it with the given `data`.
   * 
   * @param offset - the offset at which removal starts
   * @param count - the number of characters to delete
   * @param data - the string of text to add to node data
   */
  replaceData(offset: number, count: number, data: string): void {
    this.data =
      this.data.slice(0, offset) +
      data +
      this.data.slice(offset + count)
  }

  /**
   * Returns `count` number of characters from node data starting at
   * the given `offset`.
   * 
   * @param offset - the offset at which retrieval starts
   * @param count - the number of characters to return
   */
  substringData(offset: number, count: number): string {
    return this.data.substr(offset, count)
  }

  // MIXIN: NonDocumentTypeChildNode
  /* istanbul ignore next */
  get previousElementSibling(): Element | null { throw new Error("Mixin: NonDocumentTypeChildNode not implemented.") }
  /* istanbul ignore next */
  get nextElementSibling(): Element | null { throw new Error("Mixin: NonDocumentTypeChildNode not implemented.") }

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