import {
  Event, EventListener, EventTarget, AddEventListenerOptions,
  EventListenerOptions, EventPathItem, EventPhase, PotentialEventTarget,
  EventListenerEntry
} from './interfaces'
import { isBoolean } from '../util'
import { DOMException } from './DOMException'
import { TreeQuery } from './util/TreeQuery'
import { Guard } from './util/Guard'
import { EventTargetInternal, EventInternal } from './interfacesInternal'

/**
 * Defines a boolean out variable of a function.
 */
type OutputFlag = {
  value: boolean
}

/**
 * Represents a target to which an event can be dispatched.
 */
export abstract class EventTargetImpl implements EventTargetInternal {

  _eventListenerList: EventListenerEntry[] = []

  /**
   * Initializes a new instance of `EventTarget`.
   */
  constructor() { }

  /**
   * Registers an event handler.
   * 
   * @param type - event type to listen for.
   * @param callback - object to receive a notification when an event occurs.
   * @param options - object that specifies event characteristics.
   */
  addEventListener(type: string,
    callback: EventListener | null | ((event: Event) => void),
    options: AddEventListenerOptions | boolean = { passive: false, once: false, capture: false }): void {

    // flatten options
    const [capture, passive, once] = EventTargetImpl._flattenMore(options)

    // convert callback function to EventListener, return if null
    let listenerCallback: EventListener
    if (!callback) {
      return
    } else if ((<EventListener>callback).handleEvent) {
      listenerCallback = <EventListener>callback
    } else {
      listenerCallback = { handleEvent: <((event: Event) => void)>callback }
    }

    // add to listener list
    EventTargetImpl._addEventListener(this, {
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
    callback: EventListener | null | ((event: Event) => void),
    options: EventListenerOptions | boolean = { capture: false }): void {

    // flatten options
    const capture = EventTargetImpl._flatten(options)

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
    for (const entry of this._eventListenerList) {
      if (entry.type === type && entry.callback === listenerCallback
        && entry.capture === capture) {
        index = i
        EventTargetImpl._removeEventListener(this, entry, index)
        break
      }
      i++
    }
  }

  /**
   * Dispatches an event to this event target.
   * 
   * @param event - the event to dispatch.
   */
  dispatchEvent(event: EventInternal): boolean {
    if (event._dispatchFlag || !event._initializedFlag) {
      throw DOMException.InvalidStateError
    }
    event._isTrustedFlag = false

    return EventTargetImpl._dispatchEvent(event, this)
  }

  /**
   * Gets the parent event target for the given event.
   * 
   * @param event - an event
   */
  _getTheParent(event: Event): EventTarget | null {
    return null
  }

  /**
   * Defines optional activation behavior for the given event.
   * 
   * _Note:_ This exists because user agents perform certain actions for certain
   * EventTarget objects, e.g., the area element, in response to synthetic
   * MouseEvent events whose type attribute is click. Web compatibility
   * prevented it from being removed and it is now the enshrined way of
   * defining an activation of something.
   * 
   * @param event - an event
   */
  _activationBehavior?(event: Event): void

  /**
   * Defines optional legacy pre-activation behavior for the given event.
   *
   * _Note:_ These algorithms only exist for checkbox and radio input elements
   * and are not to be used for anything else.
   * 
   * @param event - an event
   */
  _legacyPreActivationBehavior?(event: Event): void

  /**
   * Defines optional legacy canceled activation behavior for the given event.
   *
   * _Note:_ These algorithms only exist for checkbox and radio input elements
   * and are not to be used for anything else.
   * 
   * @param event - an event
   */
  _legacyCanceledActivationBehavior?(event: Event): void

  /**
   * Flattens the given options argument.
   * 
   * @param options - options argument
   */
  protected static _flatten(options: EventListenerOptions | boolean): boolean {
    if (isBoolean(options)) {
      return options
    } else {
      return options.capture || false
    }
  }

  /**
   * Flattens the given options argument.
   * 
   * @param options - options argument
   */
  protected static _flattenMore(options: AddEventListenerOptions | boolean): [boolean, boolean, boolean] {
    const capture = EventTargetImpl._flatten(options)
    let once = false
    let passive = false
    if (!isBoolean(options)) {
      once = options.once || false
      passive = options.passive || false
    }
    return [capture, passive, once]
  }

  /**
   * Adds a new event listener.
   * 
   * @param eventTarget - event target
   * @param listener - event listener
   */
  protected static _addEventListener(eventTarget: EventTarget,
    listener: EventListenerEntry): void {

    if (listener.callback === null) return

    const impl = <EventTargetImpl>eventTarget

    // return if the listener is already defined
    for (const entry of impl._eventListenerList) {
      if (entry.type === listener.type && entry.callback === listener.callback
        && entry.capture === listener.capture) {
        return
      }
    }

    // add to listener list
    impl._eventListenerList.push(listener)
  }

  /**
   * Removes an event listener.
   * 
   * @param eventTarget - event target
   * @param listener - event listener
   */
  protected static _removeEventListener(eventTarget: EventTarget,
    listener: EventListenerEntry, index: number = -1): void {

    listener.removed = true

    const impl = <EventTargetImpl>eventTarget

    // check if the listener is defined
    if (index === -1) {
      let i = 0
      for (const entry of impl._eventListenerList) {
        if (entry.type === listener.type && entry.callback === listener.callback
          && entry.capture === listener.capture) {
          index = i
          break
        }
        i++
      }
    }

    // remove from list
    if (index !== -1) {
      impl._eventListenerList.slice(index, 1)
    }
  }

  /**
   * Removes all event listeners.
   * 
   * @param eventTarget - event target
   */
  protected static _removeAllEventListeners(eventTarget: EventTarget): void {
    const impl = <EventTargetImpl>eventTarget

    // check if the listener is defined
    for (const entry of impl._eventListenerList) {
      entry.removed = true
    }

    // empty list
    impl._eventListenerList = []
  }

  /**
   * Dispatches an event to an event target.
   * 
   * @param event - the event to dispatch
   * @param target - event target
   * @param legacyTargetOverrideFlag - legacy target override flag
   * @param legacyOutputDidListenersThrowFlag - legacy output flag that returns
   * whether the event listener's callback threw an exception
   */
  protected static _dispatchEvent(event: EventInternal,
    target: EventTargetInternal,
    legacyTargetOverrideFlag: boolean = false,
    legacyOutputDidListenersThrowFlag: OutputFlag = { value: false }): boolean {

    let clearTargets = false

    /**
     * 1. Set event's dispatch flag.
     */
    event._dispatchFlag = true

    /** 
     * 2. Let targetOverride be target, if legacy target override flag is not
     * given, and target's associated Document otherwise.
     * 
     * _Note:_ legacy target override flag is only used by HTML and only when
     * target is a Window object.
     * 
     * TODO: Check legacyTargetOverrideFlag if target is Window 
     */
    const targetOverride: EventTarget = target

    /** 
     * 3. Let activationTarget be null.
     * 4. Let relatedTarget be the result of retargeting event's relatedTarget 
     * against target.
     * 5. If target is not relatedTarget or target is event's relatedTarget, 
     * then:
    */
    let activationTarget: EventTarget | null = null
    let relatedTarget = TreeQuery.retarget(event._relatedTarget, target) as EventTarget

    if (target !== relatedTarget || target === event._relatedTarget) {
      /**
       * 5.1. Let touchTargets be a new list.
       * 5.2. For each touchTarget of event's touch target list, append the 
       * result of retargeting touchTarget against target to touchTargets.
       * 5.3. Append to an event path with event, target, targetOverride, 
       * relatedTarget, touchTargets, and false.
       * 5.4. Let isActivationEvent be true, if event is a MouseEvent object 
       * and event's type attribute is "click", and false otherwise.
       * 5.5. If isActivationEvent is true and target has activation behavior, 
       * then set activationTarget to target.
       * 5.6. Let slotable be target, if target is a slotable and is assigned, 
       * and null otherwise.
       * 5.7. Let slot-in-closed-tree be false.
       * 5.8. Let parent be the result of invoking target's get the parent with
       * event.
       */
      let touchTargets = []
      for (const touchTarget of event._touchTargetList) {
        touchTargets.push(TreeQuery.retarget(touchTarget, target))
      }

      const isActivationEvent = (Guard.isMouseEvent(event) && event.type === "click")
      if (isActivationEvent && target._activationBehavior !== undefined) {
        activationTarget = target
      }

      let slotable: EventTarget | null =
        (Guard.isSlotable(target) && target._assignedSlot !== null) ?
          target : null

      let slotInClosedTree = false
      let parent: EventTargetInternal | null = <EventTargetInternal>target._getTheParent(event)

      /**
       * 5.9. While parent is non-null:
       */
      while (parent !== null) {
        /**
         * 5.9.1 If slotable is non-null:
         * 5.9.1.1. Assert: parent is a slot.
         * 5.9.1.2. Set slotable to null.
         * 5.9.1.3. If parent's root is a shadow root whose mode is "closed",
         * then set slot-in-closed-tree to true.
         */
        if (slotable !== null) {
          if (!Guard.isSlot(parent)) {
            throw new Error("Parent node of a slotable should be a slot.")
          }
          slotable = null
          const root = TreeQuery.rootNode(parent, true)
          if (Guard.isShadowRoot(root) && root.mode === "closed") {
            slotInClosedTree = true
          }
        }

        /**
         * 5.9.2 If parent is a slotable and is assigned, then set slotable to 
         * parent.
         * 5.9.3. Let relatedTarget be the result of retargeting event's 
         * relatedTarget against parent.
         * 5.9.4. Let touchTargets be a new list.
         * 5.9.4. For each touchTarget of event's touch target list, append the 
         * result of retargeting touchTarget against parent to touchTargets.
         */
        if (Guard.isSlotable(parent) && parent._assignedSlot !== null) {
          slotable = parent
        }
        relatedTarget = TreeQuery.retarget(event._relatedTarget, parent)

        touchTargets = []
        for (const touchTarget of event._touchTargetList) {
          touchTargets.push(TreeQuery.retarget(touchTarget, parent))
        }

        /**
         * 5.9.6. If parent is a Window object, or parent is a node and target's 
         * root is a shadow-including inclusive ancestor of parent, then:
         */
        if (Guard.isWindow(parent) || (Guard.isNode(parent) && Guard.isNode(target) &&
          TreeQuery.isAncestorOf(TreeQuery.rootNode(target, true), parent, true, true))) {
          /**
           * 5.9.6.1. If isActivationEvent is true, event's bubbles attribute
           * is true, activationTarget is null, and parent has activation
           * behavior, then set activationTarget to parent.
           * 5.9.6.2. Append to an event path with event, parent, null, 
           * relatedTarget, touchTargets, and slot-in-closed-tree.
           */
          if (isActivationEvent && event.bubbles && activationTarget === null &&
            parent._activationBehavior) {
            activationTarget = parent
          }
          EventTargetImpl._appendToEventPath(event, parent, null,
            relatedTarget, touchTargets, slotInClosedTree)
        } else if (parent === relatedTarget) {
          /**
           * 5.9.7. Otherwise, if parent is relatedTarget, 
           * then set parent to null.
           */
          parent = null
        } else {
          /**
           * 5.9.8. Otherwise, set target to parent and then:
           * 5.9.8.1. If isActivationEvent is true, activationTarget is null,
           * and target has activation behavior, then set activationTarget
           * to target.
           * 5.9.8.2. Append to an event path with event, parent, target, 
           * relatedTarget, touchTargets, and slot-in-closed-tree.
           */
          target = parent
          if (isActivationEvent && activationTarget === null &&
            target._activationBehavior) {
            activationTarget = target
          }
          EventTargetImpl._appendToEventPath(event, parent, target,
            relatedTarget, touchTargets, slotInClosedTree)
        }

        /**
         * 5.9.9. If parent is non-null, then set parent to the result of 
         * invoking parent's get the parent with event.
         * 5.9.10. Set slot-in-closed-tree to false.
         */
        if (parent !== null) {
          parent = <EventTargetInternal>parent._getTheParent(event)
        }
        slotInClosedTree = false
      }

      /**
       * 5.10. Let clearTargetsStruct be the last struct in event's path whose
       * shadow-adjusted target is non-null.
       */
      let clearTargetsStruct: EventPathItem | null = null
      const path: EventPathItem[] = event._path
      let i = path.length - 1
      while (i >= 0) {
        const struct = path[i]
        if (struct.shadowAdjustedTarget !== null) {
          clearTargetsStruct = struct
          break
        }
        i--
      }

      /**
       * 5.11. Let clearTargets be true if clearTargetsStruct's shadow-adjusted
       * target, clearTargetsStruct's relatedTarget, or an EventTarget object
       * in clearTargetsStruct's touch target list is a node and its root is
       * a shadow root, and false otherwise.
       */
      if (clearTargetsStruct !== null) {
        if (Guard.isNode(clearTargetsStruct.shadowAdjustedTarget) &&
          Guard.isShadowRoot(TreeQuery.rootNode(clearTargetsStruct.shadowAdjustedTarget, true))) {
          clearTargets = true
        } else if (Guard.isNode(clearTargetsStruct.relatedTarget) &&
          Guard.isShadowRoot(TreeQuery.rootNode(clearTargetsStruct.relatedTarget, true))) {
          clearTargets = true
        } else {
          for (const struct of clearTargetsStruct.touchTargetList) {
            if (Guard.isNode(struct) &&
              Guard.isShadowRoot(TreeQuery.rootNode(struct, true))) {
              clearTargets = true
              break
            }
          }
        }
      }

      /**
       * 5.12. If activationTarget is non-null and activationTarget has
       * legacy-pre-activation behavior, then run activationTarget's
       * legacy-pre-activation behavior.
       */
      const atImpl = activationTarget as EventTargetImpl
      if (activationTarget !== null &&
        atImpl._legacyPreActivationBehavior !== undefined) {
        atImpl._legacyPreActivationBehavior(event)
      }

      /**
       * 5.13. For each struct in event's path, in reverse order:
       */
      i = path.length - 1
      while (i >= 0) {
        const struct = path[i]
        /**
         * 5.13.1. If struct's shadow-adjusted target is non-null, then set 
         * event's eventPhase attribute to AT_TARGET.
         * 5.13.2. Otherwise, set event's eventPhase attribute to 
         * CAPTURING_PHASE.
         * 5.13.3. Invoke with struct, event, "capturing", and 
         * legacyOutputDidListenersThrowFlag if given.
         */
        if (struct.shadowAdjustedTarget !== null) {
          event._eventPhase = EventPhase.AtTarget
        } else {
          event._eventPhase = EventPhase.Capturing
        }

        EventTargetImpl._invokeEvent(struct, event, "capturing",
          legacyOutputDidListenersThrowFlag)

        i--
      }

      /**
       * 5.14. For each struct in event's path
       */
      for (const struct of path) {
        /**
         * 5.14.1. If struct's shadow-adjusted target is non-null, then set
         * event's eventPhase attribute to AT_TARGET.
         * 5.14.2. Otherwise:
         * 5.14.2.1. If event's bubbles attribute is false, then continue.
         * 5.14.2.2. Set event's eventPhase attribute to BUBBLING_PHASE.
         * 5.14.3. Invoke with struct, event, "bubbling", and 
         * legacyOutputDidListenersThrowFlag if given.
         */
        if (struct.shadowAdjustedTarget !== null) {
          event._eventPhase = EventPhase.AtTarget
        } else {
          if (!event.bubbles) continue
          event._eventPhase = EventPhase.Bubbling
        }

        EventTargetImpl._invokeEvent(struct, event, "bubbling",
          legacyOutputDidListenersThrowFlag)

        i--
      }
    }

    /**
     * 6. Set event's eventPhase attribute to NONE.
     * 7. Set event's currentTarget attribute to null.
     * 8. Set event's path to the empty list.
     * 9. Unset event's dispatch flag, stop propagation flag, and stop 
     * immediate propagation flag.
     */
    event._eventPhase = EventPhase.None
    event._currentTarget = null
    event._path = []
    event._dispatchFlag = false
    event._stopPropagationFlag = false
    event._stopImmediatePropagationFlag = false

    /**
     * 10. If clearTargets, then:
     * 10.1. Set event's target to null.
     * 10.2. Set event's relatedTarget to null.
     * 10.3. Set event's touch target list to the empty list.
     */
    if (clearTargets) {
      event._target = null
      event._relatedTarget = null
      event._touchTargetList = []
    }

    /**
     * 11. If activationTarget is non-null, then:
     * 11.1. If event's canceled flag is unset, then run activationTarget's 
     * activation behavior with event.
     * 11.2. Otherwise, if activationTarget has legacy-canceled-activation 
     * behavior, then run activationTarget's legacy-canceled-activation
     * behavior.
     */
    if (activationTarget !== null) {
      const atImpl = activationTarget as EventTargetImpl
      if (!event._canceledFlag && atImpl._activationBehavior !== undefined) {
        atImpl._activationBehavior(event)
      } else if (atImpl._legacyCanceledActivationBehavior !== undefined) {
        atImpl._legacyCanceledActivationBehavior(event)
      }
    }

    /**
     * 12. Return false if event's canceled flag is set, and true otherwise.
     */
    return !event._canceledFlag
  }

  /**
   * Appends a new struct to an event's path.
   * 
   * @param event - an event
   * @param invocationTarget - the target of the invocation 
   * @param shadowAdjustedTarget - shadow-root adjusted event target
   * @param relatedTarget - related event target
   * @param touchTargets - a list of touch targets
   * @param slotInClosedTree - if the target's parent is a closed shadow root
   */
  protected static _appendToEventPath(event: EventInternal,
    invocationTarget: EventTarget, shadowAdjustedTarget: PotentialEventTarget,
    relatedTarget: PotentialEventTarget, touchTargets: PotentialEventTarget[],
    slotInClosedTree: boolean): void {

    /**
     * 1. Let invocationTargetInShadowTree be false.
     * 2. If invocationTarget is a node and its root is a shadow root, then 
     * set invocationTargetInShadowTree to true.
     */
    let invocationTargetInShadowTree = false
    if (Guard.isNode(invocationTarget) &&
      Guard.isShadowRoot(TreeQuery.rootNode(invocationTarget))) {
      invocationTargetInShadowTree = true
    }

    /**
     * 3. Let root-of-closed-tree be false.
     * 4. If invocationTarget is a shadow root whose mode is "closed", then
     * set root-of-closed-tree to true.
     */
    let rootOfClosedTree = false
    if (Guard.isShadowRoot(invocationTarget) &&
      invocationTarget.mode === "closed") {
      rootOfClosedTree = true
    }

    /**
     * 5. Append a new struct to event's path whose invocation target is
     * invocationTarget, invocation-target-in-shadow-tree is
     * invocationTargetInShadowTree, shadow-adjusted target is
     * shadowAdjustedTarget, relatedTarget is relatedTarget,
     * touch target list is touchTargets, root-of-closed-tree is
     * root-of-closed-tree, and slot-in-closed-tree is slot-in-closed-tree.
     */
    const path: EventPathItem[] = event._path
    path.push({
      invocationTarget: invocationTarget,
      invocationTargetInShadowTree: invocationTargetInShadowTree,
      shadowAdjustedTarget: shadowAdjustedTarget,
      relatedTarget: relatedTarget,
      touchTargetList: touchTargets,
      rootOfClosedTree: rootOfClosedTree,
      slotInClosedTree: slotInClosedTree
    })
  }

  /**
   * Invokes an event.
   * 
   * @param struct - a struct defining event's path
   * @param event - the event to invoke
   * @param phase - event phase
   * @param legacyOutputDidListenersThrowFlag - legacy output flag that returns
   * whether the event listener's callback threw an exception
   */
  protected static _invokeEvent(struct: EventPathItem, event: EventInternal,
    phase: "capturing" | "bubbling",
    legacyOutputDidListenersThrowFlag: OutputFlag = { value: false }): void {

    /**
     * 1. Set event's target to the shadow-adjusted target of the last struct 
     * in event's path, that is either struct or preceding struct, whose 
     * shadow-adjusted target is non-null.
     */
    const path: EventPathItem[] = event._path
    let index = -1
    for (let i = 0; i < path.length; i++) {
      if (path[i] === struct) {
        index = i
        break
      }
    }
    if (index !== -1) {
      let item = path[index]
      if (item.shadowAdjustedTarget !== null) {
        event._target = item.shadowAdjustedTarget
      } else if (index > 0) {
        item = path[index - 1]
        if (item.shadowAdjustedTarget !== null) {
          event._target = item.shadowAdjustedTarget
        }
      }
    }

    /**
     * 2. Set event's relatedTarget to struct's relatedTarget.
     * 3. Set event's touch target list to struct's touch target list.
     * 4. If event's stop propagation flag is set, then return.
     * 5. Initialize event's currentTarget attribute to struct's invocation
     * target.
     * 6. Let listeners be a clone of event's currentTarget attribute value's
     * event listener list.
     * 
     * _Note:_ This avoids event listeners added after this point from being
     * run. Note that removal still has an effect due to the removed field.
     */
    event._relatedTarget = struct.relatedTarget
    event._touchTargetList = struct.touchTargetList
    if (event._stopPropagationFlag) return
    event._currentTarget = struct.invocationTarget
    const currentTarget = event._currentTarget as EventTargetInternal
    const targetListeners: EventListenerEntry[] = currentTarget._eventListenerList
    let listeners: EventListenerEntry[] = new Array(...targetListeners)

    /**
     * 7. Let found be the result of running inner invoke with event, listeners,
     * phase, and legacyOutputDidListenersThrowFlag if given.
     */
    const found = EventTargetImpl._innerInvokeEvent(event, listeners, phase,
      legacyOutputDidListenersThrowFlag)

    /**
     * 8. If found is false and event's isTrusted attribute is true, then:
     */
    if (!found && event.isTrusted) {
      /**
       * 8.1. Let originalEventType be event's type attribute value.
       * 8.2. If event's type attribute value is a match for any of the strings
       * in the first column in the following table, set event's type attribute
       * value to the string in the second column on the same row as the matching
       * string, and return otherwise.
       * 
       * Event type           | Legacy event type
       * -------------------------------------------------
       * "animationend"       | "webkitAnimationEnd"
       * "animationiteration" | "webkitAnimationIteration"
       * "animationstart"     | "webkitAnimationStart"
       * "transitionend"      | "webkitTransitionEnd"
       */
      const originalEventType: string = event._type
      if (originalEventType === "animationend") {
        event._type = "webkitAnimationEnd"
      } else if (originalEventType === "animationiteration") {
        event._type = "webkitAnimationIteration"
      } else if (originalEventType === "animationstart") {
        event._type = "webkitAnimationStart"
      } else if (originalEventType === "transitionend") {
        event._type = "webkitTransitionEnd"
      }

      /**
       * 8.3. Inner invoke with event, listeners, phase, and
       * legacyOutputDidListenersThrowFlag if given.
       * 8.4. Set event's type attribute value to originalEventType.
       */
      EventTargetImpl._innerInvokeEvent(event, listeners, phase,
        legacyOutputDidListenersThrowFlag)
      event._type = originalEventType
    }
  }

  /**
   * Invokes an event.
   * 
   * @param event - the event to invoke
   * @param listeners - event listeners
   * @param phase - event phase
   * @param legacyOutputDidListenersThrowFlag - legacy output flag that returns
   * whether the event listener's callback threw an exception
   */
  protected static _innerInvokeEvent(event: Event,
    listeners: EventListenerEntry[], phase: "capturing" | "bubbling",
    legacyOutputDidListenersThrowFlag: OutputFlag = { value: false }): boolean {

    /**
     * 1. Let found be false.
     * 2. For each listener in listeners, whose removed is false:
     */
    let found = false

    for (const listener of listeners) {
      if (!listener.removed) {
        /**
         * 2.1. If event's type attribute value is not listener's type, then
         * continue.
         * 2.2. Set found to true.
         * 2.3. If phase is "capturing" and listener's capture is false, then
         * continue.
         * 2.4. If phase is "bubbling" and listener's capture is true, then
         * continue.
         */
        if (event.type !== listener.type) continue
        found = true
        if (phase === "capturing" && !listener.capture) continue
        if (phase === "bubbling" && listener.capture) continue

        /**
         * 2.5. If listener's once is true, then remove listener from event's
         * currentTarget attribute value's event listener list.
         */
        if (listener.once && event.currentTarget !== null) {
          const impl = event.currentTarget as EventTargetImpl
          let index = -1
          for (let i = 0; i < impl._eventListenerList.length; i++) {
            if (impl._eventListenerList[i] === listener) {
              index = i
              break
            }
          }
          if (index !== -1) {
            impl._eventListenerList.splice(index, 1)
          }
        }

        /**
         * TODO: Set current global event of Window
         * 
         * 2.6. Let global be listener callback's associated Realm's global
         * object.
         * 2.7. Let currentEvent be undefined.
         * 2.8. If global is a Window object, then:
         * 2.8.1. Set currentEvent to global's current event.
         * 2.8.2. If struct's invocation-target-in-shadow-tree is false, then
         * set global's current event to event.
         */

        /**
         * 2.9. If listener's passive is true, then set event's in passive
         * listener flag.
         * 2.10. Call a user object's operation with listener's callback, 
         * "handleEvent", « event », and event's currentTarget attribute value.
         * If this throws an exception, then:
         * 2.10.1. Report the exception.
         * 2.10.2. Set legacyOutputDidListenersThrowFlag if given.
         * 
         * _Note:_ The legacyOutputDidListenersThrowFlag is only used by 
         * Indexed Database API.
         */
        const eventImpl = event as any
        if (listener.passive) eventImpl._inPassiveListener = true
        try {
          listener.callback.handleEvent.call(event.currentTarget, event)
        } catch (err) {
          /**
           * TODO: Report the error.
           * See: https://html.spec.whatwg.org/multipage/webappapis.html#runtime-script-errors-in-documents
           */
          legacyOutputDidListenersThrowFlag.value = true
        }

        /**
         * 2.11. Unset event's in passive listener flag.
         */
        if (listener.passive) eventImpl._inPassiveListener = false
        /**
         * TODO: Set current window's current event
         * 
         * 2.12. If global is a Window object, then set global's current event to currentEvent.
         */

        /**
         * 2.13. If event's stop immediate propagation flag is set, then return found.
         */
        if (eventImpl._stopImmediatePropagation) return found
      }
    }

    /**
     * 3. Return found.
     */
    return found
  }
}
