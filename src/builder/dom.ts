import { 
  XMLDocument, Document, DocumentType, Element, Attr, Text, CDATASection, 
  Comment, ProcessingInstruction, Node 
} from "@oozcitak/dom/lib/dom/interfaces"
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
 * Determines if the given object is a `Node`.
 *
 * @param x - the object to check
 */
export function isNode(x: any): x is Node {
  return Guard.isNode(x)
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
 * Determines if the given object is a `DocumentType`.
 *
 * @param x - the object to check
 */
export function isDocumentTypeNode(x: any): x is DocumentType {
  return Guard.isDocumentTypeNode(x)
}

/**
 * Determines if the given object is a `DocumentFragment`.
 *
 * @param x - the object to check
 */
export function isDocumentFragmentNode(x: any): x is DocumentFragment {
  return Guard.isDocumentFragmentNode(x)
}

/**
 * Determines if the given object is a `Element`.
 *
 * @param x - the object to check
 */
export function isElementNode(x: any): x is Element {
  return Guard.isElementNode(x)
}

/**
 * Determines if the given object is a `Attr`.
 *
 * @param x - the object to check
 */
export function isAttrNode(x: any): x is Attr {
  return Guard.isAttrNode(x)
}

/**
 * Determines if the given object is a `Text`.
 *
 * @param x - the object to check
 */
export function isTextNode(x: any): x is Text {
  return Guard.isTextNode(x)
}

/**
 * Determines if the given object is a `CDATASection`.
 *
 * @param x - the object to check
 */
export function isCDATASectionNode(x: any): x is CDATASection {
  return Guard.isCDATASectionNode(x)
}

/**
 * Determines if the given object is a `Comment`.
 *
 * @param x - the object to check
 */
export function isCommentNode(x: any): x is Comment {
  return Guard.isCommentNode(x)
}

/**
 * Determines if the given object is a `ProcessingInstruction`.
 *
 * @param x - the object to check
 */
export function isProcessingInstructionNode(x: any): x is ProcessingInstruction {
  return Guard.isProcessingInstructionNode(x)
}

/**
 * Extracts a prefix and localName from the given qualified name.
 * 
 * @param qualifiedName - qualified name
 * 
 * @returns an tuple with `prefix` and `localName`.
 */
export function extractQName(qualifiedName: string): [string | null, string] {

  // TODO: Check if we need to validate qualifiedName against XML name construct

  const parts = qualifiedName.split(':')
  const prefix = (parts.length === 2 ? parts[0] : null)
  const localName = (parts.length === 2 ? parts[1] : qualifiedName)

  return [prefix, localName]
}
