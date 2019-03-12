import { DOMTokenList, Element } from "./interfaces"
import { OrderedSet } from "./util/OrderedSet";
import { DOMException } from "./DOMException"

/**
 * Represents a token set.
 */
export class DOMTokenListImpl implements DOMTokenList {

  protected _ownerElement: Element
  protected _localName: string

  /**
   * Initializes a new instance of `DOMTokenList`.
   *
   * @param ownerElement - the owner element
   * @param localName - the local name of the associated attribute
   */
  public constructor(ownerElement: Element, localName: string) {
    this._ownerElement = ownerElement
    this._localName = localName
  }

  /**
   * Returns the number of tokens.
   */
  get length(): number { return this._valueAsSet.size }

  /**
   * Returns the token at the given index.
   * 
   * @param index - the index to of the token
   */
  item(index: number): string | null {
    let set = this._valueAsSet
    let i = 0
    for (let token of set) {
      if (i === index) return token
      i++
    }
    return null
  }

  /**
   * Returns true if the set contains the given token.
   * 
   * @param tokens - the token to check
   */
  contains(token: string): boolean {
    return this._valueAsSet.has(token)
  }

  /**
   * Adds the given tokens to the set.
   * 
   * @param tokens - the list of tokens to add
   */
  add(...tokens: Array<string>): void {
    let set = this._valueAsSet
    for (let token of tokens) {
      set.add(token)
    }
    this._valueAsSet = set
  }

  /**
   * Removes the given tokens from the set.
   * 
   * @param tokens - the list of tokens to remove
   */
  remove(...tokens: Array<string>): void {
    let set = this._valueAsSet
    for (let token of tokens) {
      if (!token)
        throw DOMException.SyntaxError
      else if (token.match(OrderedSet.WhiteSpace))
        throw DOMException.InvalidCharacterError
      else
        set.delete(token)
    }
    this._valueAsSet = set
  }

  /**
   * Removes a given token from the set and returns `false` if it exists,
   * otherwise adds the token and returns `true`.
   * 
   * @param token - the token to toggle
   * @param force - if `false` the token will only be removed but not
   * added again; otherwise if `true` the token will only be added but
   * not removed again.
   * 
   * @returns `false` if the token is not in the list after the call, 
   * or `true` if the token is in the list after the call.
   */
  toggle(token: string, force: boolean | undefined = undefined): boolean {
    if (force === undefined) {
      let set = this._valueAsSet
      if (set.has(token)) {
        this.remove(token)
        return false
      } else {
        this.add(token)
        return true
      }
    } else if (!force) {
      this.remove(token)
      return false
    } else {
      this.add(token)
      return true
    }
  }

  /**
   * Replaces the given token with a new token.
   * 
   * @param token - the token to replace
   * @param newToken - the new token
   * 
   * @returns `true` if `token` was replaced with `newToken`,
   * and `false` otherwise.
   */
  replace(token: string, newToken: string): boolean {
    if (!token || !newToken)
      throw DOMException.SyntaxError
    else if (token.match(OrderedSet.WhiteSpace) ||
      newToken.match(OrderedSet.WhiteSpace))
      throw DOMException.InvalidCharacterError

    let set = this._valueAsSet
    if (!set.has(token)) {
      return false
    } else {
      set.delete(token)
      set.add(newToken)
      this._valueAsSet = set
      return true
    }
  }

  /**
   * Determines if a given token is in the associated attribute's
   * supported tokens
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param token - the token to check
   */
  supports(token: string): boolean {
    throw new TypeError('DOMTokenList has no supported tokens.')
  }

  /**
   * Gets the value of the token list as a string, or sets the token
   * list to the given value.
   */
  get value(): string {
    return OrderedSet.serialize(Array.from(this._valueAsSet))
  }
  set value(value: string) {
    this._ownerElement.setAttribute(this._localName,
      OrderedSet.sanitize(value))
  }


  /**
   * Returns an iterator for tokens.
   */
  *[Symbol.iterator](): IterableIterator<string> {
    let set = this._valueAsSet
    yield* set
  }

  /**
   * Gets or sets a set of strings created from the associated
   * attribute's value by splitting at ASCII whitespace characters.
   */
  get _valueAsSet(): Set<string> {
    let attValue = this._ownerElement.getAttribute(this._localName) || ''
    let arr = OrderedSet.parse(attValue)
    return new Set(arr)
  }
  set _valueAsSet(set: Set<string>) {
    if (!this._ownerElement.hasAttribute(this._localName) && set.size === 0)
      return

    let arr = Array.from(set)
    let attValue = OrderedSet.serialize(arr)
    this._ownerElement.setAttribute(this._localName, attValue)
  }
}