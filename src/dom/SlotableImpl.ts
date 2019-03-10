import { Slotable } from './interfaces'
import { DOMExceptionImpl } from './DOMExceptionImpl';

/**
 * Represents a mixin that allows nodes to become the contents of
 * a <slot> element. This mixin is implemented by {@link Element} and
 * {@link Text}.
 */
export class SlotableImpl implements Slotable {

  /**
   * Returns the <slot> element which this node is inserted in.
   * 
   * This method is not supported by this module.
   */
  get assignedSlot(): undefined { return undefined }
  set assignedSlot(value: undefined) { throw new Error("This property is read-only.") }

}
