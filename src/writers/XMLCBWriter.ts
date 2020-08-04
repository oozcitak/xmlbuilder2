import { XMLBuilderCBOptions, XMLCBWriterOptions } from "../interfaces"
import { BaseCBWriter } from "./BaseCBWriter"

/**
 * Serializes XML nodes.
 */
export class XMLCBWriter extends BaseCBWriter<XMLCBWriterOptions> {

  private _lineLength = 0

  /**
   * Initializes a new instance of `XMLCBWriter`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderCBOptions) {
    super(builderOptions)
  }

  /** @inheritdoc */
  frontMatter(): string {
    return ""
  }

  /** @inheritdoc */
  declaration(version: "1.0", encoding?: string, standalone?: boolean): string {
    let markup = this._beginLine() + "<?xml"
    markup += " version=\"" + version + "\""
    if (encoding !== undefined) {
      markup += " encoding=\"" + encoding + "\""
    }
    if (standalone !== undefined) {
      markup += " standalone=\"" + (standalone ? "yes" : "no") + "\""
    }
    markup += "?>"
    return markup
  }
  /** @inheritdoc */
  docType(name: string, publicId: string, systemId: string): string {
    let markup = this._beginLine()
    if (publicId && systemId) {
      markup += "<!DOCTYPE " + name + " PUBLIC \"" + publicId + "\" \"" + systemId + "\">"
    } else if (publicId) {
      markup += "<!DOCTYPE " + name + " PUBLIC \"" + publicId + "\">"
    } else if (systemId) {
      markup += "<!DOCTYPE " + name + " SYSTEM \"" + systemId + "\">"
    } else {
      markup += "<!DOCTYPE " + name + ">"
    }
    return markup
  }
  /** @inheritdoc */
  comment(data: string): string {
    return this._beginLine() + "<!--" + data + "-->"
  }
  /** @inheritdoc */
  text(data: string): string {
    return this._beginLine() + data
  }
  /** @inheritdoc */
  instruction(target: string, data: string): string {
    if (data) {
      return this._beginLine() + "<?" + target + " " + data + "?>"
    } else {
      return this._beginLine() + "<?" + target + "?>"
    }
  }
  /** @inheritdoc */
  cdata(data: string): string {
    return this._beginLine() + "<![CDATA[" + data + "]]>"
  }
  /** @inheritdoc */
  openTagBegin(name: string): string {
    this._lineLength += 1 + name.length
    return this._beginLine() + "<" + name
  }
  /** @inheritdoc */
  openTagEnd(name: string, selfClosing: boolean, voidElement: boolean): string {
    if (voidElement) {
      return " />"
    } else if (selfClosing) {
      if (this._writerOptions.allowEmptyTags) {
        return "></" + name + ">"
      } else if (this._writerOptions.spaceBeforeSlash) {
        return " />"
      } else {
        return "/>"
      }
    } else {
      return ">"
    }
  }
  /** @inheritdoc */
  closeTag(name: string): string {
    return this._beginLine() + "</" + name + ">"
  }
  /** @inheritdoc */
  attribute(name: string, value: string): string {
    let str = name + "=\"" + value + "\""

    if (this._writerOptions.prettyPrint && this._writerOptions.width > 0 &&
      this._lineLength + 1 + str.length > this._writerOptions.width) {
      str = this._beginLine() + this._indent(1) + str
      this._lineLength = str.length
      return str
    } else {
      this._lineLength += 1 + str.length
      return " " + str
    }
  }
  /** @inheritdoc */
  beginElement(name: string): void { }
  /** @inheritdoc */
  endElement(name: string): void { }

  /**
   * Produces characters to be prepended to a line of string in pretty-print
   * mode.
   */
  private _beginLine(): string {
    if (this._writerOptions.prettyPrint) {
      const str = (this.hasData ? this._writerOptions.newline : "") +
        this._indent(this._writerOptions.offset + this.level)
      this._lineLength = str.length
      return str
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
    if (level <= 0) {
      return ""
    } else {
      return this._writerOptions.indent.repeat(level)
    }
  }

}
