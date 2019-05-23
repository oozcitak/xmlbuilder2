import {
  Node, NodeType, Document, DocumentType, Comment, ProcessingInstruction,
  DocumentFragment, Text, Element
} from "../interfaces"
import { Namespace, XMLSpec } from "../spec"
import { TreeQuery } from "../util/TreeQuery"

/**
 * Represents an XML serializer.
 * 
 * Implements: https://www.w3.org/TR/DOM-Parsing/#serializing
 */
export class XMLSerializer {

  private _xmlVersion: "1.0" | "1.1"
  private _prefixIndex: number
  private _requireWellFormed: boolean
  private _duplicatePrefixDefinition: string | null

  /**
   * Initializes a new instance of `XMLSerializer`.
   * 
   * @param xmlVersion - XML specification version
   */
  constructor(xmlVersion: "1.0" | "1.1" = "1.0") {
    this._xmlVersion = xmlVersion
    this._prefixIndex = 1
    this._requireWellFormed = false
    this._duplicatePrefixDefinition = null
  }

  /**
   * Produces an XML serialization of `root`.
   * 
   * @param root - node to serialize
   */
  serializeToString(root: Node): string {
    const map: { [key: string]: string } = {}

    map[Namespace.XML] = "xml"
    this._prefixIndex = 1
    this._requireWellFormed = false

    return this._serializeNode(root, null, map)
  }

  /**
   * Produces an XML serialization of `node`.
   * 
   * @param node - node to serialize
   * @param namespace - context namespace
   * @param map - namespace prefix map
   */
  private _serializeNode(node: Node, namespace: string | null,
    map: { [key: string]: string }): string {

    switch (node.nodeType) {
      case NodeType.Document:
        return this._serializeDocument(<Document>node, namespace, map)
      case NodeType.DocumentType:
        return this._serializeDocumentType(<DocumentType>node)
      case NodeType.Element:
        return this._serializeElement(<Element>node, namespace, map)
      case NodeType.Comment:
        return this._serializeComment(<Comment>node)
      case NodeType.Text:
        return this._serializeText(<Text>node)
      case NodeType.ProcessingInstruction:
        return this._serializeProcessingInstruction(<ProcessingInstruction>node)
      case NodeType.DocumentFragment:
        return this._serializeDocumentFragment(<DocumentFragment>node, namespace, map)
      default:
        throw new Error("Invalid node type.")
    }
  }

  /**
   * Produces an XML serialization of a document node.
   * 
   * @param node - document node to serialize
   * @param namespace - context namespace
   * @param map - namespace prefix map
   */
  private _serializeDocument(node: Document, namespace: string | null,
    map: { [key: string]: string }): string {

    if (this._requireWellFormed && !node.documentElement) {
      throw new Error("Missing document element (well-formed required).")
    }

    let markup = ""

    if (node.doctype) {
      markup += this._serializeDocumentType(node.doctype)
    }

    for (const childNode of TreeQuery.getDescendantNodes(node)) {
      markup += this._serializeNode(childNode, namespace, map)
    }

    return markup
  }

  /**
   * Produces an XML serialization of a document type node.
   * 
   * @param node - document type node to serialize
   */
  private _serializeDocumentType(node: DocumentType): string {

    if (this._requireWellFormed && node.publicId && !XMLSpec.isPubidChar(node.publicId)) {
      throw new Error("DocType public identifier does not match PubidChar construct (well-formed required).")
    }

    if (this._requireWellFormed && node.systemId &&
      (!XMLSpec.isLegalChar(node.systemId, this._xmlVersion)) ||
      (node.systemId.includes('"') && node.systemId.includes("'"))) {
      throw new Error("DocType system identifier contains invalid characters (well-formed required).")
    }

    if (node.publicId && node.systemId) {
      return `<!DOCTYPE ${node.name} PUBLIC "${node.publicId}" "${node.systemId}">`
    } else if (node.publicId) {
      return `<!DOCTYPE ${node.name} PUBLIC "${node.publicId}">`
    } else if (node.systemId) {
      return `<!DOCTYPE ${node.name} SYSTEM "${node.systemId}">`
    } else {
      return `<!DOCTYPE ${node.name}>`
    }
  }

  /**
   * Produces an XML serialization of a comment node.
   * 
   * @param node - comment node to serialize
   */
  private _serializeComment(node: Comment): string {

    if (this._requireWellFormed && (!XMLSpec.isLegalChar(node.data, this._xmlVersion) ||
      node.data.includes("--") || node.data.endsWith("-"))) {
      throw new Error("Comment data contains invalid characters (well-formed required).")
    }

    return `<!--${node.data}-->`
  }

  /**
   * Produces an XML serialization of a text node.
   * 
   * @param node - text node to serialize
   */
  private _serializeText(node: Text): string {

    if (this._requireWellFormed && !XMLSpec.isLegalChar(node.data, this._xmlVersion)) {
      throw new Error("Text data contains invalid characters (well-formed required).")
    }

    return node.data.replace("&", "&amp;")
      .replace("<", "&lt;")
      .replace(">", "&gt;")
  }

  /**
   * Produces an XML serialization of a processing instruction node.
   * 
   * @param node - processing instruction node to serialize
   */
  private _serializeProcessingInstruction(node: ProcessingInstruction): string {

    if (this._requireWellFormed && (node.target.includes(":") || (/xml/i).test(node.target))) {
      throw new Error("Processing instruction target contains invalid characters (well-formed required).")
    }

    if (this._requireWellFormed && (!XMLSpec.isLegalChar(node.data, this._xmlVersion) ||
      node.data.includes("?>"))) {
      throw new Error("Processing instruction data contains invalid characters (well-formed required).")
    }

    return `<? ${node.target} ${node.data}?>`
  }

  /**
   * Produces an XML serialization of a document fragment node.
   * 
   * @param node - document fragment node to serialize
   * @param namespace - context namespace
   * @param map - namespace prefix map
   */
  private _serializeDocumentFragment(node: DocumentFragment,
    namespace: string | null, map: { [key: string]: string }): string {

    let markup = ""

    for (const childNode of TreeQuery.getDescendantNodes(node)) {
      markup += this._serializeNode(childNode, namespace, map)
    }

    return markup
  }

  /**
   * Produces an XML serialization of an element node.
   * 
   * @param node - element node to serialize
   * @param namespace - context namespace
   * @param prefixMap - namespace prefix map
   */
  private _serializeElement(node: Element,
    namespace: string | null, prefixMap: { [key: string]: string }): string {

    if (this._requireWellFormed && (node.localName.includes(":") ||
      !XMLSpec.isLegalChar(node.localName, this._xmlVersion))) {
      throw new Error("Element local name contains invalid characters (well-formed required).")
    }

    let markup = "<"
    let qualifiedName = ''
    let skipEndTag = false
    let ignoreNamespaceDefinitionAttribute = false
    let map = Object.assign({}, prefixMap)
    let elementPrefixes: Array<string> = []
    this._duplicatePrefixDefinition = null
    let localDefaultNamespace = this._recordNamespaceInformation(node, map,
      elementPrefixes)
    let inheritedNS = namespace
    let ns = node.namespaceURI

    // Continue from 12. If inherited ns is equal to ns, then:
    /*
    for (const childNode of TreeQuery.getDescendantNodes(node)) {
      markup += this._serializeNode(childNode, namespace, prefixMap)
    }*/

    return markup
  }

  /**
   * Produces an XML serialization of the attributes of an element node.
   * 
   * @param node - element node whose attributes to serialize
   * @param map - namespace prefix map
   * @param ignoreNamespaceDefinitionAttribute - whether to ignore namespace
   * definition attribute
   * @param duplicatePrefixDefinition - a duplicate namespace prefix definition
   */
  private _serializeAttributes(node: Element, map: { [key: string]: string },
    ignoreNamespaceDefinitionAttribute: boolean, 
    duplicatePrefixDefinition: string): string {

    // Contains unique attribute namespaceURI and localName pairs
    // This set is used to [optionally] enforce the well-formed constraint that 
    // an element cannot have two attributes with the same namespaceURI and 
    // localName. This can occur when two otherwise identical attributes on the
    // same element differ only by their prefix values.    
    let localNameSet: { [key:string]: string } = {}

    let result = ""
    for (const attr of node.attributes) {
      if (this._requireWellFormed && attr.namespaceURI && 
        localNameSet[attr.namespaceURI] === attr.localName) {
        throw new Error("Element contains two attributes with the same namespaceURI and localName (well-formed required).")
      }

      if (attr.namespaceURI) {
        localNameSet[attr.namespaceURI] = attr.localName
      }

      let attributeNamespace = attr.namespaceURI
      let candidatePrefix: string | null = null
      if (attributeNamespace) {
        let prefix = ""
        if (attributeNamespace === Namespace.XMLNS && 
          ((!attr.prefix && ignoreNamespaceDefinitionAttribute) || (attr.prefix && attr.localName === duplicatePrefixDefinition))) {
            continue
        } else if (prefix = map[attributeNamespace]) {
          candidatePrefix = prefix
        } else {
          candidatePrefix = this._generatePrefix(map, attributeNamespace)

          result += ` xmlns:${candidatePrefix}="${this._serializeAttributeValue(attributeNamespace)}"`
        }
      }

      result += " "
      if (candidatePrefix) {
        result += `${candidatePrefix}:`
      }

      if (this._requireWellFormed && (attr.localName.includes(":") ||
        !XMLSpec.isName(attr.localName) || 
        ((/xmlns/i).test(attr.localName) && !attributeNamespace))) {
        throw new Error("Attribute local name contains invalid characters (well-formed required).")
      }

      result += `${attr.localName}="${this._serializeAttributeValue(attr.value)}"`
    }

    return result
  }

  /**
   * Produces an XML serialization of an attribut node value.
   * 
   * @param attributeValue - attribute value
   */
  private _serializeAttributeValue(attributeValue: string | null): string {

    if (this._requireWellFormed && attributeValue &&
      !XMLSpec.isLegalChar(attributeValue, this._xmlVersion)) {
      throw new Error("Attribute value contains invalid characters (well-formed required).")
    }

    if (!attributeValue) {
      return ''
    } else {
      // Although XML spec allows ">" in attribute values, we replace ">" 
      // to match the behavior present in browsers
      return attributeValue.replace('"', "&quot;")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    }
  }

  /**
   * Records namespace information for the given element.
   * 
   * @param element - element node to process
   * @param map - namespace prefix map
   * @param list - element prefixes list
   * 
   * @returns a tuple containing the default namespace attribute value and
   * duplicate namespace prefix definition.
   */
  private _recordNamespaceInformation(element: Element,
    map: { [key: string]: string }, list: Array<string>): string | null {

    let defaultNamespaceAttrValue: string | null = null
    for (const attr of element.attributes) {
      let attributeNamespace = attr.namespaceURI
      let attributePrefix = attr.prefix
      if (attributeNamespace === Namespace.XMLNS) {
        if (!attributePrefix) {
          // default namespace declaration
          defaultNamespaceAttrValue = attr.value
          continue
        } else {
          // attribute is a namespace prefix definition
          let prefixDefinition = attr.localName
          let namespaceDefinition = attr.value
          const value = map[namespaceDefinition]
          if (value === prefixDefinition) {
            this._duplicatePrefixDefinition = prefixDefinition
          } else {
            map[namespaceDefinition] = prefixDefinition
          }
          list.push(prefixDefinition)
        }
      }
    }

    return defaultNamespaceAttrValue
  }

  /**
   * Generates a new perfix for the given namespace.
   * 
   * @param map - namespace prefix map map
   * @param newNamespace - a namespace to generate prefix for
   */
  private _generatePrefix(map: { [key: string]: string }, 
    newNamespace: string): string {

    let generatedPrefix = "ns" + this._prefixIndex
    this._prefixIndex++
    map[newNamespace] = generatedPrefix
    return generatedPrefix
  }

}