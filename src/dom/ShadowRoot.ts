import { Element } from "./Element"
import { Document } from "./Document"
import { DocumentFragment } from "./DocumentFragment"

/**
 * Represents a shadow root.
 */
export class ShadowRoot extends DocumentFragment {
  // mode
  static readonly Open = "open"
  static readonly Closed = "closed"

  protected _host: Element
  protected _mode: string
  
  /**
   * Initializes a new instance of `ShadowRoot`.
   *
   * @param ownerDocument - the owner document
   */
  protected constructor(ownerDocument: Document | null = null,
    host: Element, mode: string) {
    super(ownerDocument)

    this._host = host
    this._mode = mode
  }

  /** 
   * Gets the shadow root's mode.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  get mode(): string { return this._mode }

  /** 
   * Gets the shadow root's host.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  get host(): Element { return this._host }
}
