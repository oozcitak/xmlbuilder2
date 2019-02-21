import { Node } from "./Node"
import { Element } from "./Element"
import { Document } from "./Document"

/**
 * Represents an attribute of an element node.
 */
export class Attr extends Node {
  protected _namespaceURI: string | null
  protected _prefix: string | null
  protected _localName: string
  protected _value: string
  protected _ownerElement: Element | null

  /** 
   * Useless; always returns true 
   */
  readonly specified: boolean = true

  /**
   * Initializes a new instance of `Attr`.
   *
   * @param localName - the local name of the element
   * @param namespaceURI - the namespace URI
   * @param prefix - the namespace prefix
   */
  public constructor(ownerDocument: Document | null, 
    ownerElement: Element | null, localName: string,
    namespaceURI: string | null, prefix: string | null,
    value: string) {
    super(ownerDocument)

    this._ownerElement = ownerElement
    
    this._localName = localName
    this._namespaceURI = namespaceURI || null
    this._prefix = prefix || null
    this._value = value
  }


  /** 
   * Returns the type of node. 
   */
  get nodeType(): number { return Node.Attribute }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return this.name }

  /** 
   * Gets the owner element node.
   */
  get ownerElement(): Element | null { return this._ownerElement }

  /** 
   * Gets the namespace URI.
   */
  get namespaceURI(): string | null { return this._namespaceURI }

  /** 
   * Gets the namespace prefix.
   */
  get prefix(): string | null { return this._prefix }

  /** 
   * Gets the local name.
   */
  get localName(): string { return this._localName }

  /** 
   * If namespace prefix is not `null`, returns the concatenation of
   * namespace prefix, `":"`, and local name. Otherwise it returns the
   * local name.
   */
  get name(): string {
    return (this._prefix ?
      this._prefix + ':' + this.localName :
      this.localName)
  }

  /** 
   * Gets or sets the attribute value.
   */
  get value(): string { return this._value }
  set value(value: string) { this._value = value }

  /**
   * Returns a duplicate of this node, i.e., serves as a generic copy 
   * constructor for nodes. The duplicate node has no parent 
   * ({@link parentNode} returns `null`).
   *
   * @param document - new owner document
   * @param deep - if `true`, recursively clone the subtree under the 
   * specified node; if `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(document: Document | boolean | null = null,
    deep: boolean = false): Node {
    let ownerDocument = (typeof document === "boolean" ? null : document)
    deep = (typeof document === "boolean" ? document : false)

    return new Attr(ownerDocument, this.ownerElement,
      this.localName, this.namespaceURI, this.prefix, this.value)
  }

  /**
   * Returns the prefix for a given namespace URI, if present, and 
   * `null` if not.
   * 
   * @param namespace - the namespace to search
   */
  lookupPrefix(namespace: string | null): string | null {
    if (!namespace) return null

    if (this.ownerElement)
      return this.ownerElement.lookupPrefix(namespace)

    return null
  }

  /**
   * Returns the namespace URI for a given prefix if present, and `null`
   * if not.
   * 
   * @param prefix - the prefix to search
   */
  lookupNamespaceURI(prefix: string | null): string | null {
    if (!prefix) prefix = null

    if (this.ownerElement)
      return this.ownerElement.lookupNamespaceURI(prefix)

    return null
  }
}