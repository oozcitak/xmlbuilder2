/**
 * Includes methods for ordered sets.
 */
export class OrderedSet {
  /**
   * RegExp to split attribute values at ASCII whitespace
   * https://infra.spec.whatwg.org/#ascii-whitespace
   * U+0009 TAB, U+000A LF, U+000C FF, U+000D CR, or U+0020 SPACE
   */
  static readonly WhiteSpace = /[\t\n\f\r ]/
  /**
   * Converts a whitespace separated string into an array of tokens.
   * 
   * @param value - a string of whitespace separated tokens
   */
  static parse(value: string): Set<string> {
    const arr = value.split(OrderedSet.WhiteSpace)
    // remove empty strings
    const filtered = new Set<string>()
    for (const str of arr)
      if (str) filtered.add(str)
    return filtered
  }
  /**
   * Converts an array of tokens into a space separated string.
   * 
   * @param tokens - an array of token strings
   */
  static serialize(tokens: Set<string>): string {
    return [...tokens].join(' ')
  }
  /**
   * Removes duplicate tokens and convert all whitespace characters
   * to space.
   * 
   * @param value - a string of whitespace separated tokens
   */
  static sanitize(value: string): string {
    return OrderedSet.serialize(OrderedSet.parse(value))
  }
}
