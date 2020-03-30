import { Document } from "@oozcitak/dom/lib/dom/interfaces"
import { DOMParser, DOMImplementation } from "@oozcitak/dom"
import { dom } from "@oozcitak/dom/lib/dom"
import { isString } from "util"

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

export function sanitizeInput(str: string,
  replacement?: string | ((char: string, offset: number, str: string) => string)): string
export function sanitizeInput(str: string | null,
  replacement?: string | ((char: string, offset: number, str: string) => string)): string | null
export function sanitizeInput(str: string | null | undefined,
  replacement?: string | ((char: string, offset: number, str: string) => string)): string | null | undefined

/**
 * Sanitizes input strings with user supplied replacement characters.
 * 
 * @param str - input string
 */
export function sanitizeInput(str: any,
  replacement?: string | ((char: string, offset: number, str: string) => string)): any {
  if (str == null) {
    return str
  } else if (replacement === undefined) {
    return str + ""
  } else {
    let result = ""
    str = str + ""
    for (let i = 0; i < str.length; i++) {
      let n = str.charCodeAt(i)

      // #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
      if (n === 0x9 || n === 0xA || n === 0xD ||
        (n >= 0x20 && n <= 0xD7FF) ||
        (n >= 0xE000 && n <= 0xFFFD)) {
        // valid character - not surrogate pair
        result += str.charAt(i)
      } else if (n >= 0xD800 && n <= 0xDBFF && i < str.length - 1) {
        const n2 = str.charCodeAt(i + 1)
        if (n2 >= 0xDC00 && n2 <= 0xDFFF) {
          n = (n - 0xD800) * 0x400 + n2 - 0xDC00 + 0x10000

          if (n >= 0x10000 && n <= 0x10FFFF) {
            // valid surrogate pair
            result += String.fromCodePoint(n)
          } else {
            // invalid surrogate pair
            result += isString(replacement) ? replacement : replacement(String.fromCodePoint(n), i, str)
          }

          i++
        } else {
          // invalid lone surrogate
          result += isString(replacement) ? replacement : replacement(str.charAt(i), i, str)
        }
      } else {
        // invalid character
        result += isString(replacement) ? replacement : replacement(str.charAt(i), i, str)
      }
    }

    return result
  }
}
