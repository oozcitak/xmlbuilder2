import { 
  XMLBuilderOptions, XMLBuilderDocument, XMLBuilderElement, XMLBuilderEntryPoint 
} from "./interfaces"
import { DOMImplementationInstance } from '../dom'
import { XMLStringifierImpl } from "./XMLStringifierImpl"

/**
 * Defines the entry point for the XML builder.
 */
export class XMLBuilderEntryPointImpl implements XMLBuilderEntryPoint {

  private _options: XMLBuilderOptions = { version: "1.0" }

  /**
   * Initializes a new instance of `XMLBuilderEntryPointImpl`.
   * 
   * @param options - builder options
   */
  constructor(options?: XMLBuilderOptions) {
    options = options || { version: "1.0" }
    options.stringify = new XMLStringifierImpl(options)
    this._options = options
  }

  /** @inheritdoc */
  withOptions(options?: XMLBuilderOptions): XMLBuilderEntryPointImpl {
    this._options = options || { version: "1.0" }
    return this
  }

  /** @inheritdoc */
  create(namespace?: string, qualifiedName?: string): XMLBuilderDocument | XMLBuilderElement {
    if (namespace && qualifiedName) {
      const doc = DOMImplementationInstance.createDocument(namespace, qualifiedName);
      (<any>doc)._options = this._options
      return <XMLBuilderElement><unknown>doc.documentElement
    } else if (namespace) {
      const doc = DOMImplementationInstance.createDocument('', namespace);
      (<any>doc)._options = this._options
      return <XMLBuilderElement><unknown>doc.documentElement
    } else {
      const doc = DOMImplementationInstance.createDocument('', '');
      (<any>doc)._options = this._options
      return <XMLBuilderDocument><unknown>doc
    }
  }
}
