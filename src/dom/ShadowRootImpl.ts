import { Element, Document, ShadowRoot, ShadowRootMode } from "./interfaces"
import { DocumentFragmentImpl } from "./DocumentFragmentImpl"

/**
 * Represents a shadow root.
 */
export class ShadowRootImpl extends DocumentFragmentImpl implements ShadowRoot {
  protected _host: Element
  protected _mode: "open" | "closed"

  /**
   * Initializes a new instance of `ShadowRoot`.
   *
   * @param ownerDocument - the owner document
   */
  constructor(ownerDocument: Document | null,
    host: Element, mode: "open" | "closed") {
    super(ownerDocument)

    this._host = host
    this._mode = mode
  }

  /** 
   * Gets the shadow root's mode.
   */
  get mode(): "open" | "closed" { return this._mode }

  /** 
   * Gets the shadow root's host.
   */
  get host(): Element { return this._host }

  // MIXIN: DocumentOrShadowRoot
  // No elements
}
