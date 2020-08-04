import { XMLBuilderCBOptions, JSONCBWriterOptions } from "../interfaces"
import { BaseCBWriter } from "./BaseCBWriter"

/**
 * Serializes XML nodes.
 */
export class JSONCBWriter extends BaseCBWriter<JSONCBWriterOptions> {

  private _hasChildren: boolean[] = []
  private _additionalLevel = 0

  /**
   * Initializes a new instance of `BaseCBWriter`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderCBOptions) {
    super(builderOptions)
  }

  /** @inheritdoc */
  declaration(version: "1.0", encoding?: string, standalone?: boolean): string {
    return ""
  }
  /** @inheritdoc */
  docType(name: string, publicId: string, systemId: string): string {
    return ""
  }
  /** @inheritdoc */
  comment(data: string): string {
    // { "!": "hello" }
    return this._comma() + this._beginLine() + "{" + this._sep() +
      this._key(this._builderOptions.convert.comment) + this._sep() +
      this._val(data) + this._sep() + "}"
  }
  /** @inheritdoc */
  text(data: string): string {
    // { "#": "hello" }
    return this._comma() + this._beginLine() + "{" + this._sep() +
      this._key(this._builderOptions.convert.text) + this._sep() +
      this._val(data) + this._sep() + "}"
  }
  /** @inheritdoc */
  instruction(target: string, data: string): string {
    // { "?": "target hello" }
    return this._comma() + this._beginLine() + "{" + this._sep() +
      this._key(this._builderOptions.convert.ins) + this._sep() +
      this._val(data ? target + " " + data : target) + this._sep() + "}"
  }
  /** @inheritdoc */
  cdata(data: string): string {
    // { "$": "hello" }
    return this._comma() + this._beginLine() + "{" + this._sep() +
      this._key(this._builderOptions.convert.cdata) + this._sep() +
      this._val(data) + this._sep() + "}"
  }
  /** @inheritdoc */
  attribute(name: string, value: string): string {
    // { "@name": "val" }
    return this._comma() + this._beginLine(1) + "{" + this._sep() +
      this._key(this._builderOptions.convert.att + name) + this._sep() +
      this._val(value) + this._sep() + "}"
  }
  /** @inheritdoc */
  openTagBegin(name: string): string {
    // { "node": { "#": [
    let str = this._comma() + this._beginLine() + "{" + this._sep() + this._key(name) + this._sep() + "{"
    this._additionalLevel++
    this.hasData = true
    str += this._beginLine() + this._key(this._builderOptions.convert.text) + this._sep() + "["
    this._hasChildren.push(false)
    return str
  }
  /** @inheritdoc */
  openTagEnd(name: string, selfClosing: boolean, voidElement: boolean): string {
    if (selfClosing) {
      let str = this._sep() + "]"
      this._additionalLevel--
      str += this._beginLine() + "}" + this._sep() + "}"
      return str
    } else {
      return ""
    }
  }
  /** @inheritdoc */
  closeTag(name: string): string {
    // ] } }
    let str = this._beginLine() + "]"
    this._additionalLevel--
    str += this._beginLine() + "}" + this._sep() + "}"
    return str
  }
  /** @inheritdoc */
  beginElement(name: string): void { }
  /** @inheritdoc */
  endElement(name: string): void { this._hasChildren.pop() }

  /**
   * Produces characters to be prepended to a line of string in pretty-print
   * mode.
   */
  private _beginLine(additionalOffset = 0): string {
    if (this._writerOptions.prettyPrint) {
      return (this.hasData ? this._writerOptions.newline : "") +
        this._indent(this._writerOptions.offset + this.level + additionalOffset)
    } else {
      return ""
    }
  }

  /**
   * Produces an indentation string.
   * 
   * @param level - depth of the tree
   */
  private _indent(level: number): string {
    if (level + this._additionalLevel <= 0) {
      return ""
    } else {
      return this._writerOptions.indent.repeat(level + this._additionalLevel)
    }
  }

  /**
   * Produces a comma before a child node if it has previous siblings.
   */
  private _comma(): string {
    const str = (this._hasChildren[this._hasChildren.length - 1] ? "," : "")
    if (this._hasChildren.length > 0) {
      this._hasChildren[this._hasChildren.length - 1] = true
    }
    return str
  }

  /**
   * Produces a separator string.
   */
  private _sep(): string {
    return (this._writerOptions.prettyPrint ? " " : "")
  }

  /**
   * Produces a JSON key string delimited with double quotes.
   */
  private _key(key: string): string {
    return "\"" + key + "\":"
  }

  /**
   * Produces a JSON value string delimited with double quotes.
   */
  private _val(val: string): string {
    return JSON.stringify(val)
  }

}
