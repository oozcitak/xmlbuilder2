/**
 * Represents a token.
 */
export interface XMLToken {
  /**
   * Returns the token type.
   */
  readonly type: TokenType
}

/**
 * Represents a lexer for XML content.
 */
export interface XMLLexer extends Iterable<XMLToken> {
  /**
   * Returns the next token.
   */
  nextToken(): XMLToken
}

/**
 * Defines the type of a token.
 */
export enum TokenType {
  EOF,
  Declaration,
  DocType,
  Element,
  Text,
  CDATA,
  PI,
  Comment,
  ClosingTag
}