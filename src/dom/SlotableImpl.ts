import { HTMLSlotElement } from '../htmldom/interfaces'
import { SlotableInternal, ElementInternal } from './interfacesInternal'
import { TreeQuery } from './util/TreeQuery'
import { Guard } from './util/Guard'
import { Cast } from './util/Cast'

/**
 * Represents a mixin that allows nodes to become the contents of
 * a <slot> element. This mixin is implemented by {@link Element} and
 * {@link Text}.
 */
export class SlotableImpl implements SlotableInternal {

  _name: string = ''
  _assignedSlot: HTMLSlotElement | null = null

  /**
   * Returns the <slot> element which this node is inserted in.
   */
  get assignedSlot(): HTMLSlotElement | null {
    return SlotableImpl.findSlot(this, true)
  }

  /**
   * Finds a slot for the given slotable.
   * 
   * @param slotable - a slotable
   * @param openFlag - `true` to search open shadow tree's only
   */
  protected static findSlot(slotable: SlotableInternal, openFlag: boolean): HTMLSlotElement | null {
    const node = Cast.asNode(slotable)
    const parent = <ElementInternal>node.parentNode
    if (parent === null) return null
    const shadow = parent._shadowRoot
    if (shadow === null) return null
    if (openFlag && shadow.mode !== "open") return null

    for (const child of TreeQuery.getDescendantElements(shadow, false, true)) {
      if (Guard.isSlot(child)) {
        if (child.name === slotable._name) return child
      }
    }

    return null
  }
}
