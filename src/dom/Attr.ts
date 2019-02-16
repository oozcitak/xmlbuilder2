import { Element } from "./Element";

/**
 * Represents an attribute of an element node.
 */
export class Attr {

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
   * @param namespaceURI - the namespace URI
   * @param prefix - the namespace prefix
   * @param localName - the local name of the element
   */
  public constructor (ownerElement: Element | null,
    namespaceURI: string | null, prefix: string, localName: string,
    value: string) 
  {
    this._namespaceURI = namespaceURI
    this._prefix = prefix
    this._localName = localName
    this._value = localName
    this._ownerElement = ownerElement
  }

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
}