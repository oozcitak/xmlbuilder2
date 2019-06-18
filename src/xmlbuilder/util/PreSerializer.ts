import { Node, Element, NodeType } from "../../dom/interfaces"
import { Namespace } from "../../dom/spec"
import { TupleSet } from "../../util"
import { 
  PreSerializedNode, PreSerializedAttr, PreSerializedNS 
} from "../interfaces"

interface NodeParamRefs {
  prefixMap: Map<string | null, string>,
  prefixIndex: number,
  namespace: string | null
}

interface AttrParamRefs {
  namespacePrefixMap: Map<string | null, string>,
  prefixIndex: number
}

/**
 * Pre-serializes XML nodes.
 */
export class PreSerializer {

  /**
   * Initializes a new instance of `PreSerializer`.
   */
  private constructor() { }

  /**
   * Produces an XML serialization of the given node. The pre-serializer inserts
   * namespace declarations where necessary and produces qualified names for
   * nodes and attributes.
   * 
   * A serializer should process each `PreSerializedNode` produced by this
   * function and use the information provided to serialize the node.
   * 
   * @param node - node to serialize
   */
  static Serialize(node: Node): PreSerializedNode<Node> {
    const refs: NodeParamRefs = {
      prefixMap: new Map<string | null, string>(),
      prefixIndex: 1,
      namespace: null
    }
    refs.prefixMap.set(Namespace.XML, "xml")

    const serializer = new PreSerializer()
    return serializer._serializeNode(node, refs, 0)
  }

  /**
   * Produces an XML serialization of a node.
   * 
   * @param node - node to serialize
   * @param refs - reference parameters
   * @param level - current depth of the XML tree
   */
  private _serializeNode(node: Node, refs: NodeParamRefs, level: number): 
    PreSerializedNode<Node> {

    switch (node.nodeType) {
      case NodeType.Element:
        return this._serializeElement(<Element>node, refs, level)
      case NodeType.Document:
      case NodeType.DocumentFragment:
        const children: PreSerializedNode<Node>[] = []
        for (const childNode of node.childNodes) {
          children.push(this._serializeNode(childNode, refs, level))
        }
        return {
          node: node,
          level: level,
          attributes: [],
          children: children,
          namespaces: []
        }
      default:
        return {
          node: node,
          level: level,
          attributes: [],
          children: [],
          namespaces: []
        }
    }
  }

  /**
   * Produces an XML serialization of an element node.
   * 
   * @param node - node to serialize
   * @param refs - reference parameters
   * @param level - current depth of the XML tree
   */
  private _serializeElement(node: Element, refs: NodeParamRefs, level: number): 
    PreSerializedNode<Element> {

    let qualifiedName = ''
    const attributes: PreSerializedAttr[] = []
    const children: PreSerializedNode<Node>[] = []
    const namespaces: PreSerializedNS[] = []
    let ignoreNamespaceDefinitionAttribute = false
    let map = new Map<string | null, string>(refs.prefixMap)
    let elementPrefixesList: string[] = []
    let duplicatePrefixDefinition: string | null = null
    let localDefaultNamespace = this._recordNamespaceInformation(node,
      {
        map: map, list: elementPrefixesList,
        duplicatePrefixDefinition: duplicatePrefixDefinition
      })
    let inheritedNS = refs.namespace
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
      } else if (prefix !== null && localDefaultNamespace === null) {
        if (elementPrefixesList.includes(prefix)) {
          const generateRefs = { 
            namespacePrefixMap: map, 
            prefixIndex: refs.prefixIndex 
          }
          prefix = this._generatePrefix(ns, generateRefs)
          refs.prefixIndex = generateRefs.prefixIndex
        } else {
          map.set(ns, prefix)
        }
        qualifiedName = `${prefix}:${node.localName}`
        // serialize the new namespace/prefix association just added to the map
        namespaces.push( { name: 'xmlns:' + prefix, value: ns || '' })
      } else if (localDefaultNamespace === null ||
        (localDefaultNamespace !== null && localDefaultNamespace !== ns)) {
        ignoreNamespaceDefinitionAttribute = true
        qualifiedName = node.localName
        // the new default namespace will be used in the serialization to 
        // define this node's namespace and act as the context namespace for 
        // its children
        inheritedNS = ns
        // serialize the new (or replacement) default namespace definition
        namespaces.push({ name: 'xmlns', value: ns || '' })
      } else {
        // node has a local default namespace that matches ns
        qualifiedName = node.localName
        inheritedNS = ns
      }
    }

    // serialize element attributes
    const attRefs = { namespacePrefixMap: map, prefixIndex: refs.prefixIndex }
    const [eleAttributes, eleNamespaces] = this._serializeAttributes(
      node, attRefs,
      ignoreNamespaceDefinitionAttribute, duplicatePrefixDefinition)
    refs.prefixIndex = attRefs.prefixIndex
    attributes.push(...eleAttributes)
    namespaces.push(...eleNamespaces)

    // serialize child-nodes
    for (const childNode of node.childNodes) {
      const childRefs = { 
        prefixMap: map, 
        prefixIndex: refs.prefixIndex, 
        namespace: inheritedNS 
      }
      children.push(this._serializeNode(childNode, childRefs, level + 1))
      refs.prefixIndex = childRefs.prefixIndex
    }

    return {
      node: node,
      level: level,
      name: qualifiedName,
      attributes: attributes,
      children: children,
      namespaces: namespaces
    }
  }

  /**
  * Produces an XML serialization of the attributes of an element node.
  * 
  * @param node - element node whose attributes to serialize
  * @param refs - reference parameters
  * @param ignoreNamespaceDefinitionAttribute - whether to ignore namespace
  * @param duplicatePrefixDefinition - duplicate prefix definition attribute
  */
  private _serializeAttributes(node: Element, refs: AttrParamRefs,
    ignoreNamespaceDefinitionAttribute: boolean,
    duplicatePrefixDefinition: string | null): 
    [ PreSerializedAttr[], PreSerializedNS[] ] {

    const attrResult: PreSerializedAttr[] = []
    const nsResult: PreSerializedNS[] = []
    // Contains unique attribute namespaceURI and localName pairs
    // This set is used to [optionally] enforce the well-formed constraint that 
    // an element cannot have two attributes with the same namespaceURI and 
    // localName. This can occur when two otherwise identical attributes on the
    // same element differ only by their prefix values.    
    const localNameSet = new TupleSet<string | null, string>()
    for (const attr of node.attributes) {
      localNameSet.set([attr.namespaceURI, attr.localName])
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
          // we deviate from the spec here
          // see: https://github.com/w3c/DOM-Parsing/pull/30
          if (attr.prefix === null || refs.namespacePrefixMap.has(attributeNamespace)) {
            const generateRefs = { 
              namespacePrefixMap: refs.namespacePrefixMap, 
              prefixIndex: refs.prefixIndex 
            }
            candidatePrefix = this._generatePrefix(attributeNamespace, generateRefs)
            refs.prefixIndex = generateRefs.prefixIndex
          } else {
            candidatePrefix = attr.prefix
          }
          refs.namespacePrefixMap.set(attributeNamespace, candidatePrefix)
          if (candidatePrefix !== "xmlns") {
            localNameSet.set([attributeNamespace, candidatePrefix])
            nsResult.push({ name: 'xmlns:' + candidatePrefix, value: attributeNamespace })
          }
        }
      }
      let attrName = ''
      if (candidatePrefix !== null) {
        attrName = candidatePrefix + ':'
      }
      attrName += attr.localName
      attrResult.push({ attr: attr, name: attrName, value: attr.value })
    }

    return [attrResult, nsResult]
  }

  /**
  * Records namespace information for the given element and returns the 
  * default namespace attribute value.
  * 
  * @param node - element node to process
  * @param refs - reference parameters
  */
  private _recordNamespaceInformation(node: Element,
    refs: {
      map: Map<string | null, string>,
      list: string[],
      duplicatePrefixDefinition: string | null
    }): string | null {
    let defaultNamespaceAttrValue: string | null = null
    for (const attr of node.attributes) {
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
  private _generatePrefix(newNamespace: string | null, refs: AttrParamRefs): string {
    let generatedPrefix = "ns" + refs.prefixIndex
    refs.prefixIndex++
    refs.namespacePrefixMap.set(newNamespace, generatedPrefix)
    return generatedPrefix
  }

}