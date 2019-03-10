import { DOMImplementation, DocumentType, 
  Document, XMLDocument } from "./interfaces";
import { DocumentTypeImpl } from "./DocumentTypeImpl"
import { DocumentImpl } from "./DocumentImpl"
import { XMLDocumentImpl } from "./XMLDocumentImpl"
import { TextImpl } from "./TextImpl";
import { ElementImpl } from "./ElementImpl"
import { Utility } from "./Utility"

/**
 * Represents an object providing methods which are not dependent on 
 * any particular document
 */
export class DOMImplementationImpl implements DOMImplementation {

  private static _instance: DOMImplementation

  private constructor() { }

  /**
   * Gets the instance of dom implementation.
   */
  static get Instance(): DOMImplementation {
    if(!DOMImplementationImpl._instance)
      DOMImplementationImpl._instance = new DOMImplementationImpl()

    return DOMImplementationImpl._instance
  }
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

    return new DocumentTypeImpl(null, qualifiedName, publicId, systemId)
  }

  /**
   * Creates and returns an {@link XMLDocument}.
   * 
   * @param namespace - the namespace of the document element
   * @param qualifiedName - the qualified name of the document element
   * @param doctype - a {@link DocType} to assign to this document
   */
  createDocument(namespace: string, qualifiedName: string,
    doctype: DocumentType | null = null): XMLDocument {
    let document = new XMLDocumentImpl()

    if (doctype)
      document.appendChild(doctype)

    if (qualifiedName) {
      let element = document.createElementNS(namespace, qualifiedName)
      document.appendChild(element)
    }

    // document's content type is determined by namespace
    if (namespace === Utility.Namespace.HTML)
      document._contentType = 'application/xhtml+xml'
    else if (namespace === Utility.Namespace.SVG)
      document._contentType = 'image/svg+xml'
    else
      document._contentType = 'application/xml'

    return document
  }

  /**
   * Creates and returns a HTML document.
   * 
   * @param title - document title
   */
  createHTMLDocument(title: string | undefined = undefined): Document {
    let document = new DocumentImpl()
    document._contentType = 'text/html'
  
    let doctype = new DocumentTypeImpl(document, 'html')
    document.appendChild(doctype)
  
    let htmlElement = new ElementImpl(document, 'html', Utility.Namespace.HTML)
    document.appendChild(htmlElement)

    let headElement = new ElementImpl(document, 'head', Utility.Namespace.HTML)
    htmlElement.appendChild(headElement)

    if(title !== undefined) {
      let titleElement = new ElementImpl(document, 'title', Utility.Namespace.HTML)
      headElement.appendChild(titleElement)
      let textElement = new TextImpl(document, title)
      titleElement.appendChild(textElement)
    }

    let bodyElement = new ElementImpl(document, 'body', Utility.Namespace.HTML)
    htmlElement.appendChild(bodyElement)

    // document's content type is determined by namespace
    document._contentType = 'application/xhtml+xml'

    return document
  }

  /**
   * Obsolete, always returns true.
   */
  hasFeature(): boolean { return true }
}