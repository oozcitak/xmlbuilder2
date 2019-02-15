import { Node } from "./Node";

/**
 * Represents a generic text node.
 */
export abstract class CharacterData extends Node {

  /**
   * Initializes a new instance of `CharacterData`.
   *
   * @param parent - the parent node
   */
  protected constructor (parent: Node | null) 
  {
    super(parent)
  }
    
  private _data: string = ''

  /** 
   * Gets or sets the data associated with a {@link CharacterData} node.
   * For other node types returns `null`. 
   */
  get nodeValue(): string | null { return this.data }
  set nodeValue(value: string | null) { this.data = value || '' }

  /** 
   * Returns the concatenation of data of all the {@link CharacterData}
   * node descendants in tree order. When set, replaces the text 
   * contents of the node with the given value. 
   */
  get textContent(): string | null { return this.data }
  set textContent(value: string | null) { this.data = value || '' }

  /** 
   * Gets or sets the text data of the node. 
   */
  get data(): string { return this._data }
  set data(value: string) { this._data = value || '' }

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
}