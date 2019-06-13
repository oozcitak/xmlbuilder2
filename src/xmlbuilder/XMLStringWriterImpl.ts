import { 
  XMLWriter, WriterOptions, XMLBuilderOptions, WriterState 
} from "./interfaces"
import { 
  Node, Attr, XMLDocument, Element, DocumentType, Text, CDATASection,
  Comment, ProcessingInstruction, NodeType, DocumentFragment
} from "../dom/interfaces"
import { Namespace } from "../dom/spec"
import { Char } from "./util/Char"
import { TupleSet } from "../util"

/**
 * Serializes a XML nodes into strings.
 */
export class XMLStringWriterImpl implements XMLWriter<string> {

  private _builderOptions: XMLBuilderOptions

  /**
   * Initializes a new instance of `XMLStringWriter`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderOptions) {
    this._builderOptions = builderOptions
  }

  /** @inheritdoc */
  serialize(node: Node, options?: WriterOptions): string {
    let refs: any = {}
    refs.prefixMap = new Map<string | null, string>()
    refs.prefixMap.set(Namespace.XML, "xml")
    refs.prefixIndex = 1
    refs.namespace = null
    options = options || {}

    return this._serializeNode(node, options, options.offset || 0, refs)
  }

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - current node
   * @param options - serialization options
   * @param level - curent depth of the XML tree
   * @param refs - internal parameters passed to serializer functions
   */
  private _serializeNode(node: Node, options: WriterOptions, level: number, refs?: any): string {
    options.state = WriterState.None
    this.openNode(node, options, level, refs)

    let markup = ''
    switch (node.nodeType) {
      case NodeType.Element:
        markup = this.element(<Element>node, options, level, refs)
        break
      case NodeType.Document:
        markup = this.document(<XMLDocument>node, options, level, refs)
        break
      case NodeType.Comment:
        markup = this.comment(<Comment>node, options, level, refs)
        break
      case NodeType.Text:
        markup = this.text(<Text>node, options, level, refs)
        break
      case NodeType.DocumentFragment:
        markup = this.documentFragment(<DocumentFragment>node, options, level, refs)
        break
      case NodeType.DocumentType:
        markup = this.documentType(<DocumentType>node, options, level, refs)
        break
      case NodeType.ProcessingInstruction:
        markup = this.processingInstruction(<ProcessingInstruction>node, options, level, refs)
        break
      case NodeType.CData:
        markup = this.cdata(<CDATASection>node, options, level, refs)
        break
      default:
        throw new Error("Invalid node type.")
    }

    this.closeNode(node, options, level, refs)
    options.state = WriterState.None

    return markup
  }

  /** @inheritdoc */
  document(node: XMLDocument, options: WriterOptions, level: number, refs?: any): string {
    let markup = ""

    if(!options.headless) {
      markup = this.beginLine(node, options, level, refs) + '<?xml'
      markup += ' version="' + (this._builderOptions.version || "1.0") + '"'
      if (this._builderOptions.encoding !== undefined) {
        markup += ' encoding="' + this._builderOptions.encoding + '"'
      }
      if (this._builderOptions.standalone !== undefined) {
        markup += ' standalone="' + (this._builderOptions.standalone ? "yes" : "no") + '"'
      }
      markup += "?>" + this.endLine(node, options, level, refs)
    }

    for (const childNode of node.childNodes) {
      markup += this._serializeNode(childNode, options, level, refs)
    }

    return markup
  }

  /** @inheritdoc */
  documentType(node: DocumentType, options: WriterOptions, level: number, refs?: any): string {
    let markup = this.beginLine(node, options, level, refs)

    if (node.publicId && node.systemId) {
      markup += `<!DOCTYPE ${node.name} PUBLIC "${node.publicId}" "${node.systemId}">`
    } else if (node.publicId) {
      markup += `<!DOCTYPE ${node.name} PUBLIC "${node.publicId}">`
    } else if (node.systemId) {
      markup += `<!DOCTYPE ${node.name} SYSTEM "${node.systemId}">`
    } else {
      markup += `<!DOCTYPE ${node.name}>`
    }

    markup += this.endLine(node, options, level, refs)
    return markup
  }

  /** @inheritdoc */
  documentFragment(node: DocumentFragment, options: WriterOptions, level: number, refs?: any): string {
    let markup = ''

    for (const childNode of node.childNodes) {
      markup += this._serializeNode(childNode, options, level, refs)
    }

    return markup
  }

  /** @inheritdoc */
  element(node: Element, options: WriterOptions, level: number, refs?: any): string {
    options.state = WriterState.OpenTag
    let markup = this.beginLine(node, options, level, refs) + '<'
    let qualifiedName = ''
    let skipEndTag = false
    let ignoreNamespaceDefinitionAttribute = false
    let map = new Map<string | null, string>(refs.prefixMap)
    let elementPrefixesList: string[] = []
    let duplicatePrefixDefinition: string | null = null
    let localDefaultNamespace = this._recordNamespaceInformation(node, 
      { map: map, list: elementPrefixesList, 
        duplicatePrefixDefinition: duplicatePrefixDefinition })
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
        refs.attrName = 'xmlns:' + prefix
        refs.attrValue = ns
        markup += ' ' + this.attribute(<Attr><unknown>null, options, level, refs)
      } else if (localDefaultNamespace === null || 
        (localDefaultNamespace !== null && localDefaultNamespace !== ns)) {
        ignoreNamespaceDefinitionAttribute = true
        qualifiedName = node.localName
        // the new default namespace will be used in the serialization to 
        // define this node's namespace and act as the context namespace for 
        // its children
        inheritedNS = ns
        markup += qualifiedName
        refs.attrName = 'xmlns'
        refs.attrValue = ns        
        // serialize the new (or replacement) default namespace definition
        markup += ' ' + this.attribute(<Attr><unknown>null, options, level, refs)
      } else {
        // node has a local default namespace that matches ns
        qualifiedName = node.localName
        inheritedNS = ns
        markup += qualifiedName
      }
    }

    const attRefs = { namespacePrefixMap: map, prefixIndex: refs.prefixIndex }
    markup += this._serializeAttributes(node, options, level, attRefs, 
      ignoreNamespaceDefinitionAttribute, duplicatePrefixDefinition)
    refs.prefixIndex = attRefs.prefixIndex

    if (!node.hasChildNodes()) {
      // self closing tag
      if (options.spaceBeforeSlash) {
        markup += ' '
      }
      markup += "/"
      skipEndTag = true
    }

    markup += ">"

    if (skipEndTag) {
      // leaf-node, no need to process child nodes
      markup += this.endLine(node, options, level, refs)
      options.state = WriterState.None
      return markup
    }

    // serialize child-nodes
    options.state = WriterState.InsideTag
    for (const childNode of node.childNodes) {
      const childRefs = { prefixMap: map, prefixIndex: refs.prefixIndex, namespace: inheritedNS }
      markup += this._serializeNode(childNode, options, level + 1, childRefs)
      refs.prefixIndex = childRefs.prefixIndex
    }

    options.state = WriterState.CloseTag
    markup += `</${options.spaceBeforeSlash ? ' ' : ''}${qualifiedName}>`
    markup += this.endLine(node, options, level, refs)
    options.state = WriterState.None
    return markup
  }

  /** @inheritdoc */
  text(node: Text, options: WriterOptions, level: number, refs?: any): string {
    return this.beginLine(node, options, level, refs) + 
      Char.escapeText(node.data) + 
      this.endLine(node, options, level, refs)
  }

  /** @inheritdoc */
  cdata(node: CDATASection, options: WriterOptions, level: number, refs?: any): string {
    return this.beginLine(node, options, level, refs) + 
      `<![CDATA[${node.data}]]>` + 
      this.endLine(node, options, level, refs)    
  }

  /** @inheritdoc */
  comment(node: Comment, options: WriterOptions, level: number, refs?: any): string {
    return this.beginLine(node, options, level, refs) + 
      `<!--${node.data}-->` + 
      this.endLine(node, options, level, refs)  
  }

  /** @inheritdoc */
  processingInstruction(node: ProcessingInstruction, options: WriterOptions, level: number, refs?: any): string {
    return this.beginLine(node, options, level, refs) + 
      `<?${node.target} ${node.data}?>` + 
      this.endLine(node, options, level, refs)  
  }

  /** @inheritdoc */
  attribute(node: Attr, options: WriterOptions, level: number, refs?: any): string {
    let markup = refs.attrName || node.name
    markup += '="' + Char.escapeAttrValue(refs.attrValue || node.value) + '"'
    refs.attrName = undefined
    refs.attrValue = undefined
    return markup
  }

  /** @inheritdoc */
  beginLine(node: Node, options: WriterOptions, level: number, refs?: any): string {
    if (options.prettyPrint && !refs.suppressPrettyCount) {
      const indentLevel = level + 1
      if (indentLevel > 0) {
        return new Array(indentLevel).join(options.indent || '  ')
      }
    }

    return ''
  }

  /** @inheritdoc */
  endLine(node: Node, options: WriterOptions, level: number, refs?: any): string {
    if (options.prettyPrint && !refs.suppressPrettyCount) {
      return options.newline || '\n'
    } else {
      return ''
    }
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
    refs: { namespacePrefixMap: Map<string | null, string>,
      prefixIndex: number },
    ignoreNamespaceDefinitionAttribute: boolean, 
    duplicatePrefixDefinition: string | null): string {

    let result = ""

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
          if(attr.prefix === null || refs.namespacePrefixMap.has(attributeNamespace)) {
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
            result += ' ' + this.attribute(<Attr><unknown>null, options, level, attRef)
          }
        }
      }

      let attrName = ''
      if (candidatePrefix !== null) {
        attrName = candidatePrefix + ':'
      }

      attrName += attr.localName
      result += ' ' + this.attribute(attr, options, level, { attrName: attrName })
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