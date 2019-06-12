import {
  XMLBuilderOptions, XMLBuilderEntryPoint, ExpandObject,
  AttributesObject, XMLBuilder
} from "./interfaces"
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

    const builder = <XMLBuilder><unknown>DOMImplementationInstance.createDocument(null, '')
    builder.options = this._options
    if (name !== undefined) {
      return builder.ele(name, attributes, text)
    } else {
      return builder
    }
  }

  /** @inheritdoc */
  fragment(): XMLBuilder {
    const doc = DOMImplementationInstance.createDocument(null, '')
    const builder = <XMLBuilder><unknown>doc
    builder.options = this._options
    return <XMLBuilder><unknown>doc.createDocumentFragment()
  }

  /** @inheritdoc */
  parse(document: string | ExpandObject): XMLBuilder {
    if (isString(document)) {
      const parser = new DOMParser()
      const builder = <XMLBuilder><unknown>parser.parseFromString(document, MimeType.XML)
      builder.options = this._options
      return builder.root()
    } else {
      const builder = <XMLBuilder><unknown>DOMImplementationInstance.createDocument(null, '')
      builder.options = this._options
      builder.ele(document)
      return builder.root()
    }
  }

}