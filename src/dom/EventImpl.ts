import {
  Event, EventInit, EventTarget, EventPhase, PotentialEventTarget, EventPathItem
} from './interfaces'
import { EventInternal } from './interfacesInternal'

/**
 * Represents a DOM event.
 */
export class EventImpl implements EventInternal {

  static readonly NONE: number = 0
  static readonly CAPTURING_PHASE: number = 1
  static readonly AT_TARGET: number = 2
  static readonly BUBBLING_PHASE: number = 3

  _target: PotentialEventTarget = null
  _relatedTarget: PotentialEventTarget = null
  _touchTargetList: PotentialEventTarget[] = []
  _path: EventPathItem[] = []
  _currentTarget: PotentialEventTarget = null
  _eventPhase: EventPhase = EventPhase.None

  _stopPropagationFlag: boolean = false
  _stopImmediatePropagationFlag: boolean = false
  _canceledFlag: boolean = false
  _inPassiveListenerFlag: boolean = false
  _composedFlag: boolean = false
  _initializedFlag: boolean = false
  _dispatchFlag: boolean = false

  _isTrustedFlag: boolean = false
  
  _type: string
  protected _bubbles: boolean = false
  protected _cancelable: boolean = false
  protected _timeStamp: number

  /**
   * Initializes a new instance of `Event`.
   */
  constructor(type: string, eventInit?: EventInit) {
    this._type = type
    if (eventInit) {
      this._bubbles = eventInit.bubbles || false
      this._cancelable = eventInit.cancelable || false
      this._composedFlag = eventInit.composed || false
    }
    this._initializedFlag = true
    this._timeStamp = new Date().getTime()
  }

  /**
   * Returns the type of event.
   */
  get type(): string { return this._type }

  /**
   * Returns the object to which event is dispatched (its target).
   */
  get target(): EventTarget | null { return this._target }

  /**
   * Historical alias of target.
   */
  get srcElement(): EventTarget | null { return this._target }

  /**
   * Returns the object whose event listener's callback is currently
   * being invoked.
   */
  get currentTarget(): EventTarget | null { return this._currentTarget }

  /**
   * Returns the event's path (objects on which listeners will be 
   * invoked). This does not include nodes in shadow trees if the 
   * shadow root was created with its `mode` `"closed"`.
   */
  composedPath(): EventTarget[] {

    const composedPath: EventTarget[] = []

    const path = this._path

    if (path.length == 0) return composedPath

    const currentTarget = this.currentTarget
    if (currentTarget === null) {
      throw new Error("Event currentTarget is null.")
    }
    composedPath.push(currentTarget)

    let currentTargetIndex = 0
    let currentTargetHiddenSubtreeLevel = 0

    let index = path.length - 1
    while (index >= 0) {
      if (path[index].rootOfClosedTree) {
        currentTargetHiddenSubtreeLevel++
      }
      if (path[index].invocationTarget === currentTarget) {
        currentTargetIndex = index
        break
      }
      if (path[index].slotInClosedTree) {
        currentTargetHiddenSubtreeLevel--
      }
      index--
    }

    let currentHiddenLevel = currentTargetHiddenSubtreeLevel
    let maxHiddenLevel = currentTargetHiddenSubtreeLevel

    index = currentTargetIndex - 1
    while (index >= 0) {
      if (path[index].rootOfClosedTree) {
        currentHiddenLevel++
      }

      if (currentHiddenLevel <= maxHiddenLevel) {
        composedPath.unshift(path[index].invocationTarget)
      }

      if (path[index].slotInClosedTree) {
        currentHiddenLevel--
        if (currentHiddenLevel < maxHiddenLevel) {
          maxHiddenLevel = currentHiddenLevel
        }
      }

      index--
    }

    currentHiddenLevel = currentTargetHiddenSubtreeLevel
    maxHiddenLevel = currentTargetHiddenSubtreeLevel
    index = currentTargetIndex + 1

    while (index < path.length) {
      if (path[index].slotInClosedTree) {
        currentHiddenLevel++
      }

      if (currentHiddenLevel <= maxHiddenLevel) {
        composedPath.push(path[index].invocationTarget)
      }

      if (path[index].rootOfClosedTree) {
        currentHiddenLevel--
        if (currentHiddenLevel < maxHiddenLevel) {
          maxHiddenLevel = currentHiddenLevel
        }
      }

      index++
    }

    return composedPath
  }

  /**
   * Returns the event's phase.
   */
  get eventPhase(): EventPhase { return this._eventPhase }

  /**
   * Prevents event from reaching any objects other than the current 
   * object.
   */
  stopPropagation(): void { this._stopPropagationFlag = true }

  /**
   * Historical alias of `stopPropagation()`.
   */
  get cancelBubble(): boolean { return this._stopPropagationFlag }
  set cancelBubble(value: boolean) { if (value) this.stopPropagation() }

  /**
   * Prevents event from reaching any registered event listeners after 
   * the current one finishes running.
   */
  stopImmediatePropagation(): void {
    this._stopPropagationFlag = true
    this._stopImmediatePropagationFlag = true
  }

  /**
   * Returns `true` if the event goes through its target's ancestors in
   * reverse tree order, and `false` otherwise.
   */
  get bubbles(): boolean { return this._bubbles }

  /**
   * A historical alias of `stopPropagation()`.
   */
  get cancelable(): boolean { return this._cancelable }

  /**
   * Historical property.
   */
  get returnValue(): boolean { return !this._canceledFlag }
  set returnValue(value: boolean) { if (!value) EventImpl._setCanceled(this) }

  /**
   * Cancels the event (if it is cancelable).
   */
  preventDefault(): void { EventImpl._setCanceled(this) }

  /**
   * Indicates whether the event was cancelled with `preventDefault()`.
   */
  get defaultPrevented(): boolean { return this._canceledFlag }

  /**
   * Determines whether the event can bubble to the shadow DOM.
   */
  get composed(): boolean { return this._composedFlag }

  /**
   * Returns `true` if event was dispatched by the user agent, and
   * `false` otherwise.
   */
  get isTrusted(): boolean { return this._isTrustedFlag }

  /**
   * Returns the the number of milliseconds measured relative to the
   * time origin.
   */
  get timeStamp(): number { return this._timeStamp }

  /**
   * Historical method to initializes the value of an event.
   * 
   * @param type - the type of event.
   * @param bubbles - whether the event propagates in reverse.
   * @param cancelable - whether the event can be cancelled.
   */
  initEvent(type: string, bubbles = false, cancelable = false): void {
    if (this._dispatchFlag) return

    EventImpl._initialize(this, type, bubbles, cancelable)
  }

  /**
   * Sets the canceled flag of an event.
   * 
   * @param event - an event
   */
  protected static _setCanceled(event: Event): void {
    const impl = <EventImpl>event

    if (impl._cancelable && !impl._inPassiveListenerFlag) {
      impl._canceledFlag = true
    }
  }

  /**
   * Initializes the value of an event.
   * 
   * @param event - an event to initialize
   * @param type - the type of event
   * @param bubbles - whether the event propagates in reverse
   * @param cancelable - whether the event can be cancelled
   */
  protected static _initialize(event: Event, type: string, bubbles: boolean, cancelable: boolean): void {
    const impl = <EventImpl>event

    impl._initializedFlag = true
    impl._stopPropagationFlag = false
    impl._stopImmediatePropagationFlag = false
    impl._canceledFlag = false
    impl._isTrustedFlag = false
    impl._target = null

    impl._type = type
    impl._bubbles = bubbles
    impl._cancelable = cancelable
  }
}
