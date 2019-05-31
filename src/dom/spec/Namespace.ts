import { XMLSpec } from "./XMLSpec"
import { DOMException } from "../DOMException"

/**
 * Includes methods for namespaces.
 */
export class Namespace {

  static readonly HTML = "http://www.w3.org/1999/xhtml"
  static readonly XML = "http://www.w3.org/XML/1998/namespace"
  static readonly XMLNS = "http://www.w3.org/2000/xmlns/"
  static readonly MathML = "http://www.w3.org/1998/Math/MathML"
  static readonly SVG = "http://www.w3.org/2000/svg"
  static readonly XLink = "http://www.w3.org/1999/xlink"

  /**
   * Validates the given qualified name.
   * 
   * @param qualifiedName - qualified name
   */
  static validateQName(qualifiedName: string): void {
    if (!XMLSpec.isName(qualifiedName))
      throw DOMException.InvalidCharacterError

    if (!XMLSpec.isQName(qualifiedName))
      throw DOMException.InvalidCharacterError
  }

  /**
   * Validates and extracts a namespace, prefix and localName from the
   * given namespace and qualified name.
   * 
   * @param namespace - namespace
   * @param qualifiedName - qualified name
   * 
   * @returns an object with `namespace`, `prefix`, and `localName` 
   * keys.
   */
  static extractNames(namespace: string | null, qualifiedName: string): { namespace: string | null, prefix: string | null, localName: string } {

    if (!namespace) namespace = null

    const parts = Namespace.extractQName(qualifiedName)
    const prefix = parts.prefix
    const localName = parts.localName

    if (prefix && !namespace)
      throw DOMException.NamespaceError

    if (prefix === "xml" && namespace !== Namespace.XML)
      throw DOMException.NamespaceError

    if (namespace !== Namespace.XMLNS &&
      (prefix === "xmlns" || qualifiedName === "xmlns"))
      throw DOMException.NamespaceError

    if (namespace === Namespace.XMLNS &&
      (prefix !== "xmlns" && qualifiedName !== "xmlns"))
      throw DOMException.NamespaceError

    return {
      'namespace': namespace,
      'prefix': prefix,
      'localName': localName
    }
  }

  /**
   * Extracts a prefix and localName from the given qualified name.
   * 
   * @param qualifiedName - qualified name
   * 
   * @returns an object with `prefix`, and `localName` keys.
   */
  static extractQName(qualifiedName: string): { prefix: string | null, localName: string } {

    Namespace.validateQName(qualifiedName)

    const parts = qualifiedName.split(':')
    const prefix = (parts.length === 2 ? parts[0] : null)
    const localName = (parts.length === 2 ? parts[1] : qualifiedName)

    return {
      'prefix': prefix,
      'localName': localName
    }
  }
}