import { 
  XMLBuilderOptions, XMLBuilderDocument, XMLBuilderElement 
} from "./interfaces"
import { DOMImplementationInstance } from '../dom'

/**
 * Defines the entry point for the XML builder.
 */
export class XMLBuilderEntryPointImpl {

  private _options: XMLBuilderOptions = { version: "1.0" }

  /**
   * Initializes a new instance of `XMLBuilderConfig`.
   * 
   * @param options - builder options
   */
  constructor(options?: XMLBuilderOptions) {
    this._options = options || { version: "1.0" }
  }

  /**
   * Configures options for XML builder.
   * 
   * @param options - builder options
   * 
   * @returns builder with the given options applied
   */
  withOptions(options?: XMLBuilderOptions): XMLBuilderEntryPointImpl {
    this._options = options || { version: "1.0" }
    return this
  }

  /**
   * Creates an empty XML document.
   * 
   * @returns document node
   */
  create(): XMLBuilderDocument
  
  /**
   * Creates a new XML document with an element node.
   * 
   * @param name - document element name
   * 
   * @returns root element node
   */
  create(name: string): XMLBuilderElement
  
  /**
   * Creates a new XML document with an element node.
   * 
   * @param name - name of the root node
   * 
   * @returns root element node
   */
  create(namespace: string, qualifiedName: string): XMLBuilderElement

  /**
   * Creates a new XML document.
   * 
   * @param namespace - document element namespace
   * @param qualifiedName - document element qualified name
   * 
   * @returns root element node or document node
   */
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
