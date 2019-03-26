import { 
  XMLToken, EOFToken, DeclarationToken, PIToken, TextToken, 
  ClosingTagToken, ElementToken, CommentToken 
} from './XMLToken'

/**
 * Represents a lexer for XML content in a string.
 */
export class XMLStringLexer {
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
   * Determines whether the parser is at or past the end of the string.
   */
  get eof(): boolean {
    return (this._index >= this._length)
  }

  /**
   * Consumes and returns a single character.
   */
  consumeChar(): string {
    const char = this._str[this._index]
    this._index++
    return char
  }

  /**
   * Skips over whitespace characters.
   */
  skipSpace(): void {
    while (XMLStringLexer.isSpace(this._str[this._index])) {
      this._index++
    }
  }

  /**
   * Unconsumes one character.
   */
  revert(): void {
    if (this._index > 0) {
      this._index--
    }
  }

  /**
   * Skips over a number of characters.
   */
  seek(count: number): void {
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
  peekChar(): string {
    return this._str[this._index]
  }

  /**
   * Returns a given number of characters without consuming.
   */
  peek(count: number): string {
    return this._str.substr(this._index, count)
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
   * Branches from an opening bracket (`<`).
   */
  openBracket(): XMLToken {
    if (this.eof) {
      return new EOFToken()
    }

    switch (this.consumeChar()) {
      case '?':
        return this.declarationOrPI()
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
   * Produces an XML declaration or processing instruction token.
   * 
   */
  declarationOrPI(): XMLToken {
    let name = ''
    this.skipSpace()
    while (!this.eof) {
      const char = this.consumeChar()
      const nextChar = this.peekChar()
      const endTag = (char === '?' && nextChar === '>')
      if (XMLStringLexer.isSpace(char) || endTag) {
        if (endTag) { this.revert() }
        if (name === 'xml') {
          return this.declaration()
        } else {
          return this.pi(name)
        }
      }
      name += char
    }

    throw new Error('Missing ?>')
  }

  /**
   * Produces an XML declaration token.
   * `XMLDecl ::= '<?xml' VersionInfo EncodingDecl? SDDecl? S? '?>'`
   */
  declaration(): XMLToken {
    let name = ''
    let value = ''
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

        if (name === 'version')
          version = value
        else if (name === 'encoding')
          encoding = value
        else if (name === 'standalone')
          standalone = value
        else
          throw new Error('Invalid attribute name: ' + name)
      } else {
        if (inName) {
          name += char
        } else if (inValue) {
          value += char
        }
      }
    }

    return new DeclarationToken(version, encoding, standalone)
  }

  /**
   * Produces a processing instruction token.
   * `PI ::= '<?' PITarget (S (Char* - (Char* '?>' Char*)))? '?>'`
   */
  pi(target: string): XMLToken {
    let value = ''

    this.skipSpace()
    while (!this.eof) {
      const char = this.consumeChar()
      const nextChar = this.peekChar()
      if (char === '?' && nextChar === '>') {
        break
      } else {
        value += char
      }
    }

    return new PIToken(target, value)
  }

  /**
   * Produces a text token.
   * 
   */
  text(): XMLToken {
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
  comment(): XMLToken {
    let data = ''
    while (!this.eof) {
      const char = this.consumeChar()
      if (char === '-' && this.peek(2) === '->') {
        this.revert()
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
  cdata(): XMLToken {
    let data = ''
    while (!this.eof) {
      const char = this.consumeChar()
      if (char === ']' && this.peek(2) === ']>') {
        this.revert()
        break
      }
      data += char
    }

    return new CommentToken(data)
  }

  /**
   * Produces an element token.
   */
  openTag(): XMLToken {
    let name = ''
    let selfClosing = false
    let attributes: { [name: string]: string } = { }
    let attName = ''
    let attValue = ''
    let inName = false
    let inValue = false
    let startQuote = ''

    this.skipSpace()
    inName = true
    inValue = false
    while (!this.eof) {
      const char = this.consumeChar()
      const nextChar = this.peekChar()
      if (char === '>') {
        break
      } else if (char === '/' && nextChar === '>') {
        selfClosing = true
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

        attributes[attName] = attValue
      } else {
        if (inName) {
          attName += char
        } else if (inValue) {
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
  closeTag(): XMLToken {
    let name = ''
    this.skipSpace()
    while (!this.eof) {
      const char = this.consumeChar()
      if (XMLStringLexer.isSpace(char) || char === '>') {
        break
      }
      name += char
    }

    return new ClosingTagToken(name)
  }

  /**
   * Determines if the given character is whitespace.
   * 
   * @param char - the character to check
   */
  static isSpace(char: string): boolean {
    const ch = char.charCodeAt(0)
    return ch === 9 || ch === 10 || ch === 13 || ch === 32
  }

  /**
   * Determines if the given character is a quote character.
   * 
   * @param char - the character to check
   */
  static isQuote(char: string): string {
    if (char === '"' || char === "'")
      return char
    else
      return ''
  }
}

