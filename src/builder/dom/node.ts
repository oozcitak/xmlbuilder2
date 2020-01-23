import { DOMParser, DOMImplementation } from "@oozcitak/dom"
import { dom } from "@oozcitak/dom/lib/dom"

dom.setFeatures(false)

/**
 * Returns a DOM implementation.
 */
export function getImplementation(): DOMImplementation {
  return new DOMImplementation()
}

/**
 * Returns a DOM parser.
 */
export function getParser(): DOMParser {
  return new DOMParser()
}
