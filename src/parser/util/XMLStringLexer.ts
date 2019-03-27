import { 
  XMLToken, EOFToken, DeclarationToken, PIToken, TextToken, 
  ClosingTagToken, ElementToken, CommentToken, DocTypeToken 
} from './XMLToken'
import { TokenType } from './TokenType';

/**
 * Represents a lexer for XML content in a string.
 */
export class XMLStringLexer implements Iterable<XMLToken> {

  _str = ''
  _length = 0
  _index = 0

  /**
   * Initializes a new instance of `XMLStringLexer`.
   * 
   * @param str - the string to tokenize and lex
   */
  constructor(str: string) {
    this._str = str
    this._length = str.length
  }

  /**
   * Returns the next token.
   */
  nextToken(): XMLToken {
    if (this.eof) {
      return new EOFToken()
    }

    const char = this.consumeChar()
    if (char === '<') {
      return this.openBracket()
    } else {
      this.revert()
      return this.text()
    }
  }

  /**
   * Resets the lexer to the beginning of the string.
   */
  private reset(): void {
    this._index = 0
  }

  /**
   * Determines whether the parser is at or past the end of the string.
   */
  private get eof(): boolean {
    return (this._index >= this._length)
  }

  /**
   * Consumes and returns a single character.
   */
  private consumeChar(): string {
    const char = this._str[this._index]
    this._index++
    return char
  }

  /**
   * Skips over whitespace characters.
   */
  private skipSpace(): void {
    while (!this.eof && XMLStringLexer.isSpace(this._str[this._index])) {
      this._index++
    }
  }

  /**
   * Unconsumes one character.
   */
  private revert(): void {
    if (this._index > 0) {
      this._index--
    }
  }

  /**
   * Skips over a number of characters.
   */
  private seek(count: number): void {
    this._index += count
    if (this._index < 0) {
      this._index = 0
    } else if (this._index > this._length - 1) {
      this._index = this._length - 1
    }
  }

  /**
   * Returns a single character without consuming.
   */
  private peekChar(): string {
    return this._str[this._index]
  }

  /**
   * Returns a given number of characters without consuming.
   */
  private peek(count: number): string {
    return this._str.substr(this._index, count)
  }

  /**
   * Branches from an opening bracket (`<`).
   */
  private openBracket(): XMLToken {
    if (this.eof) {
      return new EOFToken()
    }

    switch (this.consumeChar()) {
      case '?':
        if (this.peek(3) === 'xml') {
          this.seek(3)
          return this.declaration()
        } else {
          return this.pi()
        }
      case '!':
        if (this.peek(2) === '--') {
          this.seek(2)
          return this.comment()
        } else if (this.peek(7) === '[CDATA[') {
          this.seek(7)
          return this.cdata()
        } else if (this.peek(7) === 'DOCTYPE') {
          this.seek(7)
          return this.doctype()
        }
      case '/':
        return this.closeTag()
      default:
        this.revert()
        return this.openTag()
    }
  }

  /**
   * Produces an XML declaration token.
   */
  private declaration(): XMLToken {
    let attName = ''
    let attValue = ''
    let version = ''
    let encoding = ''
    let standalone = ''
    let inName = false
    let inValue = false
    let startQuote = ''

    this.skipSpace()
    inName = true
    inValue = false
    while (!this.eof) {
      const char = this.consumeChar()
      const nextChar = this.peekChar()
      if (char === '?' && nextChar === '>') {
        this.seek(1)
        break
      } else if (inName && XMLStringLexer.isSpace(char) || char === '=') {
        inName = false
        inValue = true
        this.skipSpace()
        startQuote = this.consumeChar()
        if (!XMLStringLexer.isQuote(startQuote)) {
          throw new Error('Missing quote character before attribute value')
        }
      } else if (inValue && char === startQuote) {
        inName = true
        inValue = false

        if (attName === 'version')
          version = attValue
        else if (attName === 'encoding')
          encoding = attValue
        else if (attName === 'standalone')
          standalone = attValue
        else
          throw new Error('Invalid attribute name: ' + attName)
      } else {
        if (inName) {
          attName += char
        } else if (inValue) {
          attValue += char
        }
      }
    }

    return new DeclarationToken(version, encoding, standalone)
  }

  /**
   * Produces a doc type token.
   */
  private doctype(): XMLToken {
    let name = ''
    this.skipSpace()
    while (!this.eof) {
      const char = this.consumeChar()
      const sepChar = (char === '[' || char === '>')
      if (XMLStringLexer.isSpace(char) || sepChar) {
        if (sepChar) { this.revert() }
        break
      } else {
        name += char
      }
    }

    let pubId = ''
    let sysId = ''
    if (this.peek(6) === 'PUBLIC') {
      // pubId
      this.skipSpace()
      while (!this.eof) {
        const char = this.consumeChar()
        const sepChar = (char === '[' || char === '>')
        if (XMLStringLexer.isSpace(char) || sepChar) {
          if (sepChar) { this.revert() }
          break
        } else {
          pubId += char
        }
      }
      // sysId
      this.skipSpace()
      while (!this.eof) {
        const char = this.consumeChar()
        const sepChar = (char === '[' || char === '>')
        if (XMLStringLexer.isSpace(char) || sepChar) {
          if (sepChar) { this.revert() }
          break
        } else {
          sysId += char
        }
      }
    } else if (this.peek(6) === 'SYSTEM') {
      // sysId
      this.skipSpace()
      while (!this.eof) {
        const char = this.consumeChar()
        const sepChar = (char === '[' || char === '>')
        if (XMLStringLexer.isSpace(char) || sepChar) {
          if (sepChar) { this.revert() }
          break
        } else {
          sysId += char
        }
      }
    }

    // skip internal subset
    let hasInternalSubset = false
    this.skipSpace()
    while (!this.eof) {
      const char = this.consumeChar()
      if (char === '>') {
        break
      } else  if (char === '[') {
        hasInternalSubset = true
        break
      }
    }

    if (hasInternalSubset) {
      while (!this.eof) {
        const char = this.consumeChar()
        if (char === ']') {
          break
        }
      }
      this.skipSpace()
      while (!this.eof) {
        const char = this.consumeChar()
        if (char === '>') {
          break
        }
      }
    }

    return new DocTypeToken(name, pubId, sysId)
  }

  /**
   * Produces a processing instruction token.
   */
  private pi(): XMLToken {
    let target = ''
    this.skipSpace()
    while (!this.eof) {
      const char = this.consumeChar()
      const nextChar = this.peekChar()
      const endTag = (char === '?' && nextChar === '>')
      if (XMLStringLexer.isSpace(char) || endTag) {
        if (endTag) { this.revert() }
        break
      } else {
        target += char
      }
    }

    let data = ''
    this.skipSpace()
    while (!this.eof) {
      const char = this.consumeChar()
      const nextChar = this.peekChar()
      if (char === '?' && nextChar === '>') {
        this.seek(1)
        break
      } else {
        data += char
      }
    }

    return new PIToken(target, data)
  }

  /**
   * Produces a text token.
   * 
   */
  private text(): XMLToken {
    let data = ''
    while (!this.eof) {
      const char = this.consumeChar()
      if (char === '<') {
        this.revert()
        break
      }
      data += char
    }

    return new TextToken(data)
  }

  /**
   * Produces a comment token.
   * 
   */
  private comment(): XMLToken {
    let data = ''
    while (!this.eof) {
      const char = this.consumeChar()
      if (char === '-' && this.peek(2) === '->') {
        this.seek(2)
        break
      }
      data += char
    }

    return new CommentToken(data)
  }

  /**
   * Produces a CDATA token.
   * 
   */
  private cdata(): XMLToken {
    let data = ''
    while (!this.eof) {
      const char = this.consumeChar()
      if (char === ']' && this.peek(2) === ']>') {
        this.seek(2)
        break
      }
      data += char
    }

    return new CommentToken(data)
  }

  /**
   * Produces an element token.
   */
  private openTag(): XMLToken {
    let name = ''
    let selfClosing = false
    let attributes: { [name: string]: string } = { }
    let attName = ''
    let attValue = ''
    let inAttName = false
    let inAttValue = false
    let startQuote = ''

    // element name
    this.skipSpace()
    while (!this.eof) {
      const char = this.consumeChar()
      if (XMLStringLexer.isSpace(char) || char === '>') {
        this.revert()
        break
      }
      name += char
    }

    // attributes
    this.skipSpace()
    inAttName = true
    inAttValue = false
    while (!this.eof) {
      const char = this.consumeChar()
      const nextChar = this.peekChar()
      if (char === '>') {
        break
      } else if (char === '/' && nextChar === '>') {
        selfClosing = true
        this.seek(1)
        break
      } else if (inAttName && (XMLStringLexer.isSpace(char) || char === '=')) {
        inAttName = false
        inAttValue = true
        this.skipSpace()
        startQuote = this.consumeChar()
        if (!XMLStringLexer.isQuote(startQuote)) {
          throw new Error('Missing quote character before attribute value')
        }
      } else if (inAttValue && char === startQuote) {
        inAttName = true
        inAttValue = false

        attributes[attName] = attValue
      } else {
        if (inAttName) {
          attName += char
        } else if (inAttValue) {
          attValue += char
        }
      }
    }

    return new ElementToken(name, attributes, selfClosing)
  }

  /**
   * Produces a closing tag token.
   * 
   */
  private closeTag(): XMLToken {
    let name = ''
    this.skipSpace()
    while (!this.eof) {
      const char = this.consumeChar()
      if (char === '>') {
        break
      } else if (!XMLStringLexer.isSpace(char)) {
        name += char
      }
    }

    return new ClosingTagToken(name)
  }

  /**
   * Determines if the given character is whitespace.
   * 
   * @param char - the character to check
   */
  private static isSpace(char: string): boolean {
    if (!char) {
      return true
    } else {
      const ch = char.charCodeAt(0)
      return ch === 9 || ch === 10 || ch === 13 || ch === 32
    }
  }

  /**
   * Determines if the given character is a quote character.
   * 
   * @param char - the character to check
   */
  private static isQuote(char: string): boolean {
    return (char === '"' || char === '\'')
  }

  /**
   * Returns an iterator for the lexer.
   */
  *[Symbol.iterator](): IterableIterator<XMLToken> {
    this.reset()
    let flag = true
    while (flag) {
      const token = this.nextToken()
      if (token.type === TokenType.EOF) {
        flag = false
      } else {
        yield token
      }
    }
  }

}
