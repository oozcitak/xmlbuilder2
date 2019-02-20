import { Node } from "./internal"

/**
 * Represents a node filter.
 */
export class NodeFilter {

  static readonly FilterAccept = 1
  static readonly FilterReject = 2
  static readonly FilterSkip = 3

  static readonly ShowAll = 0xffffffff
  static readonly ShowElement = 0x1
  static readonly ShowAttribute = 0x2
  static readonly ShowText = 0x4
  static readonly ShowCDataSection = 0x8
  static readonly ShowEntityReference = 0x10
  static readonly ShowEntity = 0x20
  static readonly ShowProcessingInstruction = 0x40
  static readonly ShowComment = 0x80
  static readonly ShowDocument = 0x100
  static readonly ShowDocumentType = 0x200
  static readonly ShowDocumentFragment = 0x400
  static readonly ShowNotation = 0x800

  protected _callback: (node: Node) => number

  /**
   * Initializes a new instance of `NodeFilter`.
   *
   * @param callback - the callback function
   */
  public constructor(callback: (node: Node) => number) {
    this._callback = callback
  }

  /** 
   * Callback function.
   */
  acceptNode(node: Node): number {
    return this._callback(node)
  }
}