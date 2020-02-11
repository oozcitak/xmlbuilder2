import { Document, Element } from "@oozcitak/dom/lib/dom/interfaces"
import { DOMParser, DOMImplementation } from "@oozcitak/dom"
import { dom } from "@oozcitak/dom/lib/dom"

dom.setFeatures(false)
/**
 * Throws an error if the parser returned an error document.
 */
export function throwIfParserError(doc: Document): void {
  const root = doc.documentElement
  if (root !== null &&
    root.localName === "parsererror" &&
    root.namespaceURI === "http://www.mozilla.org/newlayout/xml/parsererror.xml") {
    const msg = root.firstChild ? (root.firstChild as Element).getAttribute("message") : null
    throw new Error(msg || "Error parsing XML string.")
  }
}

/**
 * Creates an XML document without any child nodes.
 */
export function createDocument(): Document {
  const impl = new DOMImplementation()
  const doc = impl.createDocument(null, 'root', null)
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
  return new DOMParser()
}
