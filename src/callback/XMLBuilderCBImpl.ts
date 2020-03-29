import {
  XMLBuilderCB, AttributesObject, PIObject, DTDOptions, XMLBuilder,
  XMLBuilderCBOptions, XMLBuilderCreateOptions, DefaultXMLBuilderCBOptions,
  ExpandObject, XMLBuilderCBCreateOptions, XMLBuilderOptions, BaseCBWriterOptions
} from "../interfaces"
import { applyDefaults, isString, isObject } from "@oozcitak/util"
import { fragment, create } from ".."
import {
  xml_isName, xml_isLegalChar, xml_isPubidChar
} from "@oozcitak/dom/lib/algorithm"
import { namespace as infraNamespace } from "@oozcitak/infra"
import { NamespacePrefixMap } from "@oozcitak/dom/lib/serializer/NamespacePrefixMap"
import {
  Comment, Text, ProcessingInstruction, CDATASection, DocumentType, Element, Node
} from "@oozcitak/dom/lib/dom/interfaces"
import { LocalNameSet } from "@oozcitak/dom/lib/serializer/LocalNameSet"
import { Guard } from "@oozcitak/dom/lib/util"
import { BaseCBWriter } from "../writers/BaseCBWriter"
import { XMLCBWriter } from "../writers/XMLCBWriter"
import { JSONCBWriter } from "../writers/JSONCBWriter"
import { EventEmitter } from "events"

/**
 * Stores the last generated prefix. An object is used instead of a number so
 * that the value can be passed by reference.
 */
type PrefixIndex = { value: number }

/**
 * Represents a readable XML document stream.
 */
export class XMLBuilderCBImpl extends EventEmitter implements XMLBuilderCB {

  private static _VoidElementNames = new Set(['area', 'base', 'basefont',
    'bgsound', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'keygen',
    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'])

  private _options: Required<XMLBuilderCBOptions>
  private _builderOptions: XMLBuilderCreateOptions
  private _writer: BaseCBWriter<BaseCBWriterOptions>
  private _fragment: boolean

  private _hasDeclaration = false
  private _docTypeName = ""
  private _hasDocumentElement = false
  private _currentElement?: XMLBuilder
  private _currentElementSerialized = false
  private _openTags: Array<[string, string | null, NamespacePrefixMap, boolean]> = []

  private _namespace: string | null
  private _prefixMap: NamespacePrefixMap
  private _prefixIndex: PrefixIndex

  private _ended = false

  /**
   * Initializes a new instance of `XMLStream`.
   * 
   * @param options - stream writer options
   * @param fragment - whether to create fragment stream or a document stream
   * 
   * @returns XML stream
   */
  public constructor(options?: XMLBuilderCBCreateOptions, fragment = false) {
    super()

    this._fragment = fragment

    // provide default options
    this._options = applyDefaults(options || {},
      DefaultXMLBuilderCBOptions
    ) as Required<XMLBuilderCBOptions>

    this._builderOptions = {
      defaultNamespace: this._options.defaultNamespace,
      namespaceAlias: this._options.namespaceAlias
    }

    this._writer = this._options.format === "xml" ? new XMLCBWriter(this._options) : new JSONCBWriter(this._options)

    // automatically create listeners for callbacks passed via options
    if (this._options.data !== undefined) {
      this.on("data", this._options.data)
    }
    if (this._options.end !== undefined) {
      this.on("end", this._options.end)
    }
    if (this._options.error !== undefined) {
      this.on("error", this._options.error)
    }

    this._namespace = null
    this._prefixMap = new NamespacePrefixMap()
    this._prefixMap.set("xml", infraNamespace.XML)
    this._prefixIndex = { value: 1 }
  }

  /** @inheritdoc */
  ele(p1: string | null | ExpandObject, p2?: AttributesObject | string,
    p3?: AttributesObject): this {

    // parse if JS object or XML or JSON string
    if (isObject(p1) || (isString(p1) && (/^\s*</.test(p1) || /^\s*[\{\[]/.test(p1)))) {
      const frag = fragment().set(this._options as unknown as Partial<XMLBuilderOptions>)
      try {
        frag.ele(p1 as any)
      } catch (err) {
        this.emit("error", err)
        return this
      }

      for (const node of frag.node.childNodes) {
        this._fromNode(node)
      }
      return this
    }

    this._serializeOpenTag(true)

    if (!this._fragment && this._hasDocumentElement && this._writer.level === 0) {
      this.emit("error", new Error("Document cannot have multiple document element nodes."))
      return this
    }

    try {
      this._currentElement = fragment(this._builderOptions).ele(p1 as any, p2 as any, p3 as any)
    } catch (err) {
      this.emit("error", err)
      return this
    }

    if (!this._fragment && !this._hasDocumentElement && this._docTypeName !== ""
      && (this._currentElement.node as Element)._qualifiedName !== this._docTypeName) {
      this.emit("error", new Error("Document element name does not match DocType declaration name."))
      return this
    }

    this._currentElementSerialized = false
    if (!this._fragment) {
      this._hasDocumentElement = true
    }

    return this
  }

  /** @inheritdoc */
  att(p1: AttributesObject | string | null, p2?: string, p3?: string): this {
    if (this._currentElement === undefined) {
      this.emit("error", new Error("Cannot insert an attribute node as child of a document node."))
      return this
    }
    try {
      this._currentElement.att(p1 as any, p2 as any, p3 as any)
    } catch (err) {
      this.emit("error", err)
      return this
    }
    return this
  }

  /** @inheritdoc */
  com(content: string): this {
    this._serializeOpenTag(true)

    let node: Comment
    try {
      node = fragment(this._builderOptions).com(content).first().node as Comment
    } catch (err) {
      /* istanbul ignore next */
      this.emit("error", err)
      /* istanbul ignore next */
      return this
    }

    if (this._options.wellFormed && (!xml_isLegalChar(node.data) ||
      node.data.indexOf("--") !== -1 || node.data.endsWith("-"))) {
      this.emit("error", new Error("Comment data contains invalid characters (well-formed required)."))
      return this
    }

    this._push(this._writer.comment(node.data))
    return this
  }

  /** @inheritdoc */
  txt(content: string): this {
    if (!this._fragment && this._currentElement === undefined) {
      this.emit("error", new Error("Cannot insert a text node as child of a document node."))
      return this
    }
    this._serializeOpenTag(true)

    let node: Text
    try {
      node = fragment(this._builderOptions).txt(content).first().node as Text
    } catch (err) {
      /* istanbul ignore next */
      this.emit("error", err)
      /* istanbul ignore next */
      return this
    }

    if (this._options.wellFormed && !xml_isLegalChar(node.data)) {
      this.emit("error", new Error("Text data contains invalid characters (well-formed required)."))
      return this
    }

    let result = ""
    for (let i = 0; i < node.data.length; i++) {
      const c = node.data[i]
      if (c === "&")
        result += "&amp;"
      else if (c === "<")
        result += "&lt;"
      else if (c === ">")
        result += "&gt;"
      else
        result += c
    }

    this._push(this._writer.text(result))
    return this
  }

  /** @inheritdoc */
  ins(target: string | PIObject, content: string = ''): this {
    this._serializeOpenTag(true)

    let node: ProcessingInstruction
    try {
      node = fragment(this._builderOptions).ins(target as any, content).first().node as ProcessingInstruction
    } catch (err) {
      /* istanbul ignore next */
      this.emit("error", err)
      /* istanbul ignore next */
      return this
    }

    if (this._options.wellFormed && (node.target.indexOf(":") !== -1 || (/^xml$/i).test(node.target))) {
      this.emit("error", new Error("Processing instruction target contains invalid characters (well-formed required)."))
      return this
    }

    if (this._options.wellFormed && !xml_isLegalChar(node.data)) {
      this.emit("error", Error("Processing instruction data contains invalid characters (well-formed required)."))
      return this
    }

    this._push(this._writer.instruction(node.target, node.data))

    return this
  }

  /** @inheritdoc */
  dat(content: string): this {
    this._serializeOpenTag(true)

    let node: CDATASection
    try {
      node = fragment(this._builderOptions).dat(content).first().node as CDATASection
    } catch (err) {
      this.emit("error", err)
      return this
    }

    this._push(this._writer.cdata(node.data))
    return this
  }

  /** @inheritdoc */
  dec(options: { version?: "1.0", encoding?: string, standalone?: boolean } = { version: "1.0" }): this {
    if (this._fragment) {
      this.emit("error", Error("Cannot insert an XML declaration into a document fragment."))
      return this
    }

    if (this._hasDeclaration) {
      this.emit("error", Error("XML declaration is already inserted."))
      return this
    }

    this._push(this._writer.declaration(options.version || "1.0", options.encoding, options.standalone))
    this._hasDeclaration = true

    return this
  }

  /** @inheritdoc */
  dtd(options: DTDOptions & { name: string }): this {
    if (this._fragment) {
      this.emit("error", Error("Cannot insert a DocType declaration into a document fragment."))
      return this
    }

    if (this._docTypeName !== "") {
      this.emit("error", new Error("DocType declaration is already inserted."))
      return this
    }

    if (this._hasDocumentElement) {
      this.emit("error", new Error("Cannot insert DocType declaration after document element."))
      return this
    }

    let node: DocumentType
    try {
      node = create().dtd(options).first().node as DocumentType
    } catch (err) {
      this.emit("error", err)
      return this
    }

    if (this._options.wellFormed && !xml_isPubidChar(node.publicId)) {
      this.emit("error", new Error("DocType public identifier does not match PubidChar construct (well-formed required)."))
      return this
    }

    if (this._options.wellFormed &&
      (!xml_isLegalChar(node.systemId) ||
        (node.systemId.indexOf('"') !== -1 && node.systemId.indexOf("'") !== -1))) {
      this.emit("error", new Error("DocType system identifier contains invalid characters (well-formed required)."))
      return this
    }

    this._docTypeName = options.name
    this._push(this._writer.docType(options.name, node.publicId, node.systemId))
    return this
  }

  /** @inheritdoc */
  up(): this {
    this._serializeOpenTag(false)
    this._serializeCloseTag()
    return this
  }

  /** @inheritdoc */
  end(): this {
    this._serializeOpenTag(false)
    while (this._openTags.length > 0) {
      this._serializeCloseTag()
    }

    this._push(null)
    return this
  }

  /**
   * Serializes the opening tag of an element node.
   * 
   * @param hasChildren - whether the element node has child nodes
   */
  private _serializeOpenTag(hasChildren: boolean): void {
    if (this._currentElementSerialized) return
    if (this._currentElement === undefined) return
    const node = this._currentElement.node as Element

    if (this._options.wellFormed && (node.localName.indexOf(":") !== -1 ||
      !xml_isName(node.localName))) {
      this.emit("error", new Error("Node local name contains invalid characters (well-formed required)."))
      return
    }

    let qualifiedName = ""
    let ignoreNamespaceDefinitionAttribute = false
    let map = this._prefixMap.copy()
    let localPrefixesMap: { [key: string]: string } = {}
    let localDefaultNamespace = this._recordNamespaceInformation(node, map, localPrefixesMap)
    let inheritedNS = this._namespace
    let ns = node.namespaceURI

    if (inheritedNS === ns) {
      if (localDefaultNamespace !== null) {
        ignoreNamespaceDefinitionAttribute = true
      }

      if (ns === infraNamespace.XML) {
        qualifiedName = "xml:" + node.localName
      } else {
        qualifiedName = node.localName
      }

      this._writer.beginElement(qualifiedName)
      this._push(this._writer.openTagBegin(qualifiedName))
    } else {
      let prefix = node.prefix
      let candidatePrefix: string | null = null
      if (prefix !== null || ns !== localDefaultNamespace) {
        candidatePrefix = map.get(prefix, ns)
      }
      if (prefix === "xmlns") {
        if (this._options.wellFormed) {
          this.emit("error", new Error("An element cannot have the 'xmlns' prefix (well-formed required)."))
          return
        }

        candidatePrefix = prefix
      }

      if (candidatePrefix !== null) {
        qualifiedName = candidatePrefix + ':' + node.localName
        if (localDefaultNamespace !== null && localDefaultNamespace !== infraNamespace.XML) {
          inheritedNS = localDefaultNamespace || null
        }

        this._writer.beginElement(qualifiedName)
        this._push(this._writer.openTagBegin(qualifiedName))
      } else if (prefix !== null) {
        if (prefix in localPrefixesMap) {
          prefix = this._generatePrefix(ns, map, this._prefixIndex)
        }

        map.set(prefix, ns)
        qualifiedName += prefix + ':' + node.localName

        this._writer.beginElement(qualifiedName)
        this._push(this._writer.openTagBegin(qualifiedName))

        this._push(this._writer.attribute("xmlns:" + prefix,
          this._serializeAttributeValue(ns, this._options.wellFormed)))

        if (localDefaultNamespace !== null) {
          inheritedNS = localDefaultNamespace || null
        }

      } else if (localDefaultNamespace === null ||
        (localDefaultNamespace !== null && localDefaultNamespace !== ns)) {
        ignoreNamespaceDefinitionAttribute = true
        qualifiedName += node.localName
        inheritedNS = ns

        this._writer.beginElement(qualifiedName)
        this._push(this._writer.openTagBegin(qualifiedName))

        this._push(this._writer.attribute("xmlns",
          this._serializeAttributeValue(ns, this._options.wellFormed)))
      } else {
        qualifiedName += node.localName
        inheritedNS = ns

        this._writer.beginElement(qualifiedName)
        this._push(this._writer.openTagBegin(qualifiedName))
      }
    }

    this._serializeAttributes(node, map, this._prefixIndex, localPrefixesMap,
      ignoreNamespaceDefinitionAttribute, this._options.wellFormed)

    const isHTML = (ns === infraNamespace.HTML)
    if (isHTML && !hasChildren &&
      XMLBuilderCBImpl._VoidElementNames.has(node.localName)) {
      this._push(this._writer.openTagEnd(qualifiedName, true, true))
      this._writer.endElement(qualifiedName)
    } else if (!isHTML && !hasChildren) {
      this._push(this._writer.openTagEnd(qualifiedName, true, false))
      this._writer.endElement(qualifiedName)
    } else {
      this._push(this._writer.openTagEnd(qualifiedName, false, false))
    }

    this._currentElementSerialized = true
    /**
     * Save qualified name, original inherited ns, original prefix map, and
     * hasChildren flag.
     */
    this._openTags.push([qualifiedName, this._namespace, this._prefixMap, hasChildren])

    /**
     * New values of inherited namespace and prefix map will be used while
     * serializing child nodes. They will be returned to their original values
     * when this node is closed using the _openTags array item we saved above.
     */
    this._namespace = inheritedNS
    if (this._isPrefixMapModified(this._prefixMap, map)) {
      this._prefixMap = map
    }

    /**
     * Calls following this will either serialize child nodes or close this tag.
     */
    this._writer.level++
  }

  /**
   * Serializes the closing tag of an element node.
   */
  private _serializeCloseTag(): void {
    this._writer.level--
    const lastEle = this._openTags.pop()
    /* istanbul ignore next */
    if (lastEle === undefined) {
      this.emit("error", new Error("Last element is undefined."))
      return
    }

    const [qualifiedName, ns, map, hasChildren] = lastEle
    /**
     * Restore original values of inherited namespace and prefix map.
     */
    this._namespace = ns
    this._prefixMap = map
    if (!hasChildren) return

    this._push(this._writer.closeTag(qualifiedName))
    this._writer.endElement(qualifiedName)
  }

  /**
   * Pushes data to internal buffer.
   * 
   * @param data - data
   */
  private _push(data: string | null): void {
    if (data === null) {
      this._ended = true
      this.emit("end")
    } else if (this._ended) {
      this.emit("error", new Error("Cannot push to ended stream."))
    } else if (data.length !== 0) {
      this._writer.hasData = true
      this.emit("data", data, this._writer.level)
    }
  }

  /**
   * Reads and serializes an XML tree.
   * 
   * @param node - root node
   */
  private _fromNode(node: Node) {
    if (Guard.isElementNode(node)) {
      const name = node.prefix ? node.prefix + ":" + node.localName : node.localName
      if (node.namespaceURI !== null) {
        this.ele(node.namespaceURI, name)
      } else {
        this.ele(name)
      }
      for (const attr of node.attributes) {
        const name = attr.prefix ? attr.prefix + ":" + attr.localName : attr.localName
        if (attr.namespaceURI !== null) {
          this.att(attr.namespaceURI, name, attr.value)
        } else {
          this.att(name, attr.value)
        }
      }
      for (const child of node.childNodes) {
        this._fromNode(child)
      }
      this.up()
    } else if (Guard.isExclusiveTextNode(node) && node.data) {
      this.txt(node.data)
    } else if (Guard.isCommentNode(node)) {
      this.com(node.data)
    } else if (Guard.isCDATASectionNode(node)) {
      this.dat(node.data)
    } else if (Guard.isProcessingInstructionNode(node)) {
      this.ins(node.target, node.data)
    }
  }

  /**
   * Produces an XML serialization of the attributes of an element node.
   * 
   * @param node - node to serialize
   * @param map - namespace prefix map
   * @param prefixIndex - generated namespace prefix index
   * @param localPrefixesMap - local prefixes map
   * @param ignoreNamespaceDefinitionAttribute - whether to ignore namespace
   * attributes
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeAttributes(node: Element, map: NamespacePrefixMap,
    prefixIndex: PrefixIndex, localPrefixesMap: { [key: string]: string },
    ignoreNamespaceDefinitionAttribute: boolean,
    requireWellFormed: boolean): void {

    const localNameSet = requireWellFormed ? new LocalNameSet() : undefined

    for (const attr of node.attributes) {
      // Optimize common case
      if (!requireWellFormed && !ignoreNamespaceDefinitionAttribute && attr.namespaceURI === null) {
        this._push(this._writer.attribute(attr.localName,
          this._serializeAttributeValue(attr.value, this._options.wellFormed)))
        continue
      }

      if (requireWellFormed && localNameSet && localNameSet.has(attr.namespaceURI, attr.localName)) {
        this.emit("error", new Error("Element contains duplicate attributes (well-formed required)."))
        return
      }

      if (requireWellFormed && localNameSet) localNameSet.set(attr.namespaceURI, attr.localName)
      let attributeNamespace = attr.namespaceURI
      let candidatePrefix: string | null = null

      if (attributeNamespace !== null) {
        candidatePrefix = map.get(attr.prefix, attributeNamespace)

        if (attributeNamespace === infraNamespace.XMLNS) {
          if (attr.value === infraNamespace.XML ||
            (attr.prefix === null && ignoreNamespaceDefinitionAttribute) ||
            (attr.prefix !== null && (!(attr.localName in localPrefixesMap) ||
              localPrefixesMap[attr.localName] !== attr.value) &&
              map.has(attr.localName, attr.value)))
            continue

          if (requireWellFormed && attr.value === infraNamespace.XMLNS) {
            this.emit("error", new Error("XMLNS namespace is reserved (well-formed required)."))
            return
          }

          if (requireWellFormed && attr.value === '') {
            this.emit("error", new Error("Namespace prefix declarations cannot be used to undeclare a namespace (well-formed required)."))
            return
          }

          if (attr.prefix === 'xmlns') candidatePrefix = 'xmlns'

          /**
           * _Note:_ The (candidatePrefix === null) check is not in the spec.
           * We deviate from the spec here. Otherwise a prefix is generated for
           * all attributes with namespaces.
           */
        } else if (candidatePrefix === null) {
          if (attr.prefix !== null &&
            (!map.hasPrefix(attr.prefix) ||
              map.has(attr.prefix, attributeNamespace))) {
            /**
             * Check if we can use the attribute's own prefix.  
             * We deviate from the spec here.
             * TODO: This is not an efficient way of searching for prefixes.
             * Follow developments to the spec.
             */
            candidatePrefix = attr.prefix
          } else {
            candidatePrefix = this._generatePrefix(attributeNamespace, map, prefixIndex)
          }

          this._push(this._writer.attribute("xmlns:" + candidatePrefix,
            this._serializeAttributeValue(attributeNamespace, this._options.wellFormed)))
        }
      }

      if (requireWellFormed && (attr.localName.indexOf(":") !== -1 ||
        !xml_isName(attr.localName) ||
        (attr.localName === "xmlns" && attributeNamespace === null))) {
        this.emit("error", new Error("Attribute local name contains invalid characters (well-formed required)."))
        return
      }

      this._push(this._writer.attribute(
        (candidatePrefix !== null ? candidatePrefix + ":" : "") + attr.localName,
        this._serializeAttributeValue(attr.value, this._options.wellFormed)))
    }
  }

  /**
   * Produces an XML serialization of an attribute value.
   * 
   * @param value - attribute value
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeAttributeValue(value: string | null, requireWellFormed: boolean): string {
    if (requireWellFormed && value !== null && !xml_isLegalChar(value)) {
      this.emit("error", new Error("Invalid characters in attribute value."))
      return ""
    }

    if (value === null) return ""

    let result = ""
    for (let i = 0; i < value.length; i++) {
      const c = value[i]
      if (c === "\"")
        result += "&quot;"
      else if (c === "&")
        result += "&amp;"
      else if (c === "<")
        result += "&lt;"
      else if (c === ">")
        result += "&gt;"
      else
        result += c
    }
    return result
  }

  /**
   * Records namespace information for the given element and returns the 
   * default namespace attribute value.
   * 
   * @param node - element node to process
   * @param map - namespace prefix map
   * @param localPrefixesMap - local prefixes map  
   */
  private _recordNamespaceInformation(node: Element, map: NamespacePrefixMap,
    localPrefixesMap: { [key: string]: string }): string | null {

    let defaultNamespaceAttrValue: string | null = null

    for (const attr of node.attributes) {
      let attributeNamespace = attr.namespaceURI
      let attributePrefix = attr.prefix
      if (attributeNamespace === infraNamespace.XMLNS) {
        if (attributePrefix === null) {
          defaultNamespaceAttrValue = attr.value
          continue
        } else {
          let prefixDefinition = attr.localName
          let namespaceDefinition: string | null = attr.value
          if (namespaceDefinition === infraNamespace.XML) {
            continue
          }

          if (namespaceDefinition === '') {
            namespaceDefinition = null
          }
          if (map.has(prefixDefinition, namespaceDefinition)) {
            continue
          }

          map.set(prefixDefinition, namespaceDefinition)
          localPrefixesMap[prefixDefinition] = namespaceDefinition || ''
        }
      }
    }

    return defaultNamespaceAttrValue
  }

  /**
   * Generates a new prefix for the given namespace.
   * 
   * @param newNamespace - a namespace to generate prefix for
   * @param prefixMap - namespace prefix map
   * @param prefixIndex - generated namespace prefix index
   */
  private _generatePrefix(newNamespace: string | null,
    prefixMap: NamespacePrefixMap, prefixIndex: PrefixIndex): string {

    let generatedPrefix = "ns" + prefixIndex.value
    prefixIndex.value++
    prefixMap.set(generatedPrefix, newNamespace)
    return generatedPrefix
  }

  /**
   * Determines if the namespace prefix map was modified from its original.
   * 
   * @param originalMap - original namespace prefix map
   * @param newMap - new namespace prefix map
   */
  private _isPrefixMapModified(originalMap: NamespacePrefixMap, newMap: NamespacePrefixMap) {
    const items1: { [key: string]: string[] } = (originalMap as any)._items
    const items2: { [key: string]: string[] } = (newMap as any)._items
    const nullItems1: string[] = (originalMap as any)._nullItems
    const nullItems2: string[] = (newMap as any)._nullItems

    for (const key in items2) {
      const arr1 = items1[key]
      if (arr1 === undefined) return true
      const arr2 = items2[key]
      if (arr1.length !== arr2.length) return true
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return true
      }
    }

    if (nullItems1.length !== nullItems2.length) return true
    for (let i = 0; i < nullItems1.length; i++) {
      if (nullItems1[i] !== nullItems2[i]) return true
    }

    return false
  }

}
