import { DocumentType } from "./DocumentType"
import { DOMException } from "./DOMException"
import { Document } from "./Document"
import { Utility } from "./Utility"

/**
 * Represents an object providing methods which are not dependent on 
 * any particular document
 */
export class DOMImplementation {

  /**
   * Creates and returns a {@link DocType}.
   * 
   * @param qualifiedName - the qualified name
   * @param publicId - the `PUBLIC` identifier
   * @param publicId - the `SYSTEM` identifier
   */
  createDocumentType(qualifiedName: string,
    publicId: string, systemId: string): DocumentType {
    Utility.Namespace.validateQName(qualifiedName)

    return new DocumentType(null, qualifiedName, publicId, systemId)
  }

  /**
   * Creates and returns a {@link Document}.
   * 
   * @param namespace - the namespace of the document element
   * @param qualifiedName - the qualified name of the document element
   * @param doctype - a {@link DocType} to assign to this document
   */
  createDocument(namespace: string, qualifiedName: string,
    doctype: DocumentType | null = null): Document {
    let document = new Document()

    if (doctype)
      document.appendChild(doctype)

    if (qualifiedName) {
      let element = document.createElementNS(namespace, qualifiedName)
      document.appendChild(element)
    }

    // document’s content type is determined by namespace
    if (namespace === Utility.Namespace.HTML)
      document.contentType = 'application/xhtml+xml'
    else if (namespace === Utility.Namespace.SVG)
      document.contentType = 'image/svg+xml'
    else
      document.contentType = 'application/xml'

    return document
  }

  /**
   * Creates and returns a HTML document.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param title - document title
   */
  createHTMLDocument(title: string = ''): never {
    throw DOMException.NotImplementedError
  }

  /**
   * Obsolete, always returns true.
   */
  hasFeature(): boolean { return true }
}