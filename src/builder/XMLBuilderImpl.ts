import {
  XMLBuilderOptions, XMLBuilder, ExpandObject, XMLBuilderNode, Validator,
  DefaultBuilderOptions, XMLBuilderCreateOptions
} from "./interfaces"
import { dom, parser, implementation } from "@oozcitak/dom"
import { applyDefaults, isObject } from "@oozcitak/util"
import { ValidatorImpl } from "../validator"
import { XMLBuilderNodeImpl } from "./XMLBuilderNodeImpl"

/**
 * Serves as an entry point to builder functions.
 */
export class XMLBuilderImpl implements XMLBuilder {

  private _options: XMLBuilderOptions
  private _validate: Validator

  /** 
   * Initializes a new instance of  `XMLBuilderImpl`
   * 
   * @param options - builder options
   */
  constructor(options?: XMLBuilderCreateOptions) {

    options = options || {}

    this._validate = new ValidatorImpl(options.version || "1.0")

    this._options = applyDefaults(options, DefaultBuilderOptions)

    if (this._options.convert.att.length === 0 ||
      this._options.convert.ins.length === 0 ||
      this._options.convert.text.length === 0 ||
      this._options.convert.cdata.length === 0 ||
      this._options.convert.raw.length === 0 ||
      this._options.convert.comment.length === 0) {
      throw new Error("JS object converter strings cannot be zero length.")
    }
  }

  /** @inheritdoc */
  fragment(contents?: string | ExpandObject): XMLBuilderNode {
    let builder: XMLBuilderNode

    if (contents === undefined) {
      // empty fragment
      const doc = this._createEmptyDocument()
      this._setOptions(doc)
      builder = XMLBuilderNodeImpl._FromNode(doc.createDocumentFragment())
    } else if (isObject(contents)) {
      // JS object
      const doc = this._createEmptyDocument()
      this._setOptions(doc)
      builder = XMLBuilderNodeImpl._FromNode(doc.createDocumentFragment())
      builder.ele(contents)
    } else if (/^\s*</.test(contents)) {
      // XML document
      contents = "<TEMP_ROOT>" + contents + "</TEMP_ROOT>"
      const domParser = new parser.DOMParser()
      const doc = domParser.parseFromString(contents, parser.MimeType.XML)
      this._setOptions(doc)
      /* istanbul ignore next */
      if (doc.documentElement === null) {
        throw new Error("Document element is null.")
      }
      const frag = doc.createDocumentFragment()
      for (const child of doc.documentElement.childNodes) {
        const newChild = doc.importNode(child, true)
        frag.appendChild(newChild)
      }
      builder = XMLBuilderNodeImpl._FromNode(frag)
    } else {
      // JSON
      const doc = this._createEmptyDocument()
      this._setOptions(doc)
      builder = XMLBuilderNodeImpl._FromNode(doc.createDocumentFragment())
      const obj = JSON.parse(contents) as ExpandObject
      builder.ele(obj)
    }

    return builder
  }

  /** @inheritdoc */
  document(contents?: string | ExpandObject): XMLBuilderNode {
    let builder: XMLBuilderNode

    if (contents === undefined) {
      // empty document
      builder = XMLBuilderNodeImpl._FromNode(this._createEmptyDocument())
      this._setOptions(builder)
    } else if (isObject(contents)) {
      // JS object
      builder = XMLBuilderNodeImpl._FromNode(this._createEmptyDocument())
      this._setOptions(builder)
      builder.ele(contents)
    } else if (/^\s*</.test(contents)) {
      // XML document
      const domParser = new parser.DOMParser()
      builder = XMLBuilderNodeImpl._FromNode(domParser.parseFromString(contents, parser.MimeType.XML))
      this._setOptions(builder)
    } else {
      // JSON
      builder = XMLBuilderNodeImpl._FromNode(this._createEmptyDocument())
      this._setOptions(builder)
      const obj = JSON.parse(contents) as ExpandObject
      builder.ele(obj)
    }

    return builder
  }

  /**
   * Creates an XML document without any child nodes.
   */
  private _createEmptyDocument(): dom.Interfaces.XMLDocument {
    const doc = implementation.createDocument(null, 'root')
    /* istanbul ignore else */
    if (doc.documentElement) {
      doc.removeChild(doc.documentElement)
    }
    return doc
  }

  /**
   * Sets builder options.
   * 
   * @param doc - document node
   */
  private _setOptions(doc: any): void {
    doc._validate = this._validate
    doc._options = this._options
  }
}