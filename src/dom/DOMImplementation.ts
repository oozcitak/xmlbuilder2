import { DocumentType } from "./DocumentType"
import { Element } from "./Element"
import { Document } from "./Document"
import { XMLDocument } from "./XMLDocument"
import { Utility } from "./Utility"
import { Text } from "./Text"

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
   * Creates and returns an {@link XMLDocument}.
   * 
   * @param namespace - the namespace of the document element
   * @param qualifiedName - the qualified name of the document element
   * @param doctype - a {@link DocType} to assign to this document
   */
  createDocument(namespace: string, qualifiedName: string,
    doctype: DocumentType | null = null): XMLDocument {
    let document = new XMLDocument()

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
   * @param title - document title
   */
  createHTMLDocument(title: string | undefined = undefined): Document {
    let document = new Document()
    document.contentType = 'text/html'
  
    let doctype = new DocumentType(document, 'html')
    document.appendChild(doctype)
  
    let htmlElement = new Element(document, 'html', Utility.Namespace.HTML)
    document.appendChild(htmlElement)

    let headElement = new Element(document, 'head', Utility.Namespace.HTML)
    htmlElement.appendChild(headElement)

    if(title !== undefined) {
      let titleElement = new Element(document, 'title', Utility.Namespace.HTML)
      headElement.appendChild(titleElement)
      let textElement = new Text(document, title)
      titleElement.appendChild(textElement)
    }

    let bodyElement = new Element(document, 'body', Utility.Namespace.HTML)
    htmlElement.appendChild(bodyElement)

    // document’s content type is determined by namespace
    document.contentType = 'application/xhtml+xml'

    return document
  }

  /**
   * Obsolete, always returns true.
   */
  hasFeature(): boolean { return true }
}