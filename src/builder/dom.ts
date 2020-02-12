import { Document } from "@oozcitak/dom/lib/dom/interfaces"
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
    const msgElement = root.firstElementChild
    /* istanbul ignore next */
    if (msgElement === null) throw new Error("Error parsing XML string.")
    const msg = msgElement.getAttribute("message")
    /* istanbul ignore next */
    if (msg === null) throw new Error("Error parsing XML string.")
    throw new Error(msg)
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
