import { XMLDocument, Document } from "@oozcitak/dom/lib/dom/interfaces"
import { DOMParser, DOMImplementation } from "@oozcitak/dom"
import { dom, DocumentFragment } from "@oozcitak/dom/lib/dom"
import { Guard } from "@oozcitak/dom/lib/util"

dom.setFeatures(false)

/**
 * Creates an XML document without any child nodes.
 */
export function createDocument(): XMLDocument {
  const impl = new DOMImplementation()
  const doc = impl.createDocument(null, 'root')
  /* istanbul ignore else */
  if (doc.documentElement) {
    doc.removeChild(doc.documentElement)
  }
  return doc
}

/**
 * Creates a DOM parser.
 */
export function createParser(): DOMParser {
  return new DOMParser
}

/**
 * Determines if the given object is a `Document`.
 *
 * @param x - the object to check
 */
export function isDocumentNode(x: any): x is Document {
  return Guard.isDocumentNode(x)
} 

/**
 * Determines if the given object is a `DocumentFragment`.
 *
 * @param x - the object to check
 */
export function isDocumentFragmentNode(x: any): x is DocumentFragment {
  return Guard.isDocumentFragmentNode(x)
} 
