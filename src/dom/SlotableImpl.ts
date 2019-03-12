import { Slotable } from './interfaces'
import { DOMException } from './DOMException'

/**
 * Represents a mixin that allows nodes to become the contents of
 * a <slot> element. This mixin is implemented by {@link Element} and
 * {@link Text}.
 */
export class SlotableImpl implements Slotable {

  /**
   * Returns the <slot> element which this node is inserted in.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  get assignedSlot(): undefined { throw DOMException.NotSupportedError }

}
