import { Element } from "./Element"
import { Document } from "./Document"
import { DocumentFragment } from "./DocumentFragment"
import { DOMException } from "./DOMException"
import { Utility } from './Utility'
import { DocumentOrShadowRoot } from './DocumentOrShadowRoot'

/**
 * Represents a shadow root.
 */
export class ShadowRoot extends DocumentFragment {
  // ShadowRootMode
  static readonly Open = "open"
  static readonly Closed = "closed"

  /**
   * Initializes a new instance of `ShadowRoot`.
   *
   * @param ownerDocument - the owner document
   */
  protected constructor(ownerDocument: Document | null = null) {
    super(ownerDocument)
  }

  /** 
   * Gets the shadow root's mode.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  get mode(): string { throw DOMException.NotSupportedError }

  /** 
   * Gets the shadow root's host.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  get host(): Element { throw DOMException.NotSupportedError }
}

Utility.applyMixins(ShadowRoot, [DocumentOrShadowRoot])
