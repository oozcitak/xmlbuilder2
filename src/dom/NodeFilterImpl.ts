import { Node, FilterResult } from "./interfaces"
import { NodeFilterInternal } from "./interfacesInternal"

/**
 * Represents a node filter.
 */
export class NodeFilterImpl implements NodeFilterInternal {

  static readonly FILTER_ACCEPT: number = 1
  static readonly FILTER_REJECT: number = 2
  static readonly FILTER_SKIP: number = 3

  static readonly SHOW_ALL: number = 0xffffffff
  static readonly SHOW_ELEMENT: number = 0x1
  static readonly SHOW_ATTRIBUTE: number = 0x2
  static readonly SHOW_TEXT: number = 0x4
  static readonly SHOW_CDATA_SECTION: number = 0x8
  static readonly SHOW_ENTITY_REFERENCE: number = 0x10
  static readonly SHOW_ENTITY: number = 0x20
  static readonly SHOW_PROCESSING_INSTRUCTION: number = 0x40
  static readonly SHOW_COMMENT: number = 0x80
  static readonly SHOW_DOCUMENT: number = 0x100
  static readonly SHOW_DOCUMENT_TYPE: number = 0x200
  static readonly SHOW_DOCUMENT_FRAGMENT: number = 0x400
  static readonly SHOW_NOTATION: number = 0x800

  protected _callback: (node: Node) => FilterResult

  /**
   * Initializes a new instance of `NodeFilter`.
   *
   * @param callback - the callback function
   */
  public constructor(callback: (node: Node) => FilterResult) {
    this._callback = callback
  }

  /** 
   * Callback function.
   */
  acceptNode(node: Node): FilterResult {
    return this._callback(node)
  }
}