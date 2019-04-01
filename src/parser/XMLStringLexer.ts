import {
  EOFToken, DeclarationToken, PIToken, TextToken,
  ClosingTagToken, ElementToken, CommentToken, DocTypeToken, CDATAToken
} from './XMLToken'
import { XMLToken, TokenType, XMLLexer } from './interfaces'

/**
 * Represents a lexer for XML content in a string.
 */
export class XMLStringLexer implements XMLLexer {

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
   * Determines whether whitespace-only text nodes are skipped or not.
   */
  skipWhitespaceOnlyText = false

  /**
   * Returns the next token.
   */
  nextToken(): XMLToken {
    if (this.eof) {
      return new EOFToken()
    }

    let token: XMLToken = new EOFToken()
    const char = this.consumeChar()
    if (char === '<') {
      token = this.openBracket()
    } else {
      this.revert()
      token = this.text()
    }

    if (this.skipWhitespaceOnlyText) {
      if (token.type === TokenType.Text) {
        const textToken = <TextToken>token
        if (textToken.isWhitespace) {
          token = this.nextToken()
        }
      }
    }

    return token
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
      let char = this.consumeChar()
      const nextChar = this.peekChar()
      if (char === '?' && nextChar === '>') {
        this.seek(1)
        return new DeclarationToken(version, encoding, standalone)
      } else if (inName && XMLStringLexer.isSpace(char) || char === '=') {
        inName = false
        inValue = true
        this.skipSpace()
        while (!this.eof && char !== '=') { char = this.consumeChar() }
        if (char !== '=') {
          throw new Error('Missing equals sign before attribute value')
        }
        this.skipSpace()
        startQuote = this.consumeChar()
        if (!XMLStringLexer.isQuote(startQuote)) {
          throw new Error('Missing quote character before attribute value')
        }
      } else if (inName) {
        attName += char
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

        attName = ''
        attValue = ''
        this.skipSpace()
      } else if (inValue) {
        attValue += char
      }
    }

    throw new Error('Missing declaration end symbol `?>`')
  }

  /**
   * Produces a doc type token.
   */
  private doctype(): XMLToken {
    let name = ''
    let pubId = ''
    let sysId = ''

    // name
    this.skipSpace()
    while (!this.eof) {
      const char = this.consumeChar()
      if (char === '>') {
        return new DocTypeToken(name, '', '')
      } else if (char === '[') {
        this.revert()
        break
      } else if (XMLStringLexer.isSpace(char)) {
        break
      } else {
        name += char
      }
    }

    this.skipSpace()
    if (this.peek(6) === 'PUBLIC') {
      this.seek(6)
      // pubId
      this.skipSpace()
      let startQuote = this.consumeChar()
      if (!XMLStringLexer.isQuote(startQuote)) {
        throw new Error('Missing quote character before pubId value')
      }
      while (!this.eof) {
        const char = this.consumeChar()
        if (char === startQuote) {
          break
        } else {
          pubId += char
        }
      }
      // sysId
      this.skipSpace()
      startQuote = this.consumeChar()
      if (!XMLStringLexer.isQuote(startQuote)) {
        throw new Error('Missing quote character before sysId value')
      }
      while (!this.eof) {
        const char = this.consumeChar()
        if (char === startQuote) {
          break
        } else {
          sysId += char
        }
      }
    } else if (this.peek(6) === 'SYSTEM') {
      this.seek(6)
      // sysId
      this.skipSpace()
      let startQuote = this.consumeChar()
      if (!XMLStringLexer.isQuote(startQuote)) {
        throw new Error('Missing quote character before sysId value')
      }
      while (!this.eof) {
        const char = this.consumeChar()
        if (char === startQuote) {
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
        return new DocTypeToken(name, pubId, sysId)
      } else if (char === '[') {
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
          return new DocTypeToken(name, pubId, sysId)
        }
      }
    }

    throw new Error('Missing doctype end symbol `>`')
  }

  /**
   * Produces a processing instruction token.
   */
  private pi(): XMLToken {
    let target = ''
    while (!this.eof) {
      const char = this.consumeChar()
      const nextChar = this.peekChar()
      const endTag = (char === '?' && nextChar === '>')
      if (XMLStringLexer.isSpace(char) || endTag) {
        if (endTag) {
          this.seek(1)
          return new PIToken(target, '')
        }
        break
      } else {
        target += char
      }
    }

    let data = ''
    while (!this.eof) {
      const char = this.consumeChar()
      const nextChar = this.peekChar()
      if (char === '?' && nextChar === '>') {
        this.seek(1)
        return new PIToken(target, data)
      } else {
        data += char
      }
    }

    throw new Error('Missing processing instruction end symbol `?>`')
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
        return new CommentToken(data)
      }
      data += char
    }

    throw new Error('Missing comment end symbol `-->`')
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
        return new CDATAToken(data)
      }
      data += char
    }

    throw new Error('Missing CDATA end symbol `]>`')
  }

  /**
   * Produces an element token.
   */
  private openTag(): XMLToken {
    let name = ''
    let attributes: { [name: string]: string } = {}
    let attName = ''
    let attValue = ''
    let inAttName = false
    let inAttValue = false
    let startQuote = ''

    // element name
    this.skipSpace()
    while (!this.eof) {
      const char = this.consumeChar()
      const nextChar = this.peekChar()
      if (char === '>') {
        return new ElementToken(name, {}, false)
      } else if (char === '/' && nextChar === '>') {
        this.seek(1)
        return new ElementToken(name, {}, true)
      } else if (XMLStringLexer.isSpace(char)) {
        break
      } else {
        name += char
      }
    }

    // attributes
    this.skipSpace()
    inAttName = true
    inAttValue = false
    while (!this.eof) {
      let char = this.consumeChar()
      const nextChar = this.peekChar()
      if (char === '>') {
        return new ElementToken(name, attributes, false)
      } else if (char === '/' && nextChar === '>') {
        this.seek(1)
        return new ElementToken(name, attributes, true)
      } else if (inAttName && XMLStringLexer.isSpace(char) || char === '=') {
        inAttName = false
        inAttValue = true
        this.skipSpace()
        while (!this.eof && char !== '=') { char = this.consumeChar() }
        if (char !== '=') {
          throw new Error('Missing equals sign before attribute value')
        }
        this.skipSpace()
        startQuote = this.consumeChar()
        if (!XMLStringLexer.isQuote(startQuote)) {
          throw new Error('Missing quote character before attribute value')
        }
      } else if (inAttName) {
        attName += char
      } else if (inAttValue && char === startQuote) {
        inAttName = true
        inAttValue = false
        attributes[attName] = attValue
        attName = ''
        attValue = ''
        this.skipSpace()
      } else if (inAttValue) {
        attValue += char
      }
    }

    throw new Error('Missing opening element tag end symbol `>`')
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
        return new ClosingTagToken(name)
      } else if (!XMLStringLexer.isSpace(char)) {
        name += char
      }
    }

    throw new Error('Missing closing element tag end symbol `>`')
  }

  /**
   * Determines if the given character is whitespace.
   * 
   * @param char - the character to check
   */
  private static isSpace(char: string): boolean {
    const ch = char.charCodeAt(0)
    return ch === 9 || ch === 10 || ch === 13 || ch === 32
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
