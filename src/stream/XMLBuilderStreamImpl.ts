import { Readable } from "stream"
import {
  XMLBuilderStream, AttributesObject, PIObject, DTDOptions, XMLBuilder,
  StreamWriterOptions
} from "../interfaces"
import { applyDefaults } from "@oozcitak/util"
import { fragment, create } from ".."
import {
  xml_isName, xml_isLegalChar, xml_isQName, xml_isPubidChar
} from "@oozcitak/dom/lib/algorithm"
import { namespace as infraNamespace } from "@oozcitak/infra"
import { NamespacePrefixMap } from "@oozcitak/dom/lib/serializer/NamespacePrefixMap"
import {
  Comment, Text, ProcessingInstruction, CDATASection, DocumentType, Element
} from "@oozcitak/dom/lib/dom/interfaces"
import { LocalNameSet } from "@oozcitak/dom/lib/serializer/LocalNameSet"

/**
 * Stores the last generated prefix. An object is used instead of a number so
 * that the value can be passed by reference.
 */
type PrefixIndex = { value: number }

/**
 * Represents a readable XML document stream.
 */
export class XMLBuilderStreamImpl extends Readable implements XMLBuilderStream {

  private static _VoidElementNames = new Set(['area', 'base', 'basefont',
    'bgsound', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'keygen',
    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'])

  private _options: Required<StreamWriterOptions>

  private _hasDeclaration = false
  private _docTypeName = ""
  private _hasDocumentElement = false
  private _currentElement?: XMLBuilder
  private _currentElementSerialized = false
  private _openTags: Array<[string, string | null, NamespacePrefixMap, boolean]> = []

  private _level = 0
  private _indentation: { [key: number]: string } = {}

  private _namespace: string | null
  private _prefixMap: NamespacePrefixMap
  private _prefixIndex: PrefixIndex

  /**
   * Initializes a new instance of `XMLStream`.
   * 
   * @param options - stream writer options
   * 
   * @returns XML stream
   */
  public constructor(options?: StreamWriterOptions) {
    super()

    // provide default options
    this._options = applyDefaults(options, {
      wellFormed: false,
      prettyPrint: false,
      indent: "  ",
      newline: "\n",
      offset: 0,
      width: 0,
      allowEmptyTags: false,
      spaceBeforeSlash: false
    }) as Required<StreamWriterOptions>

    this._namespace = null
    this._prefixMap = new NamespacePrefixMap()
    this._prefixMap.set("xml", infraNamespace.XML)
    this._prefixIndex = { value: 1 }
  }

  /** @inheritdoc */
  ele(p1: string | null, p2?: AttributesObject | string,
    p3?: AttributesObject): XMLBuilderStream {

    this._serializeOpenTag(true)

    this._currentElement = fragment().ele(p1 as any, p2 as any, p3 as any)
    this._currentElementSerialized = false
    this._hasDocumentElement = true

    return this
  }

  private _serializeOpenTag(hasChildren: boolean): void {
    if (this._currentElementSerialized) return
    if (this._currentElement === undefined) return
    const node = this._currentElement.node as Element

    if (this._options.wellFormed && (node.localName.indexOf(":") !== -1 ||
      !xml_isName(node.localName))) {
      throw new Error("Node local name contains invalid characters (well-formed required).")
    }

    let markup = "<"
    let qualifiedName = ''
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
        qualifiedName = 'xml:' + node.localName
      } else {
        qualifiedName = node.localName
      }

      markup += qualifiedName
    } else {
      let prefix = node.prefix
      let candidatePrefix = map.get(prefix, ns)
      if (prefix === "xmlns") {
        if (this._options.wellFormed) {
          throw new Error("An element cannot have the 'xmlns' prefix (well-formed required).")
        }

        candidatePrefix = prefix
      }

      if (candidatePrefix !== null) {
        qualifiedName = candidatePrefix + ':' + node.localName
        if (localDefaultNamespace !== null && localDefaultNamespace !== infraNamespace.XML) {
          inheritedNS = localDefaultNamespace || null
        }

        markup += qualifiedName
      } else if (prefix !== null) {
        if (prefix in localPrefixesMap) {
          prefix = this._generatePrefix(ns, map, this._prefixIndex)
        }

        map.set(prefix, ns)
        qualifiedName += prefix + ':' + node.localName
        markup += qualifiedName

        markup += " xmlns:" + prefix + "=\"" +
          this._serializeAttributeValue(ns, this._options.wellFormed) + "\""

        if (localDefaultNamespace !== null) {
          inheritedNS = localDefaultNamespace || null
        }

      } else if (localDefaultNamespace === null ||
        (localDefaultNamespace !== null && localDefaultNamespace !== ns)) {
        ignoreNamespaceDefinitionAttribute = true
        qualifiedName += node.localName
        inheritedNS = ns

        markup += qualifiedName + " xmlns" + "=\"" +
          this._serializeAttributeValue(ns, this._options.wellFormed) + "\""

      } else {
        qualifiedName += node.localName
        inheritedNS = ns
        markup += qualifiedName
      }
    }

    markup += this._serializeAttributesNS(node, map, this._prefixIndex, localPrefixesMap,
      ignoreNamespaceDefinitionAttribute, this._options.wellFormed)

    const isHTML = (ns === infraNamespace.HTML)
    if (isHTML && !hasChildren &&
      XMLBuilderStreamImpl._VoidElementNames.has(node.localName)) {
      markup += " /"
    } else if (!isHTML && !hasChildren) {
      if (this._options.spaceBeforeSlash) markup += " "
      markup += "/"
    }
    markup += ">"

    this.push(this._beginLine() + markup)

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
    this._prefixMap = map

    /**
     * Calls following this will either serialize child nodes or close this tag.
     */
    this._level++
  }

  private _serializeCloseTag(): void {
    this._level--
    const lastEle = this._openTags.pop()
    /* istanbul ignore next */
    if (lastEle === undefined) {
      throw new Error("Last element is undefined.")
    }

    const [qualifiedName, ns, map, hasChildren] = lastEle
    /**
     * Restore original values of inherited namespace and prefix map.
     */
    this._namespace = ns
    this._prefixMap = map
    if (!hasChildren) return

    let markup = "</" + qualifiedName + ">"
    this.push(this._beginLine() + markup)
  }

  /** @inheritdoc */
  att(p1: AttributesObject | string | null, p2?: string, p3?: string): XMLBuilderStream {
    if (this._currentElement === undefined) {
      throw new Error("Cannot insert an attribute node as child of a document node.")
    }
    this._currentElement.att(p1 as any, p2 as any, p3 as any)
    return this
  }

  /** @inheritdoc */
  com(content: string): XMLBuilderStream {
    this._serializeOpenTag(true)
    const node = fragment().com(content).first().node as Comment

    if (this._options.wellFormed && (!xml_isLegalChar(node.data) ||
      node.data.indexOf("--") !== -1 || node.data.endsWith("-"))) {
      throw new Error("Comment data contains invalid characters (well-formed required).")
    }

    this.push(this._beginLine() + "<!--" + node.data + "-->")
    return this
  }

  /** @inheritdoc */
  txt(content: string): XMLBuilderStream {
    if (this._currentElement === undefined) {
      throw new Error("Cannot insert a text node as child of a document node.")
    }
    this._serializeOpenTag(true)

    const node = fragment().txt(content).first().node as Text

    if (this._options.wellFormed && !xml_isLegalChar(node.data)) {
      throw new Error("Text data contains invalid characters (well-formed required).")
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

    this.push(this._beginLine() + result)
    return this
  }

  /** @inheritdoc */
  ins(target: string | PIObject, content: string = ''): XMLBuilderStream {
    this._serializeOpenTag(true)
    const node = fragment().ins(target as any, content).first().node as ProcessingInstruction

    if (this._options.wellFormed && (node.target.indexOf(":") !== -1 || (/^xml$/i).test(node.target))) {
      throw new Error("Processing instruction target contains invalid characters (well-formed required).")
    }

    if (this._options.wellFormed && !xml_isLegalChar(node.data)) {
      throw new Error("Processing instruction data contains invalid characters (well-formed required).")
    }

    this.push(this._beginLine() + "<?" + node.target + " " + node.data + "?>")
    return this
  }

  /** @inheritdoc */
  dat(content: string): XMLBuilderStream {
    this._serializeOpenTag(true)
    const node = fragment().dat(content).first().node as CDATASection

    this.push(this._beginLine() + "<![CDATA[" + node.data + "]]>")
    return this
  }

  /** @inheritdoc */
  dec(options: { version?: "1.0", encoding?: string, standalone?: boolean } = { version: "1.0" }): XMLBuilderStream {
    if (this._hasDeclaration) {
      throw new Error("XML declaration is already inserted.")
    }

    let markup = ""
    markup = this._beginLine() + "<?xml"
    markup += " version=\"" + (options.version || "1.0") + "\""
    if (options.encoding !== undefined) {
      markup += " encoding=\"" + options.encoding + "\""
    }
    if (options.standalone !== undefined) {
      markup += " standalone=\"" + (options.standalone ? "yes" : "no") + "\""
    }
    markup += "?>"

    this.push(markup)
    this._hasDeclaration = true

    return this
  }

  /** @inheritdoc */
  dtd(name: string, options?: DTDOptions): XMLBuilderStream {
    if (this._docTypeName !== "") {
      throw new Error("DocType declaration is already inserted.")
    }

    if (!xml_isName(name)) {
      throw new Error(`Invalid XML name: ${name}`)
    }

    if (!xml_isQName(name)) {
      throw new Error(`Invalid XML qualified name: ${name}.`)
    }

    const node = create().dtd(options).first().node as DocumentType

    if (this._options.wellFormed && !xml_isPubidChar(node.publicId)) {
      throw new Error("DocType public identifier does not match PubidChar construct (well-formed required).")
    }

    if (this._options.wellFormed &&
      (!xml_isLegalChar(node.systemId) ||
        (node.systemId.indexOf('"') !== -1 && node.systemId.indexOf("'") !== -1))) {
      throw new Error("DocType system identifier contains invalid characters (well-formed required).")
    }

    const markup = node.publicId && node.systemId ?
      "<!DOCTYPE " + name + " PUBLIC \"" + node.publicId + "\" \"" + node.systemId + "\">"
      : node.publicId ?
        "<!DOCTYPE " + name + " PUBLIC \"" + node.publicId + "\">"
        : node.systemId ?
          "<!DOCTYPE " + name + " SYSTEM \"" + node.systemId + "\">"
          :
          "<!DOCTYPE " + name + ">"

    this._docTypeName = name
    this.push(this._beginLine() + markup)
    return this
  }

  /** @inheritdoc */
  up(): XMLBuilderStream {
    this._serializeOpenTag(false)
    this._serializeCloseTag()
    return this
  }

  /** @inheritdoc */
  end(): XMLBuilderStream {
    this._serializeOpenTag(false)
    while (this._openTags.length > 0) {
      this._serializeCloseTag()
    }

    this.push(null)
    return this
  }

  /**
   * Produces characters to be prepended to a line of string in pretty-print
   * mode.
   */
  private _beginLine(): string {
    if (this._options.prettyPrint) {
      return (this.readableLength !== 0 ? this._options.newline : "") +
        this._indent(this._options.offset + this._level)
    } else {
      return ""
    }
  }

  /**
   * Produces an indentation string.
   * 
   * @param level - depth of the tree
   */
  private _indent(level: number): string {
    if (level <= 0) {
      return ""
    } else if (this._indentation[level] !== undefined) {
      return this._indentation[level]
    } else {
      const str = this._options.indent.repeat(level)
      this._indentation[level] = str
      return str
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
  private _serializeAttributesNS(node: Element, map: NamespacePrefixMap,
    prefixIndex: PrefixIndex, localPrefixesMap: { [key: string]: string },
    ignoreNamespaceDefinitionAttribute: boolean,
    requireWellFormed: boolean): string {

    let result = ""
    const localNameSet = requireWellFormed ? new LocalNameSet() : undefined

    for (const attr of node.attributes) {
      // Optimize common case
      if (!requireWellFormed && attr.namespaceURI === null) {
        result += " " + attr.localName + "=\"" +
          this._serializeAttributeValue(attr.value, requireWellFormed) + "\""
        continue
      }

      if (requireWellFormed && localNameSet && localNameSet.has(attr.namespaceURI, attr.localName)) {
        throw new Error("Element contains duplicate attributes (well-formed required).")
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
            throw new Error("XMLNS namespace is reserved (well-formed required).")
          }

          if (requireWellFormed && attr.value === '') {
            throw new Error("Namespace prefix declarations cannot be used to undeclare a namespace (well-formed required).")
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

          result += " xmlns:" + candidatePrefix + "=\"" +
            this._serializeAttributeValue(attributeNamespace, requireWellFormed) + "\""
        }
      }

      result += " "
      if (candidatePrefix !== null) {
        result += candidatePrefix + ':'
      }

      if (requireWellFormed && (attr.localName.indexOf(":") !== -1 ||
        !xml_isName(attr.localName) ||
        (attr.localName === "xmlns" && attributeNamespace === null))) {
        throw new Error("Attribute local name contains invalid characters (well-formed required).")
      }

      result += attr.localName + "=\"" +
        this._serializeAttributeValue(attr.value, requireWellFormed) + "\""
    }

    return result
  }

  /**
   * Produces an XML serialization of an attribute value.
   * 
   * @param value - attribute value
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeAttributeValue(value: string | null, requireWellFormed: boolean): string {
    if (requireWellFormed && value !== null && !xml_isLegalChar(value)) {
      throw new Error("Invalid characters in attribute value.")
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

  _read(size: number): void { }

}
