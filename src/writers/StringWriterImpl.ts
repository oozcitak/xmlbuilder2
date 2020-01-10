import { StringWriterOptions, XMLBuilderOptions } from "../builder/interfaces"
import { applyDefaults } from "@oozcitak/util"
import { Node, NodeType } from "@oozcitak/dom/lib/dom/interfaces"
import { Guard } from "@oozcitak/dom/lib/util"
import { PreSerializer } from "@oozcitak/dom/lib/serializer/PreSerializer"
import { Char } from "../validator"

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

/**
 * Equal to `StringWriterOptions` but with all properties required.
 */
type RequiredStringWriterOptions = Required<StringWriterOptions>

/**
 * Serializes XML nodes into strings.
 */
export class StringWriterImpl {

  private _builderOptions: XMLBuilderOptions
  private _options!: RequiredStringWriterOptions
  private _refs!: StringWriterRefs
  private _pre!: PreSerializer

  /**
   * Initializes a new instance of `StringWriterImpl`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderOptions) {
    this._builderOptions = builderOptions
  }

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - node to serialize
   * @param writerOptions - serialization options
   */
  serialize(node: Node, writerOptions?: StringWriterOptions): string {
    // provide default options
    this._options = applyDefaults(writerOptions, {
      headless: false,
      prettyPrint: false,
      indent: "  ",
      newline: "\n",
      offset: 0,
      width: 80,
      allowEmptyTags: false,
      indentTextOnlyNodes: false,
      spaceBeforeSlash: false,
      noDoubleEncoding: false
    })

    this._refs = { suppressPretty: false, emptyNode: false, markup: "" }
    this._pre = new PreSerializer(this._builderOptions.version, {
      docType: this._docType.bind(this),
      openTagBegin: this._openTagBegin.bind(this),
      openTagEnd: this._openTagEnd.bind(this),
      closeTag: this._closeTag.bind(this),
      attribute: this._attribute.bind(this),
      comment: this._comment.bind(this),
      text: this._text.bind(this),
      instruction: this._instruction.bind(this),
      cdata: this._cdata.bind(this)
    })

    // XML declaration
    if (node.nodeType === NodeType.Document && !this._options.headless) {
      this._beginLine()
      this._refs.markup = "<?xml"
      this._refs.markup += " version=\"" + this._builderOptions.version + "\""
      if (this._builderOptions.encoding !== undefined) {
        this._refs.markup += " encoding=\"" + this._builderOptions.encoding + "\""
      }
      if (this._builderOptions.standalone !== undefined) {
        this._refs.markup += " standalone=\"" + (this._builderOptions.standalone ? "yes" : "no") + "\""
      }
      this._refs.markup += "?>"
      this._endLine()
    }

    this._pre.serialize(node, false)

    // remove trailing newline
    if (this._options.prettyPrint && 
      this._refs.markup.slice(-this._options.newline.length) === this._options.newline) {
      this._refs.markup = this._refs.markup.slice(0, -this._options.newline.length)
    }
      
    return this._refs.markup
  }

  /**
   * Produces the serialization of a document type node.
   */
  private _docType(name: string, publicId: string, systemId: string): void {
    this._beginLine()

    if (publicId && systemId) {
      this._refs.markup += "<!DOCTYPE " + name + " PUBLIC \"" + publicId + "\" \"" + systemId + "\">"
    } else if (publicId) {
      this._refs.markup += "<!DOCTYPE " + name + " PUBLIC \"" + publicId + "\">"
    } else if (systemId) {
      this._refs.markup += "<!DOCTYPE " + name + " SYSTEM \"" + systemId + "\">"
    } else {
      this._refs.markup += "<!DOCTYPE "+ name + ">"
    }

    this._endLine()
  }

  /**
   * Produces the serialization of the beginning of the opening tag of an element node.
   */
  private _openTagBegin(name: string): void {
    this._beginLine()
    this._refs.markup += "<" + name
  }

  /**
   * Produces the serialization of the ending of the opening tag of an element node.
   */
  private _openTagEnd(name: string, selfClosing: boolean, voidElement: boolean): void {
    // do not indent text only elements or elements with empty text nodes
    this._refs.suppressPretty = false
    this._refs.emptyNode = false
    if (this._options.prettyPrint && !selfClosing && !voidElement && !this._options.indentTextOnlyNodes) {
      let textOnlyNode = true
      let emptyNode = true
      for (const childNode of this._pre.currentNode.childNodes) {
        if (!Guard.isTextNode(childNode)) {
          textOnlyNode = false
          emptyNode = false
          break
        } else if(childNode.data !== '') {
          emptyNode = false
        }
      }
      this._refs.suppressPretty = textOnlyNode
      this._refs.emptyNode = emptyNode
    }

    if ((voidElement || selfClosing) && this._options.allowEmptyTags) {
      this._refs.markup += "></" + name + ">"
    } else {
      this._refs.markup += voidElement ? " />" : 
        (selfClosing || this._refs.emptyNode) ? (this._options.spaceBeforeSlash ? " />" : "/>") : ">"
    }
    this._endLine()
  }

  /**
   * Produces the serialization of the closing tag of an element node.
   */
  private _closeTag(name: string): void {
    if (!this._refs.emptyNode) {
      this._beginLine()
      this._refs.markup += "</" + name + ">"
    }

    this._refs.suppressPretty = false
    this._refs.emptyNode = false

    this._endLine()
  }

  /**
   * Produces the serialization of an attribute node.
   */
  private _attribute(name: string, value: string): void {
    this._refs.markup += " " + name + "=\"" + Char.escapeAttrValue(value, this._options.noDoubleEncoding) + "\""
  }

  /**
   * Produces the serialization of a text node.
   */
  private _text(data: string): void {
    this._beginLine()
    this._refs.markup += Char.escapeText(data, this._options.noDoubleEncoding)
    this._endLine()
  }

  /**
   * Produces the serialization of a cdata section node.
   */
  private _cdata(data: string): void {
    this._beginLine()
    this._refs.markup += "<![CDATA[" + data + "]]>"
    this._endLine()
  }

  /**
   * Produces the serialization of a comment node.
   */
  private _comment(data: string): void {
    this._beginLine()
    this._refs.markup += "<!--" + data + "-->"
    this._endLine()
  }

  /**
   * Produces the serialization of a processing instruction node.
   */
  private _instruction(target: string, data: string): void {
    this._beginLine()
    this._refs.markup += "<?" + target + " " + data + "?>"
    this._endLine()
  }

  /**
   * Produces characters to be prepended to a line of string in pretty-print
   * mode.
   */
  private _beginLine(): void {
    if (!this._options.prettyPrint || this._refs.suppressPretty) {
      return
    } else {
      const indentLevel = this._options.offset + this._pre.level + 1
      this._refs.markup += indentLevel > 0 ? new Array(indentLevel).join(this._options.indent) : ''
    }
  }

  /**
   * Produces characters to be appended to a line of string in pretty-print
   * mode.
   */
  private _endLine(): void {
    if (!this._options.prettyPrint || this._refs.suppressPretty) {
      return
    } else {
      this._refs.markup += this._options.newline
    }
  }

}