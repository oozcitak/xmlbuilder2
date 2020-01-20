import { Document } from "@oozcitak/dom/lib/dom/interfaces"
import { DOMParser, DOMImplementation } from "@oozcitak/dom"
import { dom } from "@oozcitak/dom/lib/dom"

dom.setFeatures(false)

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
export function createParser(version: "1.0" | "1.1"): DOMParser {
  return new DOMParser(version)
}