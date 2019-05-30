import { XMLSerializer } from "./interfaces"
import {
  Node, NodeType, Document, DocumentType, Comment, ProcessingInstruction,
  DocumentFragment, Text, Element, CDATASection
} from "../interfaces"
import { Namespace, XMLSpec, HTMLSpec } from "../spec"
import { TupleSet } from "./TupleSet"
import { DOMException } from ".."

/**
 * Represents an XML serializer.
 * 
 * Implements: https://www.w3.org/TR/DOM-Parsing/#serializing
 */
export class XMLSerializerImpl implements XMLSerializer {

  private _xmlVersion: "1.0" | "1.1"

  /**
   * Initializes a new instance of `XMLSerializer`.
   * 
   * @param xmlVersion - XML specification version
   */
  constructor(xmlVersion: "1.0" | "1.1" = "1.0") {
    this._xmlVersion = xmlVersion
  }

  /**
   * Produces an XML serialization of `root`.
   * 
   * @param root - node to serialize
   */
  serializeToString(root: Node): string {
    return this._produceXMLSerialization(root, false)
  }

  /**
   * Produces an XML serialization of `root`.
   * 
   * @param root - node to serialize
   * @param requireWellFormed - whether to check conformance
   */
  _produceXMLSerialization(node: Node, requireWellFormed: boolean): string {

    const namespacePrefixMap = new Map<string | null, string>()
    namespacePrefixMap.set(Namespace.XML, "xml")

    try {
      return this._serializeNode(node, null, 
        { prefixMap: namespacePrefixMap, prefixIndex: 1 },
        requireWellFormed)
    } catch {
      throw DOMException.InvalidStateError
    }
  }

  /**
   * Produces an XML serialization of `node`.
   * 
   * @param node - node to serialize
   * @param namespace - context namespace
   * @param refs - reference parameters
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeNode(node: Node, namespace: string | null,
    refs: { prefixMap: Map<string | null, string>, prefixIndex: number },
    requireWellFormed: boolean): string {

    switch (node.nodeType) {
      case NodeType.Element:
        return this._serializeElement(<Element>node, namespace, refs, requireWellFormed)
      case NodeType.Document:
        return this._serializeDocument(<Document>node, namespace, refs, requireWellFormed)
      case NodeType.Comment:
        return this._serializeComment(<Comment>node, requireWellFormed)
      case NodeType.Text:
        return this._serializeText(<Text>node, requireWellFormed)
      case NodeType.DocumentFragment:
          return this._serializeDocumentFragment(<DocumentFragment>node, namespace, refs, requireWellFormed)
      case NodeType.DocumentType:
          return this._serializeDocumentType(<DocumentType>node, requireWellFormed)
      case NodeType.ProcessingInstruction:
        return this._serializeProcessingInstruction(<ProcessingInstruction>node, requireWellFormed)
      case NodeType.CData:
        return this._serializeCData(<CDATASection>node, requireWellFormed)
      default:
        throw new Error("Invalid node type.")
    }
  }

  /**
   * Produces an XML serialization of an element node.
   * 
   * @param node - element node to serialize
   * @param namespace - context namespace
   * @param refs - reference parameters
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeElement(node: Element, namespace: string | null,
    refs: { prefixMap: Map<string | null, string>, prefixIndex: number },
    requireWellFormed: boolean): string {

    if (requireWellFormed && (node.localName.includes(":") ||
      !XMLSpec.isName(node.localName))) {
      throw new Error("Element local name contains invalid characters (well-formed required).")
    }

    let markup = "<"
    let qualifiedName = ''
    let skipEndTag = false
    let ignoreNamespaceDefinitionAttribute = false
    let map = new Map<string | null, string>(refs.prefixMap)
    let elementPrefixesList: string[] = []
    let duplicatePrefixDefinition: string | null = null
    let localDefaultNamespace = this._recordNamespaceInformation(node, 
      { map: map, list: elementPrefixesList, 
        duplicatePrefixDefinition: duplicatePrefixDefinition })
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
        if (localDefaultNamespace !== null) {
          inheritedNS = ns
        }
        markup += qualifiedName
      } else if (prefix !== null && localDefaultNamespace === null) {
        if (elementPrefixesList.includes(prefix)) {
          const generateRefs = { map: map, prefixIndex: refs.prefixIndex }
          prefix = this._generatePrefix(ns, generateRefs)
          refs.prefixIndex = generateRefs.prefixIndex
        } else {
          map.set(ns, prefix)
        }
        qualifiedName = `${prefix}:${node.localName}`
        markup += qualifiedName
        // serialize the new namespace/prefix association just added to the map
        markup += ` xmlns:${prefix}="${this._serializeAttributeValue(ns, requireWellFormed)}"`
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
        markup += ` xmlns="${this._serializeAttributeValue(ns, requireWellFormed)}"`
      } else {
        // node has a local default namespace that matches ns
        qualifiedName = node.localName
        inheritedNS = ns
        markup += qualifiedName
      }
    }

    const attRefs = { namespacePrefixMap: map, prefixIndex: refs.prefixIndex }
    markup += this._serializeAttributes(node, attRefs, 
      ignoreNamespaceDefinitionAttribute, duplicatePrefixDefinition, 
      requireWellFormed)
    refs.prefixIndex = attRefs.prefixIndex

    if (ns === Namespace.HTML && !node.hasChildNodes() &&
      HTMLSpec.isVoidElementName(node.localName)) {
      // self-closing html tags
      markup += " /"
      skipEndTag = true
    }
    if (ns !== Namespace.HTML && !node.hasChildNodes()) {
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
    } else {
      // serialize child-nodes
      for (const childNode of node.childNodes) {
        const childRefs = { prefixMap: map, prefixIndex: refs.prefixIndex }
        markup += this._serializeNode(childNode, inheritedNS, childRefs, requireWellFormed)
        refs.prefixIndex = childRefs.prefixIndex
      }
    }

    markup += `</${qualifiedName}>`
    return markup
  }

  /**
   * Produces an XML serialization of a document node.
   * 
   * @param node - document node to serialize
   * @param namespace - context namespace
   * @param refs - reference parameters
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeDocument(node: Document, namespace: string | null,
    refs: { prefixMap: Map<string | null, string>, prefixIndex: number },
    requireWellFormed: boolean): string {

    if (requireWellFormed && node.documentElement === null) {
      throw new Error("Missing document element (well-formed required).")
    }

    let markup = ""

    if (node.doctype !== null) {
      markup += this._serializeDocumentType(node.doctype, requireWellFormed)
    }

    for (const childNode of node.childNodes) {
      markup += this._serializeNode(childNode, namespace, refs, requireWellFormed)
    }

    return markup
  }

  /**
   * Produces an XML serialization of a document type node.
   * 
   * @param node - document type node to serialize
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeDocumentType(node: DocumentType, requireWellFormed: boolean): string {

    if (requireWellFormed && !XMLSpec.isPubidChar(node.publicId)) {
      throw new Error("DocType public identifier does not match PubidChar construct (well-formed required).")
    }

    if (requireWellFormed &&
      (!XMLSpec.isLegalChar(node.systemId, this._xmlVersion) ||
      (node.systemId.includes('"') && node.systemId.includes("'")))) {
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
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeComment(node: Comment, requireWellFormed: boolean): string {

    if (requireWellFormed && (!XMLSpec.isLegalChar(node.data, this._xmlVersion) ||
      node.data.includes("--") || node.data.endsWith("-"))) {
      throw new Error("Comment data contains invalid characters (well-formed required).")
    }

    return `<!--${node.data}-->`
  }

  /**
   * Produces an XML serialization of a text node.
   * 
   * @param node - text node to serialize
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeText(node: Text, requireWellFormed: boolean): string {

    if (requireWellFormed && !XMLSpec.isLegalChar(node.data, this._xmlVersion)) {
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
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeProcessingInstruction(node: ProcessingInstruction,
    requireWellFormed: boolean): string {

    if (requireWellFormed && (node.target.includes(":") || (/xml/i).test(node.target))) {
      throw new Error("Processing instruction target contains invalid characters (well-formed required).")
    }

    if (requireWellFormed && (!XMLSpec.isLegalChar(node.data, this._xmlVersion) ||
      node.data.includes("?>"))) {
      throw new Error("Processing instruction data contains invalid characters (well-formed required).")
    }

    return `<?${node.target} ${node.data}?>`
  }

  /**
   * Produces an XML serialization of a CDATA node.
   * 
   * @param node - processing instruction node to serialize
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeCData(node: CDATASection, requireWellFormed: boolean): string {

    if (requireWellFormed && (node.data.includes("]]>"))) {
      throw new Error("CDATA contains invalid characters (well-formed required).")
    }

    return `<![CDATA[${node.data}]]>`
  }

  /**
   * Produces an XML serialization of a document fragment node.
   * 
   * @param node - document fragment node to serialize
   * @param namespace - context namespace
   * @param refs - reference parameters
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeDocumentFragment(node: DocumentFragment,
    namespace: string | null,
    refs: { prefixMap: Map<string | null, string>, prefixIndex: number },
    requireWellFormed: boolean): string {

    let markup = ""

    for (const childNode of node.childNodes) {
      markup += this._serializeNode(childNode, namespace, refs, requireWellFormed)
    }

    return markup
  }

  /**
   * Produces an XML serialization of the attributes of an element node.
   * 
   * @param node - element node whose attributes to serialize
   * @param refs - reference parameters
   * @param ignoreNamespaceDefinitionAttribute - whether to ignore namespace
   * @param duplicatePrefixDefinition - duplicate prefix definition
   * definition attribute
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeAttributes(node: Element,
    refs: { namespacePrefixMap: Map<string | null, string>,
      prefixIndex: number },
    ignoreNamespaceDefinitionAttribute: boolean, 
    duplicatePrefixDefinition: string | null,
    requireWellFormed: boolean): string {

    let result = ""

    // Contains unique attribute namespaceURI and localName pairs
    // This set is used to [optionally] enforce the well-formed constraint that 
    // an element cannot have two attributes with the same namespaceURI and 
    // localName. This can occur when two otherwise identical attributes on the
    // same element differ only by their prefix values.    
    const localNameSet = new TupleSet<string | null, string>()

    for (const attr of node.attributes) {
      if (requireWellFormed && localNameSet.has([attr.namespaceURI, attr.localName])) {
        throw new Error("Element contains two attributes with the same namespaceURI and localName (well-formed required).")
      }

      localNameSet.add([attr.namespaceURI, attr.localName])

      let attributeNamespace = attr.namespaceURI
      let candidatePrefix: string | null = null
      if (attributeNamespace !== null) {
        if (attributeNamespace === Namespace.XMLNS &&
          ((attr.prefix === null && ignoreNamespaceDefinitionAttribute) ||
          (attr.prefix !== null && attr.localName === duplicatePrefixDefinition))) {
          continue
        } else if (refs.namespacePrefixMap.has(attributeNamespace)) {
          candidatePrefix = refs.namespacePrefixMap.get(attributeNamespace) || null
        } else if (candidatePrefix === null) {
          // see: https://github.com/w3c/DOM-Parsing/pull/30
          if(attr.prefix === null || refs.namespacePrefixMap.has(attributeNamespace)) {
            const generateRefs = { map: refs.namespacePrefixMap, prefixIndex: refs.prefixIndex }
            candidatePrefix = this._generatePrefix(attributeNamespace, generateRefs)
            refs.prefixIndex = generateRefs.prefixIndex
          } else {
            candidatePrefix = attr.prefix
          }

          refs.namespacePrefixMap.set(attributeNamespace, candidatePrefix)
          localNameSet.add([attributeNamespace, candidatePrefix])
          result += ` xmlns:${candidatePrefix}="${this._serializeAttributeValue(attributeNamespace, requireWellFormed)}"`
        }
      }

      result += " "
      if (candidatePrefix !== null) {
        result += `${candidatePrefix}:`
      }

      if (requireWellFormed && (attr.localName.includes(":") ||
        !XMLSpec.isName(attr.localName) ||
        ((/xmlns/i).test(attr.localName) && !attributeNamespace))) {
        throw new Error("Attribute local name contains invalid characters (well-formed required).")
      }

      result += `${attr.localName}="${this._serializeAttributeValue(attr.value, requireWellFormed)}"`
    }

    return result
  }

  /**
   * Produces an XML serialization of an attribute node value.
   * 
   * @param attributeValue - attribute value
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeAttributeValue(attributeValue: string | null,
    requireWellFormed: boolean): string {

    if (requireWellFormed && attributeValue &&
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
   * Records namespace information for the given element and returns the 
   * default namespace attribute value.
   * 
   * @param element - element node to process
   * @param refs - reference parameters
   * @param requireWellFormed - whether to check conformance
   */
  private _recordNamespaceInformation(element: Element,     
    refs: { map: Map<string | null, string>, list: string[], 
    duplicatePrefixDefinition: string | null }): string | null {

    let defaultNamespaceAttrValue: string | null = null
    for (const attr of element.attributes) {
      let attributeNamespace = attr.namespaceURI
      let attributePrefix = attr.prefix
      if (attributeNamespace === Namespace.XMLNS) {
        if (attributePrefix === null) {
          // default namespace declaration
          defaultNamespaceAttrValue = attr.value
          continue
        } else {
          // attribute is a namespace prefix definition
          let prefixDefinition = attr.localName
          let namespaceDefinition = attr.value
          if (refs.map.has(namespaceDefinition) && 
            refs.map.get(namespaceDefinition) === prefixDefinition) {
            refs.duplicatePrefixDefinition = prefixDefinition
          } else {
            refs.map.set(namespaceDefinition, prefixDefinition)
          }
          refs.list.push(prefixDefinition)
        }
      }
    }

    return defaultNamespaceAttrValue
  }

  /**
   * Generates a new prefix for the given namespace.
   * 
   * @param newNamespace - a namespace to generate prefix for
   * @param refs - reference parameters
   */
  private _generatePrefix(newNamespace: string | null,
    refs: { map: Map<string | null, string>, prefixIndex: number }): string {

    let generatedPrefix = "ns" + refs.prefixIndex
    refs.prefixIndex++
    refs.map.set(newNamespace, generatedPrefix)
    return generatedPrefix
  }

}