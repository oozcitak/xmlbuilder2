import { Node } from "./Node"
import { Document } from "./Document"
import { Text } from "./Text"
import { Utility } from "./Utility"
import { Element } from "./Element"

/**
 * Represents a document fragment in the XML tree.
 */
export class DocumentFragment extends Node {

  /**
   * Initializes a new instance of `DocumentFragment`.
   *
   * @param ownerDocument - the owner document
   */
  public constructor(ownerDocument: Document | null) {
    super(ownerDocument)
  }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): number { return Node.DocumentFragment }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return '#document-fragment' }

  /** 
   * Gets or sets the concatenation of data of all the {@link Text}
   * node descendants in tree order. When set, replaces the text 
   * contents of the node with the given value. 
   */
  get textContent(): string | null {
    let str = ''
    for (const child of this._childNodes) {
      if (child.nodeType !== Node.Comment && child.nodeType !== Node.ProcessingInstruction) {
        const childContent = child.textContent
        if (childContent)
          str += childContent
      }
    }
    return str
  }
  set textContent(value: string | null) {
    const node = new Text(this.ownerDocument, value || '')
    Utility.Tree.Mutation.replaceAllNode(node, this)
  }

  /**
   * Returns a duplicate of this node, i.e., serves as a generic copy 
   * constructor for nodes. The duplicate node has no parent 
   * ({@link parentNode} returns `null`).
   *
   * @param deep - if `true`, recursively clone the subtree under the 
   * specified node; if `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(deep: boolean = false): Node {
    let clonedSelf = new DocumentFragment(this.ownerDocument)

    // clone child nodes
    if (deep) {
      for (let child of this.childNodes) {
        let clonedChild = child.cloneNode(deep)
        clonedSelf.appendChild(clonedChild)
      }
    }

    return clonedSelf
  }

  /**
   * Returns the prefix for a given namespace URI, if present, and 
   * `null` if not.
   * 
   * @param namespace - the namespace to search
   */
  lookupPrefix(namespace: string | null): string | null {
    return null
  }

  /**
   * Returns the namespace URI for a given prefix if present, and `null`
   * if not.
   * 
   * @param prefix - the prefix to search
   */
  lookupNamespaceURI(prefix: string | null): string | null {
    return null
  }

  /**
   * Returns an {@link Element}  who has an id attribute `elementId`.
   * 
   * @param elementId - the value of the `id` attribute to match
   */
  getElementById(elementId: string): Element | null { return null }
}
