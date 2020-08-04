import { XMLBuilderCBOptions, YAMLCBWriterOptions } from "../interfaces"
import { BaseCBWriter } from "./BaseCBWriter"

/**
 * Serializes XML nodes.
 */
export class YAMLCBWriter extends BaseCBWriter<YAMLCBWriterOptions> {

  private _rootWritten = false
  private _additionalLevel = 0

  /**
   * Initializes a new instance of `BaseCBWriter`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderCBOptions) {
    super(builderOptions)

    if (builderOptions.indent.length < 2) {
      throw new Error("YAML indententation string must be at least two characters long.")
    }
    if (builderOptions.offset < 0) {
      throw new Error("YAML offset should be zero or a positive number.")
    }
  }

  /** @inheritdoc */
  frontMatter(): string {
    return this._beginLine() + "---"
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
    // "!": "hello"
    return this._beginLine() +
      this._key(this._builderOptions.convert.comment) + " " +
      this._val(data)
  }
  /** @inheritdoc */
  text(data: string): string {
    // "#": "hello"
    return this._beginLine() +
      this._key(this._builderOptions.convert.text) + " " +
      this._val(data)
  }
  /** @inheritdoc */
  instruction(target: string, data: string): string {
    // "?": "target hello"
    return this._beginLine() +
      this._key(this._builderOptions.convert.ins) + " " +
      this._val(data ? target + " " + data : target)
  }
  /** @inheritdoc */
  cdata(data: string): string {
    // "$": "hello"
    return this._beginLine() +
      this._key(this._builderOptions.convert.cdata) + " " +
      this._val(data)
  }
  /** @inheritdoc */
  attribute(name: string, value: string): string {
    // "@name": "val"
    this._additionalLevel++
    const str = this._beginLine() +
      this._key(this._builderOptions.convert.att + name) + " " +
      this._val(value)
    this._additionalLevel--
    return str
  }
  /** @inheritdoc */
  openTagBegin(name: string): string {
    // "node":
    //   "#":
    //   -
    let str = this._beginLine() + this._key(name)
    if (!this._rootWritten) {
      this._rootWritten = true
    }
    this.hasData = true
    this._additionalLevel++
    str += this._beginLine(true) + this._key(this._builderOptions.convert.text)
    return str
  }
  /** @inheritdoc */
  openTagEnd(name: string, selfClosing: boolean, voidElement: boolean): string {
    if (selfClosing) {
      return " " + this._val("")
    }
    return ""
  }
  /** @inheritdoc */
  closeTag(name: string): string {
    this._additionalLevel--
    return ""
  }
  /** @inheritdoc */
  beginElement(name: string): void { }
  /** @inheritdoc */
  endElement(name: string): void { }

  /**
   * Produces characters to be prepended to a line of string in pretty-print
   * mode.
   */
  private _beginLine(suppressArray = false): string {
    return (this.hasData ? this._writerOptions.newline : "") +
      this._indent(this._writerOptions.offset + this.level, suppressArray)
  }

  /**
   * Produces an indentation string.
   * 
   * @param level - depth of the tree
   * @param suppressArray - whether the suppress array marker
   */
  private _indent(level: number, suppressArray: boolean): string {
    if (level + this._additionalLevel <= 0) {
      return ""
    } else {
      const chars = this._writerOptions.indent.repeat(level + this._additionalLevel)
      if (!suppressArray && this._rootWritten) {
        return chars.substr(0, chars.length - 2) + '-' + chars.substr(-1, 1)
      }
      return chars
    }
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
    return "\"" + val + "\""
  }

}
