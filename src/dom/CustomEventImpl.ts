import { CustomEventInit } from './interfaces'
import { EventImpl } from './EventImpl'
import { CustomEventInternal } from './interfacesInternal'

/**
 * Represents and event that carries custom data.
 */
export class CustomEventImpl extends EventImpl implements CustomEventInternal {

  protected _detail: any = null

  /**
   * Initializes a new instance of `CustomEvent`.
   */
  constructor(type: string, eventInit?: CustomEventInit) {
    super(type, eventInit)

    this._detail = (eventInit && eventInit.detail) || null
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
    if (this._dispatchFlag) return

    EventImpl._initialize(this, type, bubbles, cancelable)

    this._detail = detail
  }

}
