import { 
  xml_isLegalChar, xml_isName, xml_isPubidChar
} from "@oozcitak/dom/lib/algorithm"

/**
 * Contains character processing utility functions.
 */
export class Char {
  /**
   * Escapes special characters to be used in a text node.
   * 
   * @param str - the text value to escape
   * 
   * Following characters are escaped by default:
   * 
   * Char | Escaped
   * ---- | -------
   * `&`  | `&amp;`
   * `<`  | `&lt;`
   * `>`  | `&gt;`
   */
  static escapeText(str: string, noDoubleEncoding: boolean): string {
    const ampRegex = noDoubleEncoding ? /(?!&\S+;)&/g : /&/g
    return str.replace(ampRegex, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  /**
   * Escapes special characters to be used in attribute values.
   * 
   * @param str - the attribute value to escape
   * 
   * Following characters are escaped by default:
   * 
   * Char | Escaped
   * ---- | -------
   * `&`  | `&amp;`
   * `<`  | `&lt;`
   * `>`  | `&gt;`
   * `"`  | `&quot;`
   */
  static escapeAttrValue(str: string, noDoubleEncoding: boolean): string {
    const ampRegex = noDoubleEncoding ? /(?!&\S+;)&/g : /&/g
    return str.replace(ampRegex, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  /** 
   * Validates characters according to the XML spec.
   * 
   * @param str - the string to validate
   * @param version - XML spec version
   * @param debugInfo - additional debug info to add to the exception message
   */
  static assertChar(str: string, version: "1.0" | "1.1", debugInfo?: string): void {
    if (!xml_isLegalChar(str, version)) {
      throw new Error(`Invalid character in string: ${str}. ${debugInfo || ""}`)
    }
  }

  /** 
   * Validates a name according to the XML spec.
   * 
   * @param str - the string to validate
   * @param version - XML spec version
   * @param debugInfo - additional debug info to add to the exception message
   */  
  static assertName(str: string, version: "1.0" | "1.1", debugInfo?: string): void {
    Char.assertChar(str, version, debugInfo)
    if (!xml_isName(str)) {
      throw new Error(`Invalid character in XML name: ${str}. ${debugInfo || ""}`)
    }
  }
  
  /** 
   * Validates public identifier according to the XML spec.
   * 
   * @param str - the string to validate
   * @param version - XML spec version
   * @param debugInfo - additional debug info to add to the exception message
   */
  static assertPubId(str: string, version: "1.0" | "1.1", debugInfo?: string): void {
    if (!xml_isPubidChar(str)) {
      throw new Error(`Invalid character in public identifier string: ${str}. ${debugInfo || ""}`)
    }
  }
}
