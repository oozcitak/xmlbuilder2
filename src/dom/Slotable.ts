import { DOMException } from './DOMException'
import { Text } from './Text'
import { Element } from './Element'
import { Utility } from './Utility'

/**
 * Represents a mixin that allows nodes to become the contents of
 * a <slot> element. This mixin is implemented by {@link Element} and
 * {@link Text}.
 */
class Slotable {

  /**
   * Returns the <slot> element which this node is inserted in.
   * 
   * This method is not supported by this module.
   */
  assignedSlot: undefined
}

// Apply mixins
Utility.Internal.applyMixin(Text, Slotable)
Utility.Internal.applyMixin(Element, Slotable)
