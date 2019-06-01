import {
  XMLBuilderOptions, XMLBuilderEntryPoint, ExpandObject,
  AttributesOrText, XMLBuilder
} from "./interfaces"
import { XMLStringifierImpl } from "./XMLStringifierImpl"
import { DOMImplementationInstance, DOMParser, MimeType } from "../dom"
import { isString } from "util"

/**
 * Serves as an entry point to builder functions.
 */
export class XMLBuilderEntryPointImpl implements XMLBuilderEntryPoint {

  private _options: XMLBuilderOptions = { version: "1.0" }

  /** 
   * Initializes a new instance of  `XMLBuilderEntryPointImpl`
  */
  constructor(options?: XMLBuilderOptions) {
    options = options || { version: "1.0" }
    if (!options.stringify) {
      options.stringify = new XMLStringifierImpl(options)
    }
    this._options = options
  }

  /** @inheritdoc */
  create(name?: string | ExpandObject, attributes?: AttributesOrText,
    text?: AttributesOrText): XMLBuilder {

    const doc = DOMImplementationInstance.createDocument(null, '') as any
    doc._options = this._options
    const builder = <XMLBuilder><unknown>doc
    if (name !== undefined) {
      return builder.ele(name, attributes, text)
    } else {
      return builder
    }
  }

  /** @inheritdoc */
  parse(document: string | ExpandObject): XMLBuilder {
    if (isString(document)) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(document, MimeType.XML) as any
      doc._options = this._options
      return <XMLBuilder><unknown>doc.documentElement
    } else {
      const doc = DOMImplementationInstance.createDocument(null, '') as any
      doc._options = this._options
      const builder = <XMLBuilder><unknown>doc
      builder.ele(document)
      return <XMLBuilder><unknown>doc.documentElement
    }
  }

}