import { XMLWriterOptions, XMLBuilderOptions } from "../interfaces"
import { applyDefaults } from "@oozcitak/util"
import { Node, NodeType } from "@oozcitak/dom/lib/dom/interfaces"
import { BaseWriter } from "./BaseWriter"
import { Guard } from "@oozcitak/dom/lib/util"
import { tree_isHostIncludingAncestorOf } from "@oozcitak/dom/lib/algorithm"

/**
 * Serializes XML nodes into strings.
 */
export class XMLWriter extends BaseWriter<XMLWriterOptions, string> {

  private _refs!: StringWriterRefs
  private _indentation: { [key: number]: string } = {}
  private _lengthToLastNewline = 0

  /**
   * Initializes a new instance of `XMLWriter`.
   * 
   * @param builderOptions - XML builder options
   * @param writerOptions - serialization options
   */
  constructor(builderOptions: XMLBuilderOptions, writerOptions: XMLWriterOptions) {
    super(builderOptions)
    // provide default options
    this._writerOptions = applyDefaults(writerOptions, {
      wellFormed: false,
      noDoubleEncoding: false,
      headless: false,
      prettyPrint: false,
      indent: "  ",
      newline: "\n",
      offset: 0,
      width: 0,
      allowEmptyTags: false,
      indentTextOnlyNodes: false,
      spaceBeforeSlash: false
    }) as Required<XMLWriterOptions>
  }

  /** @inheritdoc */
  serialize(node: Node): string {
    this._refs = { suppressPretty: false, emptyNode: false, markup: "" }

    // Serialize XML declaration
    if (node.nodeType === NodeType.Document && !this._writerOptions.headless) {
      this._appendMarkup(this.declaration(this._builderOptions.version,
        this._builderOptions.encoding, this._builderOptions.standalone))
    }

    // recursively serialize node
    this._serializeDOMNode(node)

    // remove trailing newline
    if (this._writerOptions.prettyPrint &&
      this._refs.markup.slice(-this._writerOptions.newline.length) === this._writerOptions.newline) {
      this._refs.markup = this._refs.markup.slice(0, -this._writerOptions.newline.length)
    }

    return this._refs.markup
  }

  /** @inheritdoc */
  _appendMarkup(markup: string | undefined): void {
    if (markup !== undefined) {
      this._refs.markup += markup
    }
  }

  /** @inheritdoc */
  declaration(version: "1.0", encoding?: string, standalone?: boolean): string | undefined {
    let r = this._beginLine()

    r += "<?xml version=\"" + version + "\""
    if (encoding !== undefined) {
      r += " encoding=\"" + encoding + "\""
    }
    if (standalone !== undefined) {
      r += " standalone=\"" + (standalone ? "yes" : "no") + "\""
    }
    r += "?>"

    return r + this._endLine()
  }

  /** @inheritdoc */
  docType(name: string, publicId: string, systemId: string): string | undefined {
    let r = this._beginLine()

    if (publicId && systemId) {
      r += "<!DOCTYPE " + name + " PUBLIC \"" + publicId + "\" \"" + systemId + "\">"
    } else if (publicId) {
      r += "<!DOCTYPE " + name + " PUBLIC \"" + publicId + "\">"
    } else if (systemId) {
      r += "<!DOCTYPE " + name + " SYSTEM \"" + systemId + "\">"
    } else {
      r += "<!DOCTYPE " + name + ">"
    }

    return r + this._endLine()
  }

  /** @inheritdoc */
  openTagBegin(name: string): string | undefined {
    return this._beginLine() + "<" + name
  }

  /** @inheritdoc */
  openTagEnd(name: string, selfClosing: boolean, voidElement: boolean): string | undefined {
    let r = ""
    // do not indent text only elements or elements with empty text nodes
    this._refs.suppressPretty = false
    this._refs.emptyNode = false
    if (this._writerOptions.prettyPrint && !selfClosing && !voidElement) {
      let textOnlyNode = true
      let emptyNode = true
      let childNode = this.currentNode.firstChild
      let cdataCount = 0
      let textCount = 0
      while (childNode) {
        if (Guard.isExclusiveTextNode(childNode)) {
          textCount++
        } else if (Guard.isCDATASectionNode(childNode)) {
          cdataCount++
        } else {
          textOnlyNode = false
          emptyNode = false
          break
        }

        if (childNode.data !== '') {
          emptyNode = false
        }

        childNode = childNode.nextSibling
      }
      this._refs.suppressPretty = !this._writerOptions.indentTextOnlyNodes && textOnlyNode && ((cdataCount <= 1 && textCount === 0) || cdataCount === 0)
      this._refs.emptyNode = emptyNode
    }

    if ((voidElement || selfClosing || this._refs.emptyNode) && this._writerOptions.allowEmptyTags) {
      r += "></" + name + ">"
    } else {
      r += voidElement ? " />" :
        (selfClosing || this._refs.emptyNode) ? (this._writerOptions.spaceBeforeSlash ? " />" : "/>") : ">"
    }

    return r + this._endLine()
  }

  /** @inheritdoc */
  closeTag(name: string): string | undefined {
    let r = ""

    if (!this._refs.emptyNode) {
      r += this._beginLine() + "</" + name + ">"
    }

    this._refs.suppressPretty = false
    this._refs.emptyNode = false

    return r + this._endLine()
  }

  /** @inheritdoc */
  attribute(name: string, value: string): string | undefined {
    const str = name + "=\"" + value + "\""
    if (this._writerOptions.prettyPrint && this._writerOptions.width > 0 &&
      this._refs.markup.length - this._lengthToLastNewline + 1 + str.length > this._writerOptions.width) {
      return this._endLine() + this._beginLine() + this._indent(1) + str
    } else {
      return " " + str
    }
  }

  /** @inheritdoc */
  text(data: string): string | undefined {
    if (data !== '') {
      return this._beginLine() + data + this._endLine()
    }
  }

  /** @inheritdoc */
  cdata(data: string): string | undefined {
    if (data !== '') {
      return this._beginLine() + "<![CDATA[" + data + "]]>" + this._endLine()
    }
  }

  /** @inheritdoc */
  comment(data: string): string | undefined {
    return this._beginLine() + "<!--" + data + "-->" + this._endLine()
  }

  /** @inheritdoc */
  instruction(target: string, data: string): string | undefined {
    return this._beginLine() + "<?" + (data === "" ? target : target + " " + data) + "?>" + this._endLine()
  }

  /**
   * Produces characters to be prepended to a line of string in pretty-print
   * mode.
   */
  private _beginLine(): string {
    if (this._writerOptions.prettyPrint && !this._refs.suppressPretty) {
      return this._indent(this._writerOptions.offset + this.level)
    } else {
      return ""
    }
  }

  /**
   * Produces characters to be appended to a line of string in pretty-print
   * mode.
   */
  private _endLine(): string {
    if (this._writerOptions.prettyPrint && !this._refs.suppressPretty) {
      this._lengthToLastNewline = this._refs.markup.length + this._writerOptions.newline.length
      return this._writerOptions.newline
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
    } else if (this._indentation[level] !== undefined) {
      return this._indentation[level]
    } else {
      const str = this._writerOptions.indent.repeat(level)
      this._indentation[level] = str
      return str
    }
  }

}

/**
 * Represents reference parameters passed to string writer functions.
 */
type StringWriterRefs = {
  /**
   * Suppresses pretty-printing
   */
  suppressPretty: boolean
  /**
   * The text child nodes of the current element node has no data.
   */
  emptyNode: boolean
  /**
   * The string representing the serialized document.
   */
  markup: string
}