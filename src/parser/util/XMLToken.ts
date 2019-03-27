import { TokenType } from "./TokenType";

/**
 * Represents a token.
 */
export abstract class XMLToken {
  type: TokenType

  /**
   * Initializes a new instance of `XMLToken`.
   * 
   * @param type - token type
   */
  constructor(type: TokenType) {
    this.type = type
  }
}

/**
 * Represents an end-of-file token.
 */
export class EOFToken extends XMLToken {
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
export class DeclarationToken extends XMLToken {
  version = ''
  encoding = ''
  standalone = ''

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
 * Represents an doctype token.
 */
export class DocTypeToken extends XMLToken {
  name = ''
  pubId = ''
  sysId = ''

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
export abstract class CharacterDataToken extends XMLToken {
  data = ''
  
  /**
   * Initializes a new instance of `CharacterDataToken`.
   */
  constructor(type: TokenType, data: string) {
    super(type)

    this.data = data
  }

  /**
   * Determines if text content is empty (only whitespace).
   */
  get empty(): boolean {
    for (let i = 0; i < this.data.length; i++) {
      const ch = this.data.charCodeAt(i)
      if (ch !== 9 && ch !== 10 && ch !== 13 && ch !== 32) {
        return false
      }
    }

    return true
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
  target = ''
  
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
export class ElementToken extends XMLToken {
  name = ''
  attributes = { }
  selfClosing = false
  
  /**
   * Initializes a new instance of `ElementToken`.
   */
  constructor(name: string, attributes: object, selfClosing: boolean) {
    super(TokenType.Element)

    this.name = name
    this.attributes = attributes
    this.selfClosing = selfClosing
  }
}

/**
 * Represents a closing tag token.
 */
export class ClosingTagToken extends XMLToken {
  name = ''
  
  /**
   * Initializes a new instance of `ClosingTagToken`.
   */
  constructor(name: string) {
    super(TokenType.ClosingTag)

    this.name = name
  }
}