import { XMLSerializer } from "./interfaces"
import {
  Node, NodeType, Document, DocumentType, Comment, ProcessingInstruction,
  DocumentFragment, Text, Element, CDATASection
} from "../interfaces"
import { Namespace, XMLSpec, HTMLSpec } from "../spec"
import { TupleSet } from "./TupleSet"

/**
 * Represents an XML serializer.
 * 
 * Implements: https://www.w3.org/TR/DOM-Parsing/#serializing
 */
export class XMLSerializerImpl implements XMLSerializer {

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
    const map = new Map<string | null, string>()

    map.set(Namespace.XML, "xml")
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
    map: Map<string | null, string>): string {

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
      case NodeType.CData:
        return this._serializeCData(<CDATASection>node)
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
    map: Map<string | null, string>): string {

    if (this._requireWellFormed && !node.documentElement) {
      throw new Error("Missing document element (well-formed required).")
    }

    let markup = ""

    if (node.doctype) {
      markup += this._serializeDocumentType(node.doctype)
    }

    for (const childNode of node.childNodes) {
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

    return `<?${node.target} ${node.data}?>`
  }

  /**
   * Produces an XML serialization of a CDATA node.
   * 
   * @param node - processing instruction node to serialize
   */
  private _serializeCData(node: CDATASection): string {

    if (this._requireWellFormed && (node.data.includes("]]>"))) {
      throw new Error("CDATA contains invalid characters (well-formed required).")
    }

    return `<![CDATA[${node.data}]]>`
  }

  /**
   * Produces an XML serialization of a document fragment node.
   * 
   * @param node - document fragment node to serialize
   * @param namespace - context namespace
   * @param map - namespace prefix map
   */
  private _serializeDocumentFragment(node: DocumentFragment,
    namespace: string | null, map: Map<string | null, string>): string {

    let markup = ""

    for (const childNode of node.childNodes) {
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
    namespace: string | null, prefixMap: Map<string | null, string>): string {

    if (this._requireWellFormed && (node.localName.includes(":") ||
      !XMLSpec.isLegalChar(node.localName, this._xmlVersion))) {
      throw new Error("Element local name contains invalid characters (well-formed required).")
    }

    let markup = "<"
    let qualifiedName = ''
    let skipEndTag = false
    let ignoreNamespaceDefinitionAttribute = false
    let map = new Map<string | null, string>(prefixMap)
    let elementPrefixesList: string[] = []
    this._duplicatePrefixDefinition = null
    let localDefaultNamespace = this._recordNamespaceInformation(node, map,
      elementPrefixesList)
    let inheritedNS = namespace
    let ns = node.namespaceURI

    if (inheritedNS === ns) {
      if (localDefaultNamespace !== null) {
        ignoreNamespaceDefinitionAttribute = true
      }
      if (ns === Namespace.XML) {
        qualifiedName = `xml:${node.localName}`
      } else {
        qualifiedName = node.localName
      }
      markup += qualifiedName
    } else {
      // inherited ns is not equal to ns (the node's own namespace is different
      // from the context namespace of its parent
      let prefix = node.prefix
      let candidatePrefix = map.get(ns) || null
      if (candidatePrefix !== null) {
        // there exists on this node or the node's ancestry a namespace prefix
        // definition that defines the node's namespace
        qualifiedName = `${candidatePrefix}:${node.localName}`
        if (localDefaultNamespace) {
          inheritedNS = ns
        }
        markup += qualifiedName
      } else if (prefix !== null && localDefaultNamespace === null) {
        if (elementPrefixesList.includes(prefix)) {
          prefix = this._generatePrefix(map, ns)
        } else {
          map.set(ns, prefix)
        }
        qualifiedName = `${prefix}:${node.localName}`
        markup += qualifiedName
        // serialize the new namespace/prefix association just added to the map
        markup += ` xmlns:${prefix}="${this._serializeAttributeValue(ns)}"`
      } else if (localDefaultNamespace === null || 
        (localDefaultNamespace !== null && localDefaultNamespace !== ns)) {
        ignoreNamespaceDefinitionAttribute = true
        qualifiedName = node.localName
        // the new default namespace will be used in the serialization to 
        // define this node's namespace and act as the context namespace for 
        // its children
        inheritedNS = ns
        markup += qualifiedName
        // serialize the new (or replacement) default namespace definition
        markup += ` xmlns="${this._serializeAttributeValue(ns)}"`
      } else {
        // node has a local default namespace that matches ns
        qualifiedName = node.localName
        inheritedNS = ns
        markup += qualifiedName
      }
    }

    markup += this._serializeAttributes(node, map, ignoreNamespaceDefinitionAttribute)

    if (ns === Namespace.HTML && !node.hasChildNodes() &&
      HTMLSpec.isVoidElementName(node.localName)) {
      // self-closing html tags
      markup += " /"
      skipEndTag = true
    } else if (ns !== Namespace.HTML && !node.hasChildNodes()) {
      // xml element without child nodes also self close
      markup += "/"
      skipEndTag = true
    }

    markup += ">"

    if (skipEndTag) {
      // leaf-node, no need to process child nodes
      return markup
    }

    if (ns === Namespace.HTML && node.localName === "template") {
      // TODO: Template element. 
      // Append to markup the result of running the XML serialization algorithm 
      // on the template element's template contents (a DocumentFragment).
      // This allows template content to round-trip, given the rules for 
      // parsing XHTML documents [HTML5].
      // markup += this._serializeNode((<HTMLTemplateElement>node).content, inheritedNS, map)
    }

    // serialize child-nodes
    for (const childNode of node.childNodes) {
      markup += this._serializeNode(childNode, inheritedNS, map)
    }

    markup += `</${qualifiedName}>`
    return markup
  }

  /**
   * Produces an XML serialization of the attributes of an element node.
   * 
   * @param node - element node whose attributes to serialize
   * @param map - namespace prefix map
   * @param ignoreNamespaceDefinitionAttribute - whether to ignore namespace
   * definition attribute
   */
  private _serializeAttributes(node: Element, map: Map<string | null, string>,
    ignoreNamespaceDefinitionAttribute: boolean): string {

    // Contains unique attribute namespaceURI and localName pairs
    // This set is used to [optionally] enforce the well-formed constraint that 
    // an element cannot have two attributes with the same namespaceURI and 
    // localName. This can occur when two otherwise identical attributes on the
    // same element differ only by their prefix values.    
    const localNameSet = new TupleSet<string | null, string>()

    let result = ""
    for (const attr of node.attributes) {
      if (this._requireWellFormed && localNameSet.has([attr.namespaceURI, attr.localName])) {
        throw new Error("Element contains two attributes with the same namespaceURI and localName (well-formed required).")
      }

      localNameSet.add([attr.namespaceURI, attr.localName])

      let attributeNamespace = attr.namespaceURI
      let candidatePrefix: string | null = null
      if (attributeNamespace !== null) {
        if (attributeNamespace === Namespace.XMLNS &&
          ((attr.prefix === null && ignoreNamespaceDefinitionAttribute) ||
          (attr.prefix !== null && attr.localName === this._duplicatePrefixDefinition))) {
          continue
        } else if (map.has(attributeNamespace)) {
          candidatePrefix = map.get(attributeNamespace) || null
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
   * Produces an XML serialization of an attribute node value.
   * 
   * @param attributeValue - attribute value
   */
  private _serializeAttributeValue(attributeValue: string | null): string {

    if (this._requireWellFormed && attributeValue &&
      !XMLSpec.isLegalChar(attributeValue, this._xmlVersion)) {
      throw new Error("Attribute value contains invalid characters (well-formed required).")
    }

    if (attributeValue === null) {
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
   * @returns default namespace attribute value
   */
  private _recordNamespaceInformation(element: Element,
    map: Map<string | null, string>, list: string[]): string | null {

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
          if (map.has(namespaceDefinition) && map.get(namespaceDefinition) === prefixDefinition) {
            this._duplicatePrefixDefinition = prefixDefinition
          } else {
            map.set(namespaceDefinition, prefixDefinition)
          }
          list.push(prefixDefinition)
        }
      }
    }

    return defaultNamespaceAttrValue
  }

  /**
   * Generates a new prefix for the given namespace.
   * 
   * @param map - namespace prefix map map
   * @param newNamespace - a namespace to generate prefix for
   */
  private _generatePrefix(map: Map<string | null, string>,
    newNamespace: string | null): string {

    let generatedPrefix = "ns" + this._prefixIndex
    this._prefixIndex++
    map.set(newNamespace, generatedPrefix)
    return generatedPrefix
  }

}