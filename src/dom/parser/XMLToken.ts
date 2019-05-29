import { TokenType, XMLToken } from "./interfaces"

/**
 * Represents a token.
 */
abstract class XMLTokenBase implements XMLToken {
  _type: TokenType

  /**
   * Initializes a new instance of `XMLToken`.
   * 
   * @param type - token type
   */
  constructor(type: TokenType) {
    this._type = type
  }

  /**
   * Returns the token type.
   */
  get type(): TokenType { return this._type }
}

/**
 * Represents an end-of-file token.
 */
export class EOFToken extends XMLTokenBase {
  /**
   * Initializes a new instance of `EOFToken`.
   */
  constructor() {
    super(TokenType.EOF)
  }
}

/**
 * Represents an XML declaration token.
 */
export class DeclarationToken extends XMLTokenBase {
  version: string
  encoding: string
  standalone: string

  /**
   * Initializes a new instance of `DeclarationToken`.
   */
  constructor(version: string, encoding: string, standalone: string) {
    super(TokenType.Declaration)

    this.version = version
    this.encoding = encoding
    this.standalone = standalone
  }
}

/**
 * Represents a DocType token.
 */
export class DocTypeToken extends XMLTokenBase {
  name: string
  pubId: string
  sysId: string

  /**
   * Initializes a new instance of `DocTypeToken`.
   */
  constructor(name: string, pubId: string, sysId: string) {
    super(TokenType.DocType)

    this.name = name
    this.pubId = pubId
    this.sysId = sysId
  }
}

/**
 * Represents a character data token.
 */
abstract class CharacterDataToken extends XMLTokenBase {
  data: string
  
  /**
   * Initializes a new instance of `CharacterDataToken`.
   */
  constructor(type: TokenType, data: string) {
    super(type)

    this.data = data
  }

  /**
   * Determines if the token contents are entirely whitespace characters.
   */
  get isWhitespace(): boolean {
    return !!this.data.match(/^[\t\n\f\r ]*$/)
  }
}

/**
 * Represents a comment token.
 */
export class CommentToken extends CharacterDataToken {
  /**
   * Initializes a new instance of `CommentToken`.
   */
  constructor(data: string) {
    super(TokenType.Comment, data)
  }
}

/**
 * Represents a CDATA token.
 */
export class CDATAToken extends CharacterDataToken {
  /**
   * Initializes a new instance of `CDATAToken`.
   */
  constructor(data: string) {
    super(TokenType.CDATA, data)
  }
}

/**
 * Represents a text token.
 */
export class TextToken extends CharacterDataToken {
  /**
   * Initializes a new instance of `TextToken`.
   */
  constructor(data: string) {
    super(TokenType.Text, data)
  }
}

/**
 * Represents a processing instruction token.
 */
export class PIToken extends CharacterDataToken {
  target: string
  
  /**
   * Initializes a new instance of `PIToken`.
   */
  constructor(target: string, data: string) {
    super(TokenType.PI, data)

    this.target = target
  }
}

/**
 * Represents an element token.
 */
export class ElementToken extends XMLTokenBase {
  name: string
  attributes: { [key:string]: string }
  selfClosing: boolean
  
  /**
   * Initializes a new instance of `ElementToken`.
   */
  constructor(name: string, attributes: { [key:string]: string },
    selfClosing: boolean) {
    super(TokenType.Element)

    this.name = name
    this.attributes = attributes
    this.selfClosing = selfClosing
  }
}

/**
 * Represents a closing tag token.
 */
export class ClosingTagToken extends XMLTokenBase {
  name: string
  
  /**
   * Initializes a new instance of `ClosingTagToken`.
   */
  constructor(name: string) {
    super(TokenType.ClosingTag)

    this.name = name
  }
}