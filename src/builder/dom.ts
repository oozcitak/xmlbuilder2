import {
  Document, DocumentType, Element, Text, CDATASection, Comment,
  ProcessingInstruction, DocumentFragment, Node, NodeType
} from "@oozcitak/dom/lib/dom/interfaces"
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

/**
 * Determines if the given object is a `Node`.
 *
 * @param x - the object to check
 */
export function isNode(x: any): x is Node {
  return (!!x && x.nodeType !== undefined)
}

/**
 * Determines if the given object is a `Document`.
 *
 * @param x - the object to check
 */
export function isDocumentNode(x: any): x is Document {
  return (!!x && x.nodeType === NodeType.Document)
}

/**
 * Determines if the given object is a `DocumentType`.
 *
 * @param x - the object to check
 */
export function isDocumentTypeNode(x: any): x is DocumentType {
  return (!!x && x.nodeType === NodeType.DocumentType)
}

/**
 * Determines if the given object is a `DocumentFragment`.
 *
 * @param x - the object to check
 */
export function isDocumentFragmentNode(x: any): x is DocumentFragment {
  return (!!x && x.nodeType === NodeType.DocumentFragment)
}

/**
 * Determines if the given object is a `Element`.
 *
 * @param x - the object to check
 */
export function isElementNode(x: any): x is Element {
  return (!!x && x.nodeType === NodeType.Element)
}

/**
 * Determines if the given object is a `Text`.
 *
 * @param x - the object to check
 */
export function isTextNode(x: any): x is Text {
  return (!!x && x.nodeType === NodeType.Text)
}

/**
 * Determines if the given object is a `CDATASection`.
 *
 * @param x - the object to check
 */
export function isCDATASectionNode(x: any): x is CDATASection {
  return (!!x && x.nodeType === NodeType.CData)
}

/**
 * Determines if the given object is a `Comment`.
 *
 * @param x - the object to check
 */
export function isCommentNode(x: any): x is Comment {
  return (!!x && x.nodeType === NodeType.Comment)
}

/**
 * Determines if the given object is a `ProcessingInstruction`.
 *
 * @param x - the object to check
 */
export function isProcessingInstructionNode(x: any): x is ProcessingInstruction {
  return (!!x && x.nodeType === NodeType.ProcessingInstruction)
}

/**
 * Extracts a prefix and localName from the given qualified name.
 * 
 * @param qualifiedName - qualified name
 * 
 * @returns an tuple with `prefix` and `localName`.
 */
export function extractQName(qualifiedName: string): [string | null, string] {
  const parts = qualifiedName.split(':')
  const prefix = (parts.length === 2 ? parts[0] : null)
  const localName = (parts.length === 2 ? parts[1] : qualifiedName)

  return [prefix, localName]
}

/**
 * Determines if the given string is valid for a `"Name"` construct.
 * 
 * @param name - name string to test
 */
export function isName(name: string): boolean {
  for (let i = 0; i < name.length; i++) {
    let n = name.charCodeAt(i)

    // NameStartChar
    if ((n >= 97 && n <= 122) || // [a-z]
      (n >= 65 && n <= 90) || // [A-Z]
      n === 58 || n === 95 || // ':' or '_'
      (n >= 0xC0 && n <= 0xD6) ||
      (n >= 0xD8 && n <= 0xF6) ||
      (n >= 0xF8 && n <= 0x2FF) ||
      (n >= 0x370 && n <= 0x37D) ||
      (n >= 0x37F && n <= 0x1FFF) ||
      (n >= 0x200C && n <= 0x200D) ||
      (n >= 0x2070 && n <= 0x218F) ||
      (n >= 0x2C00 && n <= 0x2FEF) ||
      (n >= 0x3001 && n <= 0xD7FF) ||
      (n >= 0xF900 && n <= 0xFDCF) ||
      (n >= 0xFDF0 && n <= 0xFFFD)) {
      continue
    } else if (i !== 0 &&
      (n === 45 || n === 46 || // '-' or '.'
        (n >= 48 && n <= 57) || // [0-9]
        (n === 0xB7) ||
        (n >= 0x0300 && n <= 0x036F) ||
        (n >= 0x203F && n <= 0x2040))) {
      continue
    }

    if (n >= 0xD800 && n <= 0xDBFF && i < name.length - 1) {
      const n2 = name.charCodeAt(i + 1)
      if (n2 >= 0xDC00 && n2 <= 0xDFFF) {
        n = (n - 0xD800) * 0x400 + n2 - 0xDC00 + 0x10000
        i++

        if (n >= 0x10000 && n <= 0xEFFFF) {
          continue
        }
      }
    }

    return false
  }

  return true
}

/**
 * Determines if the given string contains legal characters.
 * 
 * @param chars - sequence of characters to test
 */
export function isLegalChar(chars: string): boolean {
  for (let i = 0; i < chars.length; i++) {
    let n = chars.charCodeAt(i)

    // #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
    if (n === 0x9 || n === 0xA || n === 0xD ||
      (n >= 0x20 && n <= 0xD7FF) ||
      (n >= 0xE000 && n <= 0xFFFD)) {
      continue
    }

    if (n >= 0xD800 && n <= 0xDBFF && i < chars.length - 1) {
      const n2 = chars.charCodeAt(i + 1)
      if (n2 >= 0xDC00 && n2 <= 0xDFFF) {
        n = (n - 0xD800) * 0x400 + n2 - 0xDC00 + 0x10000
        i++

        if (n >= 0x10000 && n <= 0x10FFFF) {
          continue
        }
      }
    }

    return false
  }

  return true
}

/**
 * Determines if the given string contains legal characters for a public 
 * identifier.
 * 
 * @param chars - sequence of characters to test
 */
export function isPubidChar(chars: string): boolean {
  for (let i = 0; i < chars.length; i++) {
    // PubId chars are all in the ASCII range, no need to check surrogates
    const n = chars.charCodeAt(i)

    // #x20 | #xD | #xA | [a-zA-Z0-9] | [-'()+,./:=?;!*#@$_%]
    if ((n >= 97 && n <= 122) || // [a-z]
      (n >= 65 && n <= 90) || // [A-Z]
      (n >= 39 && n <= 59) || // ['()*+,-./] | [0-9] | [:;]
      n === 0x20 || n === 0xD || n === 0xA || // #x20 | #xD | #xA
      (n >= 35 && n <= 37) || // [#$%]
      n === 33 || // !
      n === 61 || n === 63 || n === 64 || n === 95) { // [=?@_]
      continue
    } else {
      return false
    }
  }

  return true
}
