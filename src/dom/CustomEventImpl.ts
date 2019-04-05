import { CustomEvent, CustomEventInit } from './interfaces'
import { EventImpl } from './EventImpl'

/**
 * Represents a generic XML node.
 */
export class CustomEventImpl extends EventImpl implements CustomEvent {

  protected _detail: any = null

  /**
   * Initializes a new instance of `Event`.
   */
  constructor(type: string, eventInit?: CustomEventInit) {
    super(type, eventInit)
    if (eventInit) {
      this._detail = eventInit.detail || null
    }
  }

  /**
   *  Gets custom event data.
   */
  get detail(): any { return this._detail }

  /**
   * Initializes the value of an event.
   * 
   * @param type - the type of event.
   * @param bubbles - whether the event propagates in reverse.
   * @param cancelable - whether the event can be cancelled.
   * @param detail - custom event data
   */
  initCustomEvent(type: string, bubbles = false, cancelable = false, detail = null): void {
    if (this._dispatch) return

    this._type = type
    this._bubbles = bubbles
    this._cancelable = cancelable
    this._detail = detail
  }

}
