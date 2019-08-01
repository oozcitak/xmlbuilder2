import { DocumentType, Document, XMLDocument } from "./interfaces"
import { DocumentTypeImpl } from "./DocumentTypeImpl"
import { DocumentImpl } from "./DocumentImpl"
import { XMLDocumentImpl } from "./XMLDocumentImpl"
import { TextImpl } from "./TextImpl"
import { ElementImpl } from "./ElementImpl"
import { Namespace } from './spec'
import { DOMImplementationInternal } from "./interfacesInternal"

/**
 * Represents an object providing methods which are not dependent on 
 * any particular document.
 */
export class DOMImplementationImpl implements DOMImplementationInternal {

  /**
   * Creates and returns a {@link DocType}.
   * 
   * @param qualifiedName - the qualified name
   * @param publicId - the `PUBLIC` identifier
   * @param publicId - the `SYSTEM` identifier
   */
  createDocumentType(qualifiedName: string,
    publicId: string, systemId: string): DocumentType {
    Namespace.validateQName(qualifiedName)

    return new DocumentTypeImpl(null, qualifiedName, publicId, systemId)
  }

  /**
   * Creates and returns an {@link XMLDocument}.
   * 
   * @param namespace - the namespace of the document element
   * @param qualifiedName - the qualified name of the document element
   * @param doctype - a {@link DocType} to assign to this document
   */
  createDocument(namespace: string | null, qualifiedName: string,
    doctype: DocumentType | null = null): XMLDocument {
    const document = new XMLDocumentImpl()

    if (doctype)
      document.appendChild(doctype)

    if (qualifiedName) {
      const element = document.createElementNS(namespace, qualifiedName)
      document.appendChild(element)
    }

    // document's content type is determined by namespace
    if (namespace === Namespace.HTML)
      document._contentType = 'application/xhtml+xml'
    else if (namespace === Namespace.SVG)
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
  createHTMLDocument(title?: string): Document {
    const document = new DocumentImpl()
    document._contentType = 'text/html'

    const doctype = new DocumentTypeImpl(document, 'html')
    document.appendChild(doctype)

    const htmlElement = new ElementImpl(document, 'html', Namespace.HTML)
    document.appendChild(htmlElement)

    const headElement = new ElementImpl(document, 'head', Namespace.HTML)
    htmlElement.appendChild(headElement)

    if (title !== undefined) {
      const titleElement = new ElementImpl(document, 'title', Namespace.HTML)
      headElement.appendChild(titleElement)
      const textElement = new TextImpl(document, title)
      titleElement.appendChild(textElement)
    }

    const bodyElement = new ElementImpl(document, 'body', Namespace.HTML)
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

export const Instance = new DOMImplementationImpl()