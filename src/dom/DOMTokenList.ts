import { Element } from "./Element"
import { DOMException } from "./DOMException"
import { Utility } from "./Utility"

/**
 * Represents a token set.
 */
export class DOMTokenList {

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
  get length(): number { return this.valueAsSet.size }

  /**
   * Returns the token at the given index.
   * 
   * @param index - the index to of the token
   */
  item(index: number): string | null {
    let set = this.valueAsSet
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
    return this.valueAsSet.has(token)
  }

  /**
   * Adds the given tokens to the set.
   * 
   * @param tokens - the list of tokens to add
   */
  add(...tokens: string[]): void {
    let set = this.valueAsSet
    for (let token of tokens) {
      set.add(token)
    }
    this.valueAsSet = set
  }

  /**
   * Removes the given tokens from the set.
   * 
   * @param tokens - the list of tokens to remove
   */
  remove(...tokens: string[]): void {
    let set = this.valueAsSet
    for (let token of tokens) {
      if (!token)
        throw DOMException.SyntaxError
      else if (token.match(Utility.OrderedSet.WhiteSpace))
        throw DOMException.InvalidCharacterError
      else
        set.delete(token)
    }
    this.valueAsSet = set
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
      let set = this.valueAsSet
      if (set.has(token)) {
        this.remove(token)
        return false
      } else {
        this.add(token)
        return true
      }
    } else if (force) {
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
   */
  replace(token: string, newToken: string): boolean {
    if (!token || !newToken)
      throw DOMException.SyntaxError
    else if (token.match(Utility.OrderedSet.WhiteSpace) ||
      newToken.match(Utility.OrderedSet.WhiteSpace))
      throw DOMException.InvalidCharacterError

    let set = this.valueAsSet
    if (!set.has(token)) {
      return false
    } else {
      set.delete(token)
      set.add(newToken)
      this.valueAsSet = set
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
    throw DOMException.NotImplementedError
  }

  /**
   * Gets the value of the token list as a string, or sets the token
   * list to the given value.
   */
  get value(): string {
    let set = this.valueAsSet
    let arr = Array.from(set)
    return Utility.OrderedSet.serialize(Array.from(this.valueAsSet))
  }
  set value(value: string) {
    this._ownerElement.setAttribute(this._localName,
      Utility.OrderedSet.sanitize(value))
  }

  /**
   * Allow iteration of tokens.
   */
  [Symbol.iterator]() {
    let set = this.valueAsSet
    return set.values()
  }

  /**
   * Gets or sets a set of strings created from the associated
   * attribute's value by splitting at ASCII whitespace characters.
   */
  get valueAsSet(): Set<string> {
    let attValue = this._ownerElement.getAttribute(this._localName) || ''
    let arr =Utility.OrderedSet.parse(attValue)
    return new Set(arr)
  }
  set valueAsSet(set: Set<string>) {
    if (!this._ownerElement.hasAttribute(this._localName) && set.size === 0)
      return

    let arr = Array.from(set)
    let attValue = Utility.OrderedSet.serialize(arr)
    this._ownerElement.setAttribute(this._localName, attValue)
  }
}