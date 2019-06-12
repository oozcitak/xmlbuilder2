import {
  XMLBuilderOptions, XMLBuilderEntryPoint, ExpandObject,
  AttributesObject, XMLBuilder
} from "./interfaces"
import { XMLStringifierImpl } from "./XMLStringifierImpl"
import { DOMImplementationInstance, DOMParser, MimeType } from "../dom"
import { isString } from "util"

/**
 * Serves as an entry point to builder functions.
 */
export class XMLBuilderEntryPointImpl implements XMLBuilderEntryPoint {

  private _options: XMLBuilderOptions

  /** 
   * Initializes a new instance of  `XMLBuilderEntryPointImpl`
  */
  constructor(options?: XMLBuilderOptions) {
    this._options = options || { 
      version: "1.0",
      convertAttKey: '@',
      convertPIKey: '?',
      convertTextKey: '#text',
      convertCDataKey: '#cdata',
      convertCommentKey: '#comment'
    }
  }

  /** @inheritdoc */
  create(name?: string | ExpandObject, attributes?: AttributesObject | string,
    text?: AttributesObject | string): XMLBuilder {

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
  fragment(): XMLBuilder {
    const doc = DOMImplementationInstance.createDocument(null, '') as any
    doc._options = this._options
    return <XMLBuilder><unknown>doc.createDocumentFragment()
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