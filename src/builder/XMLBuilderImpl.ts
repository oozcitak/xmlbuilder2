import {
  XMLBuilderOptions, XMLBuilder, ExpandObject,
  AttributesObject, XMLBuilderNode, Validator,
  DTDOptions, DefaultBuilderOptions, XMLBuilderCreateOptions
} from "./interfaces"
import { dom, parser, implementation, util } from "@oozcitak/dom"
import { applyDefaults, isObject, isString, isMap } from "@oozcitak/util"
import { ValidatorImpl } from "../validator"

/**
 * Serves as an entry point to builder functions.
 */
export class XMLBuilderImpl implements XMLBuilder {

  private _options: XMLBuilderOptions
  private _docType?: DTDOptions
  private _validate: Validator

  /** 
   * Initializes a new instance of  `XMLBuilderImpl`
   * 
   * @param options - builder options
   */
  constructor(options?: XMLBuilderCreateOptions) {

    options = options || {}

    this._validate = new ValidatorImpl(options.version || "1.0",
      options.validate || {})

    this._docType = options.docType

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
  create(p1?: string | ExpandObject, p2?: AttributesObject | string,
    p3?: AttributesObject): XMLBuilderNode {

    let namespace: string | undefined
    let name: string | ExpandObject | undefined
    let attributes: AttributesObject | undefined

    if (isObject(p1)) {
      // create(obj: ExpandObject)
      [namespace, name, attributes] = [undefined, p1, undefined]
    } else if (isString(p1) && isString(p2)) {
      // create(namespace: string, name: string, attributes?: AttributesObject)
      [namespace, name, attributes] = [p1, p2, p3]
    } else if (isString(p1) && isObject(p2)) {
      // create(name: string, attributes: AttributesObject)
      [namespace, name, attributes] = [undefined, p1, p2]
    } else if (isString(p1)) {
      // create(name: string)
      [namespace, name, attributes] = [undefined, p1, undefined]
    } else {
      // create()
      [namespace, name, attributes] = [undefined, undefined, undefined]
    }

    let builder = <XMLBuilderNode><unknown>this._createEmptyDocument()
    this._setOptions(builder)

    // document element node
    if (name !== undefined) {
      if (isMap(name) || isObject(name)) {
        builder = builder.ele(name)
      } else if (namespace !== undefined) {
        builder = builder.ele(namespace, name, attributes)
      } else {
        builder = builder.ele(name, attributes)
      }
    }

    // DocType node
    if (this._docType !== undefined) {
      builder.dtd(this._docType)
    }

    return builder
  }

  /** @inheritdoc */
  fragment(contents?: string | ExpandObject): XMLBuilderNode {
    const doc = this._createEmptyDocument()
    this._setOptions(doc)
    if (contents !== undefined) {
      if (isString(contents)) {
        if (/^\s*</.test(contents)) {
          // XML nodes
          contents = "<TEMP_ROOT>" + contents + "</TEMP_ROOT>"
          const domParser = new parser.DOMParser()
          const doc = domParser.parseFromString(contents, parser.MimeType.XML)
          /* istanbul ignore else */
          if (doc.documentElement !== null) {
            const frag = doc.createDocumentFragment()
            for (const child of doc.documentElement.childNodes) {
              const newChild = doc.importNode(child, true)
              frag.appendChild(newChild)
            }
            return <XMLBuilderNode><unknown>frag
          }
        } else {
          // JSON
          const frag = <XMLBuilderNode><unknown>doc.createDocumentFragment()
          const obj = JSON.parse(contents) as ExpandObject
          frag.ele(obj)
          return frag
        }
      } else {
        // JS object
        const frag = <XMLBuilderNode><unknown>doc.createDocumentFragment()
        frag.ele(contents)
        return frag
      }
    }
    return <XMLBuilderNode><unknown>doc.createDocumentFragment()
  }

  /** @inheritdoc */
  parse(document: string | ExpandObject): XMLBuilderNode {
    if (isString(document)) {
      if (/^\s*</.test(document)) {
        // XML document
        const domParser = new parser.DOMParser()
        const builder = <XMLBuilderNode><unknown>domParser.parseFromString(document, parser.MimeType.XML)
        this._setOptions(builder)
        return builder.root()
      } else {
        // JSON
        const obj = JSON.parse(document) as ExpandObject
        return this.create(obj)
      }
    } else {
      return this.create(document)
    }
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