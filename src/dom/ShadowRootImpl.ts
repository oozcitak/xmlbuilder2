import { Element, Document, ShadowRootMode } from "./interfaces"
import { DocumentFragmentImpl } from "./DocumentFragmentImpl"
import { ShadowRootInternal } from "./interfacesInternal"

/**
 * Represents a shadow root.
 */
export class ShadowRootImpl extends DocumentFragmentImpl implements ShadowRootInternal {

  _host: Element
  _mode: ShadowRootMode

  /**
   * Initializes a new instance of `ShadowRoot`.
   *
   * @param ownerDocument - the owner document
   */
  constructor(ownerDocument: Document | null,
    host: Element, mode: ShadowRootMode) {
    super(ownerDocument)

    this._host = host
    this._mode = mode
  }

  /** 
   * Gets the shadow root's mode.
   */
  get mode(): ShadowRootMode { return this._mode }

  /** 
   * Gets the shadow root's host.
   */
  get host(): Element { return this._host }

  // MIXIN: DocumentOrShadowRoot
  // No elements
}
