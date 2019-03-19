import {
  Event, EventListener, EventTarget, EventListenerEntry
} from './interfaces'

/**
 * Represents a generic XML node.
 */
export abstract class EventTargetImpl implements EventTarget {

  protected _listeners: { [key: string]: Array<EventListenerEntry> } = { }

  /**
   * Initializes a new instance of `EventTarget`.
   */
  protected constructor() { }

  /**
   * Registers an event handler.
   * 
   * @param type - event type to listen for.
   * @param callback - object to receive a notification when an event occurs.
   * @param options - object that specifies event characteristics.
   */
  addEventListener(type: string,
    callback: | EventListener | null | ((event: Event) => void),
    options?: { passive: false, once: false, capture: false } | boolean): void {
      
    // flatten options
    let capture = false
    let passive = false
    let once = false
    if(typeof options === "boolean") {
      capture = <boolean>options
    }
    else if (options) {
      capture = options.capture || false
      passive = options.passive || false
      once = options.once || false
    }

    // convert callback function to EventListener, return if null
    let listenerCallback: EventListener
    if (!callback) {
      return
    } else if ((<EventListener>callback).handleEvent) {
      listenerCallback = <EventListener>callback
    } else {
      listenerCallback = { handleEvent: <((event: Event) => void)>callback }
    }

    // return if the listener is already defined
    for (const entry of this._listeners[type]) {
      if (entry.type === type && entry.callback === listenerCallback 
        && entry.capture === capture) {
        return
      }
    }

    // create an entry if it doesn't exist
    if (!(type in this._listeners)) {
      this._listeners[type] = [ ]
    }

    // add to listener array
    this._listeners[type].push({
      type: type,
      callback: listenerCallback,
      capture: capture,
      passive: passive,
      once: once,
      removed: false    
    })
  }

   /**
    * Removes an event listener.
    * 
    * @param type - event type to listen for.
    * @param callback - object to receive a notification when an event occurs.
    * @param options - object that specifies event characteristics.
    */
  removeEventListener(type: string,
    callback: | EventListener | null | ((event: Event) => void),
    options?: { capture: false } | boolean): void {

    // flatten options
    let capture = false
    if(typeof options === "boolean") {
      capture = <boolean>options
    }
    else if (options) {
      capture = options.capture || false
    }

    // convert callback function to EventListener, return if null
    let listenerCallback: EventListener
    if (!callback) {
      return
    } else if ((<EventListener>callback).handleEvent) {
      listenerCallback = <EventListener>callback
    } else {
      listenerCallback = { handleEvent: <((event: Event) => void)>callback }
    }
    
    // check if the listener is defined
    let i = 0
    let index = -1
    for (const entry of this._listeners[type]) {
      if (entry.type === type && entry.callback === listenerCallback 
        && entry.capture === capture) {
        index = i
        break
      }
      i++
    }

    // remove from list
    if (index !== -1)
      this._listeners[type].slice(index, 1)
  }

   /**
    * Dispatches an event to this event target.
    * 
    * @param event - the event to dispatch.
    */
  dispatchEvent(event: Event): boolean {
    return false
  }
}
