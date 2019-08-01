import { Element, Node } from "../dom/interfaces"

/**
 * Represents a html element node.
 */
export interface HTMLElement extends Element {
  /**
   * Reflects the title content attribute.
   */
  title: string
  /**
   * Specifies the primary language for the element's contents and for any of
   * the element's attributes that contain text. Its value must be a valid
   * BCP 47 language tag, or the empty string. Setting the attribute to the
   * empty string indicates that the primary language is unknown.
   */
  lang: string
  /**
   * Specifies whether an element's attribute values and the values of its 
   * Text node children are to be translated when the page is localized, or
   * whether to leave them unchanged.
   */
  translate: boolean
  /**
   * Specifies the element's text directionality.
   * - ltr - contents of the element are left-to-right text.
   * - rtl - contents of the element are right-to-left text.
   * - auto - contents of the element are explicitly directionally isolated 
   * text, but that the direction is to be determined programmatically
   * using the contents of the element.
   */
  dir: "ltr" | "rtl" | "auto"

  /**
   * Reflects the content attribute of the same name.
   */
  hidden: boolean
  /**
   * Acts as if the element was clicked.
   */
  click(): void
  /**
   * Reflects the accesskey content attribute.
   */
  accessKey: string
  /**
   * Returns a string that represents the element's assigned access key, if any.
   * If the element does not have one, then returns the empty string.
   */
  readonly accessKeyLabel: string
  /**
   * Controls whether or not the element is draggable.
   */
  draggable: boolean
  /**
   * Returns true if the element is to have its spelling and grammar checked; 
   * otherwise, returns false. Can be set, to override the default and set
   * the spellcheck content attribute.
   */
  spellcheck: boolean
  /**
   * Gets or sets the current autocapitalization state for the element,
   * or an empty string if it hasn't been set. 
   */
  autocapitalize: "" | "off" | "none" | "on" | "sentences" | "words" | "characters"
  /**
   * Returns the element's text content "as rendered". Can be set, to replace
   * the element's children with the given value, but with line breaks converted
   * to `<br>` elements.
   */
  innerText: string
  /**
   * Returns an ElementInternals object targeting the custom element element. 
   * Throws an exception if element is not a custom element, if the "internals"
   * feature was disabled as part of the element definition, or if it is called
   * twice on the same element.
   */
  attachInternals(): ElementInternals
};

/**
 * Represents a `<slot>` element.
 */
export interface HTMLSlotElement extends HTMLElement {
  name: string
  assignedNodes(options?: AssignedNodesOptions): Node[]
  assignedElements(options?: AssignedNodesOptions): Element[]
}

/**
 * Represents options to use while getting assigned nodes.
 */
export interface AssignedNodesOptions {
  flatten?: boolean
}

/**
 * TODO: Implementation
 */
export interface ElementInternals {

}