import { 
  XMLBuilderOptions, XMLBuilderDocument, XMLBuilderElement, XMLBuilderEntryPoint 
} from "./interfaces"
import { DOMImplementationInstance } from '../dom'

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
    this._options = options || { version: "1.0" }
  }

  /** @inheritdoc */
  withOptions(options?: XMLBuilderOptions): XMLBuilderEntryPointImpl {
    this._options = options || { version: "1.0" }
    return this
  }

  /** @inheritdoc */
  create(namespace?: string, qualifiedName?: string): XMLBuilderDocument | XMLBuilderElement {
    if (namespace && qualifiedName) {
      const doc = DOMImplementationInstance.createDocument(namespace, qualifiedName)
      return <XMLBuilderElement><unknown>doc.documentElement
    } else if (namespace) {
      const doc = DOMImplementationInstance.createDocument('', namespace)
      return <XMLBuilderElement><unknown>doc.documentElement
    } else {
      const doc = DOMImplementationInstance.createDocument('', '')
      return <XMLBuilderDocument><unknown>doc
    }
  }
}
