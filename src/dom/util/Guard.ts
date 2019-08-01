import { NodeType } from '../interfaces'
import { HTMLSlotElement } from '../../htmldom/interfaces'
import { 
  SlotableInternal, NodeInternal, TextInternal, ElementInternal, ShadowRootInternal, CharacterDataInternal 
} from '../interfacesInternal'

/**
 * Contains user-defined type guards for DOM objects.
 */
export class Guard {

  /**
   * Determines if the given object is a `Node`.
   * 
   * @param a - the object to check
   */
  static isNode(a: any): a is NodeInternal {
    return (a.nodeType !== undefined)
  }


  /**
   * Determines if the given node is a `CharacterData` node.
   * 
   * @param a - the object to check
   */
  static isCharacterDataNode(a: any): a is CharacterDataInternal {
    const type = a.nodeType

    return (type === NodeType.Text ||
      type === NodeType.ProcessingInstruction ||
      type === NodeType.Comment ||
      type === NodeType.CData)
  }
  
  /**
   * Determines if the given object is a `Text`.
   * 
   * @param a - the object to check
   */
  static isTextNode(a: any): a is TextInternal {
    return (a.nodeType === NodeType.Text)
  }

  /**
   * Determines if the given object is an `Element`.
   * 
   * @param a - the object to check
   */
  static isElementNode(a: any): a is ElementInternal {
    return (a.nodeType === NodeType.Element)
  }

  /**
   * Determines if the given object is a `ShadowRoot`.
   * 
   * @param a - the object to check
   */
  static isShadowRoot(a: any): a is ShadowRootInternal {
    return (a.host !== undefined)
  }

  /**
   * Determines if the given object is a `MouseEvent`.
   * 
   * TODO: change return type to guard for `MouseEvent` when the HTML DOM 
   * is implemented.
   * 
   * @param a - the object to check
   */
  static isMouseEvent(a: any): boolean {
    return (a.screenX !== undefined)
  }

  /**
   * Determines if the given object is a slotable.
   * 
   * Element and Text nodes are slotables. A slotable has an associated name 
   * (a string).
   * 
   * @param a - the object to check
   */
  static isSlotable(a: any): a is SlotableInternal {
    return a.name !== undefined && (Guard.isTextNode(a) || Guard.isElementNode(a))
  }

  /**
   * Determines if the given object is a slot.
   * 
   * @param a - the object to check
   */
  static isSlot(a: any): a is HTMLSlotElement {
    return a.name !== undefined && a.assignedNodes !== undefined
  }


  /**
   * Determines if the given object is a `Window`.
   * 
   * TODO: change return type to guard for `Window` when the HTML DOM 
   * is implemented. 
   * 
   * @param a - the object to check
   */
  static isWindow(a: any): boolean {
    return a.navigator !== undefined
  }  
}