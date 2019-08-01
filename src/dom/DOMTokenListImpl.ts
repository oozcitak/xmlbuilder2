import { Element } from "./interfaces"
import { OrderedSet } from "./util/OrderedSet"
import { Convert } from "./util/Convert"
import { DOMException } from "./DOMException"
import { DOMTokenListInternal } from "./interfacesInternal"

/**
 * Represents a token set.
 */
export class DOMTokenListImpl implements DOMTokenListInternal {

  _element: Element
  _localName: string
  get _tokenSet(): Set<string> { return Convert.attValueToSet(this._element, this._localName) }

  /**
   * Initializes a new instance of `DOMTokenList`.
   *
   * @param ownerElement - the owner element
   * @param localName - the local name of the associated attribute
   */
  public constructor(ownerElement: Element, localName: string) {
    this._element = ownerElement
    this._localName = localName
  }

  /**
   * Returns the number of tokens.
   */
  get length(): number { 
    return Convert.attValueToSet(this._element, this._localName).size 
  }

  /**
   * Returns the token at the given index.
   * 
   * @param index - the index to of the token
   */
  item(index: number): string | null {
    const set = Convert.attValueToSet(this._element, this._localName)
    let i = 0
    for (const token of set) {
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
    return Convert.attValueToSet(this._element, this._localName).has(token)
  }

  /**
   * Adds the given tokens to the set.
   * 
   * @param tokens - the list of tokens to add
   */
  add(...tokens: string[]): void {
    const set = Convert.attValueToSet(this._element, this._localName)
    for (const token of tokens) {
      set.add(token)
    }
    Convert.setToAttValue(this._element, this._localName, set)
  }

  /**
   * Removes the given tokens from the set.
   * 
   * @param tokens - the list of tokens to remove
   */
  remove(...tokens: string[]): void {
    const set = Convert.attValueToSet(this._element, this._localName)
    for (const token of tokens) {
      if (!token)
        throw DOMException.SyntaxError
      else if (token.match(OrderedSet.WhiteSpace))
        throw DOMException.InvalidCharacterError
      else
        set.delete(token)
    }
    Convert.setToAttValue(this._element, this._localName, set)
  }

  /**
   * Removes a given token from the set and returns `false` if it exists,
   * otherwise adds the token and returns `true`.
   * 
   * @param token - the token to toggle
   * @param force - if `false` the token will only be removed but not
   * added again. Otherwise, if `true` the token will only be added but
   * not removed again.
   * 
   * @returns `false` if the token is not in the list after the call, 
   * or `true` if the token is in the list after the call.
   */
  toggle(token: string, force: boolean | undefined = undefined): boolean {
    if (force === undefined) {
      const set = Convert.attValueToSet(this._element, this._localName)
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

    const set = Convert.attValueToSet(this._element, this._localName)
    if (!set.has(token)) {
      return false
    } else {
      set.delete(token)
      set.add(newToken)
      Convert.setToAttValue(this._element, this._localName, set)
      return true
    }
  }

  /**
   * Determines if a given token is in the associated attribute's
   * supported tokens.
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
    return OrderedSet.serialize(
      Convert.attValueToSet(this._element, this._localName))
  }
  set value(value: string) {
    Convert.setToAttValue(this._element, this._localName,
      OrderedSet.parse(value))
  }

  /**
   * Returns an iterator for tokens.
   */
  *[Symbol.iterator](): IterableIterator<string> {
    const set = Convert.attValueToSet(this._element, this._localName)
    yield* set
  }
}