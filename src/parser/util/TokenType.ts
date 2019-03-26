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