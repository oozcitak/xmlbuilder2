import {
  BuilderOptions, XMLBuilderEntryPoint, ExpandObject,
  AttributesObject, XMLBuilder, BuilderOptionsParams, Validator
} from "./interfaces"
import { DOMImplementationInstance, DOMParser, MimeType } from "../dom"
import { ValidatorImpl } from "./util"
import { isString, applyDefaults } from "../util"

/**
 * Serves as an entry point to builder functions.
 */
export class XMLBuilderEntryPointImpl implements XMLBuilderEntryPoint {

  private _options: BuilderOptions
  private _validate: Validator

  /** 
   * Initializes a new instance of  `XMLBuilderEntryPointImpl`
  */
  constructor(options?: BuilderOptionsParams) {
    this._validate = new ValidatorImpl((options && options.version) || "1.0",
      (options && options.validate) || {})

    this._options = applyDefaults(options, <BuilderOptions>{
      version: "1.0",
      inheritNS: false,
      keepNullNodes: false,
      keepNullAttributes: false,
      ignoreConverters: false,
      convert: {
        att: "@",
        ins: "?",
        text: "#",
        cdata: "$",
        comment: "!"
      }
    })

    if (this._options.convert.att.length === 0 ||
      this._options.convert.ins.length === 0 ||
      this._options.convert.text.length === 0 ||
      this._options.convert.cdata.length === 0 ||
      this._options.convert.comment.length === 0) {
      throw new Error("JS object converter strings cannot be zero length.")
    }
  }

  /** @inheritdoc */
  create(name?: string | ExpandObject, attributes?: AttributesObject | string,
    text?: AttributesObject | string): XMLBuilder {

    const doc = DOMImplementationInstance.createDocument(null, '')
    const builder = <XMLBuilder><unknown>doc
    builder.validate = this._validate
    builder.options = this._options
    if (name !== undefined) {
      const ele = builder.ele(name, attributes, text)
      const documentElement = doc.documentElement
      if (documentElement && (this._options.pubID || this._options.sysID)) {
        const docType = DOMImplementationInstance.createDocumentType(
          documentElement.tagName,
          this._options.pubID || '', this._options.sysID || '')
        doc.insertBefore(docType, doc.firstChild)
      }
      return ele
    } else {
      return builder
    }
  }

  /** @inheritdoc */
  fragment(): XMLBuilder {
    const doc = DOMImplementationInstance.createDocument(null, '')
    const builder = <XMLBuilder><unknown>doc
    builder.validate = this._validate
    builder.options = this._options
    return <XMLBuilder><unknown>doc.createDocumentFragment()
  }

  /** @inheritdoc */
  parse(document: string | ExpandObject): XMLBuilder {
    if (isString(document)) {
      const parser = new DOMParser()
      const builder = <XMLBuilder><unknown>parser.parseFromString(document, MimeType.XML)
      builder.validate = this._validate
      builder.options = this._options
      return builder.root()
    } else {
      const builder = <XMLBuilder><unknown>DOMImplementationInstance.createDocument(null, '')
      builder.validate = this._validate
      builder.options = this._options
      builder.ele(document)
      return builder.root()
    }
  }

}