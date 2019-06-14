import {
  XMLWriter, WriterOptions, XMLBuilderOptions, WriterState, XMLSerializedValue
} from "./interfaces"
import {
  Node, Attr, XMLDocument, Element, Text, CDATASection,
  Comment, ProcessingInstruction, NodeType, DocumentFragment
} from "../dom/interfaces"
import { Namespace } from "../dom/spec"
import { Char } from "./util/Char"
import { TupleSet } from "../util"

/**
 * Serializes XML nodes into strings.
 */
export class XMLObjectWriterImpl implements XMLWriter<XMLSerializedValue> {

  private _builderOptions: XMLBuilderOptions

  /**
   * Initializes a new instance of `XMLObjectWriterImpl`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderOptions) {
    this._builderOptions = builderOptions
  }

  /** @inheritdoc */
  serialize(node: Node, options?: WriterOptions): XMLSerializedValue {
    let refs: any = {}
    refs.prefixMap = new Map<string | null, string>()
    refs.prefixMap.set(Namespace.XML, "xml")
    refs.prefixIndex = 1
    refs.namespace = null
    options = options || {}

    return this._serializeNode(node, options, refs)
  }

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - current node
   * @param options - serialization options
   * @param refs - internal parameters passed to serializer functions
   */
  private _serializeNode(node: Node, options: WriterOptions, refs?: any): XMLSerializedValue {
    options.state = WriterState.None
    this.openNode(node, options, 0, refs)

    let obj: XMLSerializedValue = ""
    switch (node.nodeType) {
      case NodeType.Element:
        obj = this.element(<Element>node, options, 0, refs)
        break
      case NodeType.Document:
        obj = this.document(<XMLDocument>node, options, 0, refs)
        break
      case NodeType.Comment:
        obj = this.comment(<Comment>node, options, 0, refs)
        break
      case NodeType.Text:
        obj = this.text(<Text>node, options, 0, refs)
        break
      case NodeType.DocumentFragment:
        obj = this.documentFragment(<DocumentFragment>node, options, 0, refs)
        break
      case NodeType.DocumentType:
        // doctype is not serialized
        break
      case NodeType.ProcessingInstruction:
        obj = this.processingInstruction(<ProcessingInstruction>node, options, 0, refs)
        break
      case NodeType.CData:
        obj = this.cdata(<CDATASection>node, options, 0, refs)
        break
      default:
        throw new Error("Invalid node type.")
    }

    this.closeNode(node, options, 0, refs)
    options.state = WriterState.None

    return obj
  }

  /** @inheritdoc */
  document(node: XMLDocument, options: WriterOptions, level: number, refs?: any): XMLSerializedValue {
    let markup = new Array<XMLSerializedValue>()
    markup.push(this._serializeChildNodes(node.childNodes.values(), options, refs))
    return markup
  }

  /** @inheritdoc */
  documentFragment(node: DocumentFragment, options: WriterOptions, level: number, refs?: any): XMLSerializedValue {
    let markup = new Array<XMLSerializedValue>()
    markup.push(this._serializeChildNodes(node.childNodes.values(), options, refs))
    return markup
  }

  /** @inheritdoc */
  element(node: Element, options: WriterOptions, level: number, refs?: any): XMLSerializedValue {
    options.state = WriterState.OpenTag
    let markup = new Map<string, XMLSerializedValue>()
    let attributes = new Map<string, string>()
    let qualifiedName = ''
    let skipEndTag = false
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
          const generateRefs = { map: map, prefixIndex: refs.prefixIndex }
          prefix = this._generatePrefix(ns, generateRefs)
          refs.prefixIndex = generateRefs.prefixIndex
        } else {
          map.set(ns, prefix)
        }
        qualifiedName = `${prefix}:${node.localName}`
        // serialize the new namespace/prefix association just added to the map
        refs.attrName = 'xmlns:' + prefix
        refs.attrValue = ns
        const attResult = <Map<string, string>>this.attribute(<Attr><unknown>null, options, level, refs)
        for(const [key, val] of attResult) {
          attributes.set(key, val)
        }
      } else if (localDefaultNamespace === null ||
        (localDefaultNamespace !== null && localDefaultNamespace !== ns)) {
        ignoreNamespaceDefinitionAttribute = true
        qualifiedName = node.localName
        // the new default namespace will be used in the serialization to 
        // define this node's namespace and act as the context namespace for 
        // its children
        inheritedNS = ns
        refs.attrName = 'xmlns'
        refs.attrValue = ns
        // serialize the new (or replacement) default namespace definition
        const attResult = <Map<string, string>>this.attribute(<Attr><unknown>null, options, level, refs)
        for(const [key, val] of attResult) {
          attributes.set(key, val)
        }        
      } else {
        // node has a local default namespace that matches ns
        qualifiedName = node.localName
        inheritedNS = ns
      }
    }

    const attRefs = { namespacePrefixMap: map, prefixIndex: refs.prefixIndex }
    const attResult = this._serializeAttributes(node, options, level, attRefs,
      ignoreNamespaceDefinitionAttribute, duplicatePrefixDefinition)
    refs.prefixIndex = attRefs.prefixIndex
    let key: string, val: any
    for([key, val] of attResult) {
      attributes.set(key, val)
    }

    // serialize child-nodes
    options.state = WriterState.InsideTag
    markup.set(qualifiedName, this._serializeChildNodes(node.childNodes.values(), options, refs))

    options.state = WriterState.None
    return markup
  }

  /** @inheritdoc */
  text(node: Text, options: WriterOptions, level: number, refs?: any): XMLSerializedValue {
    return node.data
  }

  /** @inheritdoc */
  cdata(node: CDATASection, options: WriterOptions, level: number, refs?: any): XMLSerializedValue {
    return node.data
  }

  /** @inheritdoc */
  comment(node: Comment, options: WriterOptions, level: number, refs?: any): XMLSerializedValue {
    return node.data
  }

  /** @inheritdoc */
  processingInstruction(node: ProcessingInstruction, options: WriterOptions, level: number, refs?: any): XMLSerializedValue {
    return node.data
  }

  /** @inheritdoc */
  attribute(node: Attr, options: WriterOptions, level: number, refs?: any): XMLSerializedValue {
    let attrName: string = refs.attrName || node.name
    let attrValue: string = Char.escapeAttrValue(refs.attrValue || node.value)
    let result = new Map<string, string>([[attrName, attrValue]])
    refs.attrName = undefined
    refs.attrValue = undefined
    return result
  }

  /** @inheritdoc */
  openNode(node: Node, options: WriterOptions, level: number, refs?: any): void { }

  /** @inheritdoc */
  closeNode(node: Node, options: WriterOptions, level: number, refs?: any): void { }

  /** @inheritdoc */
  openAttribute(node: Attr, options: WriterOptions, level: number, refs?: any): void { }

  /** @inheritdoc */
  closeAttribute(node: Attr, options: WriterOptions, level: number, refs?: any): void { }

  /**
   * Returns key/value pairs for the given child nodes.
   * 
   * @param childNodes - child node list
   * @param options - serialization options
   * @param refs - reference parameters
   */
  _serializeChildNodes(childNodes: IterableIterator<Node>, options: WriterOptions, refs?: any): XMLSerializedValue {
    const items = new Array<[string, Node]>()
    const keyCount = new Map<string, number>()
    const keyIndices = new Map<string, number>()
    let hasDuplicateKeys = false

    for (const node of childNodes) {
      const [key, canIncrement] = this._getNodeKey(node)
      items.push([key, node])
      let count = keyCount.get(key)
      count = (count || 0) + 1
      if(!hasDuplicateKeys && !canIncrement && count > 1) [
        hasDuplicateKeys = true
      ]
      keyCount.set(key, count)
      keyIndices.set(key, 0)
    }

    if (hasDuplicateKeys) {
      // child nodes have duplicate keys
      // return an array
      const result = new Array<XMLSerializedValue>()
      for (const [key, node] of items) {
        const nodeResult = this._serializeNode(node, options, refs)
        result.push(new Map<string, XMLSerializedValue>([[key, nodeResult]]))
      }
      return result
    } else {
      // child nodes have unique keys
      // return a map
      const result = new Map<string, XMLSerializedValue>()
      for (const [key, node] of items) {
        let uniqueKey = key
        if (keyCount.get(key) || 0 > 1) {
          let index = (keyIndices.get(key) || 0) + 1
          uniqueKey = key + index.toString()
          keyIndices.set(key, index)
        }
        const nodeResult = this._serializeNode(node, options, refs)
        result.set(uniqueKey, nodeResult)
      }
      return result
    }
  }

  /**
   * Produces an XML serialization of the attributes of an element node.
   * 
   * @param node - element node whose attributes to serialize
   * @param options - serialization options
   * @param level - curent depth of the XML tree
   * @param refs - reference parameters
   * @param ignoreNamespaceDefinitionAttribute - whether to ignore namespace
   * @param duplicatePrefixDefinition - duplicate prefix definition
   * definition attribute
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeAttributes(node: Element,
    options: WriterOptions, level: number,
    refs: {
      namespacePrefixMap: Map<string | null, string>,
      prefixIndex: number
    },
    ignoreNamespaceDefinitionAttribute: boolean,
    duplicatePrefixDefinition: string | null): Map<string, string> {

    let result = new Map<string, string>()

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
            const generateRefs = { map: refs.namespacePrefixMap, prefixIndex: refs.prefixIndex }
            candidatePrefix = this._generatePrefix(attributeNamespace, generateRefs)
            refs.prefixIndex = generateRefs.prefixIndex
          } else {
            candidatePrefix = attr.prefix
          }

          refs.namespacePrefixMap.set(attributeNamespace, candidatePrefix)
          if (candidatePrefix !== "xmlns") {
            localNameSet.set([attributeNamespace, candidatePrefix])
            const attRef = { attrName: 'xmlns:' + candidatePrefix, attrValue: attributeNamespace }
            const attResult = <Map<string, string>>this.attribute(<Attr><unknown>null, options, level, attRef)
            for (const [key, val] of attResult) {
              result.set(key, val)
            }
          }
        }
      }

      let attrName = ''
      if (candidatePrefix !== null) {
        attrName = candidatePrefix + ':'
      }

      attrName += attr.localName
      let attResult = <Map<string, string>>this.attribute(attr, options, level, { attrName: attrName })
      for (const [key, val] of attResult) {
        result.set(key, val)
      }
    }

    return result
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
    refs: {
      map: Map<string | null, string>, list: string[],
      duplicatePrefixDefinition: string | null
    }): string | null {

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

  /**
   * Returns an object key for the given node.
   * 
   * @param node - node to get a key for
   * 
   * @returns a two-tuple whose first value is the node key and second value
   * is a boolean determining whether the key can be prefixed with a random 
   * string to provide uniqueness.
   */
  private _getNodeKey(node: Node): [string, boolean] {
    switch (node.nodeType) {
      case NodeType.Element:
        return [(<Element>node).tagName, false]
      case NodeType.Comment:
        return [this._builderOptions.convertCommentKey || '#comment', true]
      case NodeType.Text:
        return [this._builderOptions.convertTextKey || '#text', true]
      case NodeType.ProcessingInstruction:
        return [(this._builderOptions.convertPIKey || '?') + (<ProcessingInstruction>node).target, false]
      case NodeType.CData:
        return [this._builderOptions.convertCDataKey || '#cdata', true]
      default:
        throw new Error("Invalid node type.")
    }
  }

}