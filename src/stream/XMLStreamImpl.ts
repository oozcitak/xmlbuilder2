import { Readable } from "stream"
import {
  XMLStream, AttributesObject, PIObject, DTDOptions, XMLBuilder,
  StreamWriterOptions
} from "../interfaces"
import { applyDefaults } from "@oozcitak/util"
import { fragment, create } from ".."
import {
  xml_isName, xml_isLegalChar, xml_isQName, xml_isPubidChar
} from "@oozcitak/dom/lib/algorithm"
import { namespace as infraNamespace } from "@oozcitak/infra"
import { NamespacePrefixMap } from "../writers/base/NamespacePrefixMap"
import {
  Comment, Text, ProcessingInstruction, CDATASection, DocumentType, Element
} from "@oozcitak/dom/lib/dom/interfaces"
import { LocalNameSet } from "../writers/base/LocalNameSet"

/**
 * Stores the last generated prefix. An object is used instead of a number so
 * that the value can be passed by reference.
 */
type PrefixIndex = { value: number }

/**
 * Represents a readable XML document stream.
 */
export class XMLStreamImpl extends Readable implements XMLStream {

  private static _VoidElementNames = new Set(['area', 'base', 'basefont',
    'bgsound', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'keygen',
    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'])

  private _options: Required<StreamWriterOptions>

  private _hasDeclaration = false
  private _docTypeName = ""
  private _hasDocumentElement = false
  private _currentElement?: XMLBuilder
  private _currentElementHasChildren = false
  private _currentElementSerialized = false
  private _openTags: Array<[string, string | null, boolean]> = []

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
    p3?: AttributesObject): XMLStream {

    this._serializeOpenTag(true)

    this._currentElement = fragment().ele(p1 as any, p2 as any, p3 as any)
    this._currentElementSerialized = false
    this._currentElementHasChildren = false
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

    /** 11. If inherited ns is equal to ns, then: */
    if (inheritedNS === ns) {
      /** 
       * 11.1. If local default namespace is not null, then set ignore 
       * namespace definition attribute to true. 
       */
      if (localDefaultNamespace !== null) {
        ignoreNamespaceDefinitionAttribute = true
      }
      /** 
       * 11.2. If ns is the XML namespace, then append to qualified name the 
       * concatenation of the string "xml:" and the value of node's localName.
       * 11.3. Otherwise, append to qualified name the value of node's 
       * localName. The node's prefix if it exists, is dropped.
       */
      if (ns === infraNamespace.XML) {
        qualifiedName = 'xml:' + node.localName
      } else {
        qualifiedName = node.localName
      }

      /** 11.4. Append the value of qualified name to markup. */
      markup += qualifiedName
    } else {
      /** 
       * 12. Otherwise, inherited ns is not equal to ns (the node's own 
       * namespace is different from the context namespace of its parent). 
       * Run these sub-steps: 
       * 
       * 12.1. Let prefix be the value of node's prefix attribute.
       * 12.2. Let candidate prefix be the result of retrieving a preferred 
       * prefix string prefix from map given namespace ns. The above may return
       * null if no namespace key ns exists in map.
       */
      let prefix = node.prefix
      let candidatePrefix = map.get(prefix, ns)
      /** 
       * 12.3. If the value of prefix matches "xmlns", then run the following 
       * steps: 
       */
      if (prefix === "xmlns") {
        /** 
         * 12.3.1. If the require well-formed flag is set, then throw an error.
         * An Element with prefix "xmlns" will not legally round-trip in a 
         * conforming XML parser.
         */
        if (this._options.wellFormed) {
          throw new Error("An element cannot have the 'xmlns' prefix (well-formed required).")
        }

        /**
         * 12.3.2. Let candidate prefix be the value of prefix.
         */
        candidatePrefix = prefix
      }

      /** 
       * 12.4.Found a suitable namespace prefix: if candidate prefix is not
       * null (a namespace prefix is defined which maps to ns), then:
       */
      if (candidatePrefix !== null) {
        /** 
         * The following may serialize a different prefix than the Element's
         * existing prefix if it already had one. However, the retrieving a
         * preferred prefix string algorithm already tried to match the
         * existing prefix if possible.
         * 
         * 12.4.1. Append to qualified name the concatenation of candidate
         * prefix, ":" (U+003A COLON), and node's localName. There exists on
         * this node or the node's ancestry a namespace prefix definition that
         * defines the node's namespace.
         * 12.4.2. If the local default namespace is not null (there exists a 
         * locally-defined default namespace declaration attribute) and its
         * value is not the XML namespace, then let inherited ns get the value
         * of local default namespace unless the local default namespace is the 
         * empty string in which case let it get null (the context namespace
         * is changed to the declared default, rather than this node's own
         * namespace).
         * 
         * _Note:_ Any default namespace definitions or namespace prefixes that 
         * define the XML namespace are omitted when serializing this node's 
         * attributes.
         */
        qualifiedName = candidatePrefix + ':' + node.localName
        if (localDefaultNamespace !== null && localDefaultNamespace !== infraNamespace.XML) {
          inheritedNS = localDefaultNamespace || null
        }

        /**
         * 12.4.3. Append the value of qualified name to markup.
         */
        markup += qualifiedName

        /** 12.5. Otherwise, if prefix is not null, then: */
      } else if (prefix !== null) {
        /**
         * _Note:_ By this step, there is no namespace or prefix mapping
         * declaration in this node (or any parent node visited by this 
         * algorithm) that defines prefix otherwise the step labelled Found 
         * a suitable namespace prefix would have been followed. The sub-steps
         * that follow will create a new namespace prefix declaration for prefix
         * and ensure that prefix does not conflict with an existing namespace
         * prefix declaration of the same localName in node's attribute list. 
         * 
         * 12.5.1. If the local prefixes map contains a key matching prefix, 
         * then let prefix be the result of generating a prefix providing as 
         * input map, ns, and prefix index.
         */
        if (prefix in localPrefixesMap) {
          prefix = this._generatePrefix(ns, map, this._prefixIndex)
        }

        /**
         * 12.5.2. Add prefix to map given namespace ns.
         * 12.5.3. Append to qualified name the concatenation of prefix, ":" 
         * (U+003A COLON), and node's localName.
         * 12.5.4. Append the value of qualified name to markup.
         */
        map.set(prefix, ns)
        qualifiedName += prefix + ':' + node.localName
        markup += qualifiedName

        /**
         * 12.5.5. Append the following to markup, in the order listed:
         * 
         * _Note:_ The following serializes a namespace prefix declaration for 
         * prefix which was just added to the map.
         * 
         * 12.5.5.1. " " (U+0020 SPACE);
         * 12.5.5.2. The string "xmlns:";
         * 12.5.5.3. The value of prefix;
         * 12.5.5.4. "="" (U+003D EQUALS SIGN, U+0022 QUOTATION MARK);
         * 12.5.5.5. The result of serializing an attribute value given ns and
         * the require well-formed flag as input;
         * 12.5.5.6. """ (U+0022 QUOTATION MARK).
         */
        markup += " xmlns:" + prefix + "=\"" +
          this._serializeAttributeValue(ns, this._options.wellFormed) + "\""

        /**
         * 12.5.5.7. If local default namespace is not null (there exists a
         * locally-defined default namespace declaration attribute), then 
         * let inherited ns get the value of local default namespace unless the
         * local default namespace is the empty string in which case let it get
         * null.
         */
        if (localDefaultNamespace !== null) {
          inheritedNS = localDefaultNamespace || null
        }

        /** 
         * 12.6. Otherwise, if local default namespace is null, or local
         * default namespace is not null and its value is not equal to ns, then:
         */
      } else if (localDefaultNamespace === null ||
        (localDefaultNamespace !== null && localDefaultNamespace !== ns)) {
        /** 
         * _Note:_ At this point, the namespace for this node still needs to be
         * serialized, but there's no prefix (or candidate prefix) availble; the
         * following uses the default namespace declaration to define the 
         * namespace--optionally replacing an existing default declaration 
         * if present.
         * 
         * 12.6.1. Set the ignore namespace definition attribute flag to true.
         * 12.6.2. Append to qualified name the value of node's localName.
         * 12.6.3. Let the value of inherited ns be ns.
         * 
         * _Note:_ The new default namespace will be used in the serialization 
         * to define this node's namespace and act as the context namespace for
         * its children.
         */
        ignoreNamespaceDefinitionAttribute = true
        qualifiedName += node.localName
        inheritedNS = ns

        /**
         * 12.6.4. Append the value of qualified name to markup.
         */
        markup += qualifiedName

        /**
         * 12.6.5. Append the following to markup, in the order listed:
         * 
         * _Note:_ The following serializes the new (or replacement) default
         * namespace definition.
         * 
         * 12.6.5.1. " " (U+0020 SPACE);
         * 12.6.5.2. The string "xmlns";
         * 12.6.5.3. "="" (U+003D EQUALS SIGN, U+0022 QUOTATION MARK);
         * 12.6.5.4. The result of serializing an attribute value given ns
         * and the require well-formed flag as input;
         * 12.6.5.5. """ (U+0022 QUOTATION MARK).
         */
        markup += " xmlns" + "=\"" +
          this._serializeAttributeValue(ns, this._options.wellFormed) + "\""

        /**
         * 12.7. Otherwise, the node has a local default namespace that matches 
         * ns. Append to qualified name the value of node's localName, let the
         * value of inherited ns be ns, and append the value of qualified name
         * to markup.
         */
      } else {
        qualifiedName += node.localName
        inheritedNS = ns
        markup += qualifiedName
      }
    }

    /**
     * 13. Append to markup the result of the XML serialization of node's 
     * attributes given map, prefix index, local prefixes map, ignore namespace
     * definition attribute flag, and require well-formed flag.
     */
    markup += this._serializeAttributesNS(node, map, this._prefixIndex, localPrefixesMap,
      ignoreNamespaceDefinitionAttribute, this._options.wellFormed)

    /**
     * 14. If ns is the HTML namespace, and the node's list of children is 
     * empty, and the node's localName matches any one of the following void
     * elements: "area", "base", "basefont", "bgsound", "br", "col", "embed", 
     * "frame", "hr", "img", "input", "keygen", "link", "menuitem", "meta", 
     * "param", "source", "track", "wbr"; then append the following to markup,
     * in the order listed:
     * 14.1. " " (U+0020 SPACE);
     * 14.2. "/" (U+002F SOLIDUS).
     * and set the skip end tag flag to true.
     * 15. If ns is not the HTML namespace, and the node's list of children is 
     * empty, then append "/" (U+002F SOLIDUS) to markup and set the skip end 
     * tag flag to true.
     * 16. Append ">" (U+003E GREATER-THAN SIGN) to markup.
     */
    const isHTML = (ns === infraNamespace.HTML)
    if (isHTML && !hasChildren &&
      XMLStreamImpl._VoidElementNames.has(node.localName)) {
      markup += " /"
    } else if (!isHTML && !hasChildren) {
      if (this._options.spaceBeforeSlash) markup += " "
      markup += "/"
    }
    markup += ">"

    this.push(this._beginLine() + markup + this._endLine())
    this._currentElementHasChildren = hasChildren

    this._currentElementSerialized = true
    this._openTags.push([qualifiedName, ns, hasChildren])
  }

  private _serializeCloseTag(): void {
    const lastEle = this._openTags.pop()
    /* istanbul ignore next */
    if (lastEle === undefined) {
      throw new Error("Last element is undefined.")
    }
    const [qualifiedName, ns, hasChildren] = lastEle
    if (!hasChildren) return
    this._namespace = ns

    /**
     * 20. Append the following to markup, in the order listed:
     * 20.1. "</" (U+003C LESS-THAN SIGN, U+002F SOLIDUS);
     * 20.2. The value of qualified name;
     * 20.3. ">" (U+003E GREATER-THAN SIGN).
     */
    let markup = "</" + qualifiedName + ">"
    this.push(this._beginLine() + markup + this._endLine())
  }

  /** @inheritdoc */
  att(p1: AttributesObject | string | null, p2?: string, p3?: string): XMLStream {
    if (this._currentElement === undefined) {
      throw new Error("Cannot insert an attribute node as child of a document node.")
    }
    this._currentElement.att(p1 as any, p2 as any, p3 as any)
    return this
  }

  /** @inheritdoc */
  com(content: string): XMLStream {
    this._serializeOpenTag(true)
    const node = fragment().com(content).first().node as Comment

    if (this._options.wellFormed && (!xml_isLegalChar(node.data) ||
      node.data.indexOf("--") !== -1 || node.data.endsWith("-"))) {
      throw new Error("Comment data contains invalid characters (well-formed required).")
    }

    this.push(this._beginLine() + "<!--" + node.data + "-->" + this._endLine())
    return this
  }

  /** @inheritdoc */
  txt(content: string): XMLStream {
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

    this.push(this._beginLine() + result + this._endLine())
    return this
  }

  /** @inheritdoc */
  ins(target: string | PIObject, content: string = ''): XMLStream {
    this._serializeOpenTag(true)
    const node = fragment().ins(target as any, content).first().node as ProcessingInstruction

    if (this._options.wellFormed && (node.target.indexOf(":") !== -1 || (/^xml$/i).test(node.target))) {
      throw new Error("Processing instruction target contains invalid characters (well-formed required).")
    }

    if (this._options.wellFormed && (!xml_isLegalChar(node.data) ||
      node.data.indexOf("?>") !== -1)) {
      throw new Error("Processing instruction data contains invalid characters (well-formed required).")
    }

    this.push(this._beginLine() + "<?" + node.target + " " + node.data + "?>" + this._endLine())
    return this
  }

  /** @inheritdoc */
  dat(content: string): XMLStream {
    this._serializeOpenTag(true)
    const node = fragment().dat(content).first().node as CDATASection

    if (this._options.wellFormed && (node.data.indexOf("]]>") !== -1)) {
      throw new Error("CDATA contains invalid characters (well-formed required).")
    }

    this.push(this._beginLine() + "<![CDATA[" + node.data + "]]>" + this._endLine())
    return this
  }

  /** @inheritdoc */
  dec(options: { version?: "1.0", encoding?: string, standalone?: boolean }): XMLStream {
    if (this._hasDeclaration) {
      throw new Error("XML declaration is already inserted.")
    }

    let markup = ""
    markup += this._beginLine()
    markup = "<?xml"
    markup += " version=\"" + options.version + "\""
    if (options.encoding !== undefined) {
      markup += " encoding=\"" + options.encoding + "\""
    }
    if (options.standalone !== undefined) {
      markup += " standalone=\"" + (options.standalone ? "yes" : "no") + "\""
    }
    markup += "?>"
    markup += this._endLine()

    this.push(markup)
    this._hasDeclaration = true

    return this
  }

  /** @inheritdoc */
  dtd(name: string, options?: DTDOptions): XMLStream {
    if (this._docTypeName !== "") {
      throw new Error("DocType declaration is already inserted.")
    }

    if (!xml_isName(name)) {
      throw new Error(`Invalid XML name: ${name}`)
    }

    if (!xml_isQName(name)) {
      throw new Error(`Invalid XML qualified name: ${name}.`)
    }

    this._docTypeName = name
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

    this.push(this._beginLine() + markup + this._endLine())
    return this
  }

  /** @inheritdoc */
  up(): XMLStream {
    this._serializeOpenTag(false)
    this._serializeCloseTag()
    return this
  }

  /** @inheritdoc */
  end(): XMLStream {
    this._serializeOpenTag(false)
    while (this._openTags.length > 0) {
      this._serializeCloseTag()
    }

    if (!this._hasDocumentElement) {
      throw new Error("Document has no document element node.")
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
      return this._indent(this._options.offset + this._level)
    } else {
      return ""
    }
  }

  /**
   * Produces characters to be appended to a line of string in pretty-print
   * mode.
   */
  private _endLine(): string {
    if (this._options.prettyPrint) {
      return this._options.newline
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

    /**
     * 1. Let result be the empty string.
     * 2. Let localname set be a new empty namespace localname set. This 
     * localname set will contain tuples of unique attribute namespaceURI and 
     * localName pairs, and is populated as each attr is processed. This set is 
     * used to [optionally] enforce the well-formed constraint that an element
     * cannot have two attributes with the same namespaceURI and localName. 
     * This can occur when two otherwise identical attributes on the same 
     * element differ only by their prefix values.
     */
    let result = ""
    const localNameSet = requireWellFormed ? new LocalNameSet() : undefined

    /** 
     * 3. Loop: For each attribute attr in element's attributes, in the order 
     * they are specified in the element's attribute list: 
     */
    for (const attr of node.attributes) {
      // Optimize common case
      if (!requireWellFormed && attr.namespaceURI === null) {
        result += " " + attr.localName + "=\"" +
          this._serializeAttributeValue(attr.value, requireWellFormed) + "\""
        continue
      }

      /**
       * 3.1. If the require well-formed flag is set (its value is true), and the 
       * localname set contains a tuple whose values match those of a new tuple 
       * consisting of attr's namespaceURI attribute and localName attribute, 
       * then throw an exception; the serialization of this attr would fail to
       * produce a well-formed element serialization.
       */
      if (requireWellFormed && localNameSet && localNameSet.has(attr.namespaceURI, attr.localName)) {
        throw new Error("Element contains duplicate attributes (well-formed required).")
      }

      /**
       * 3.2. Create a new tuple consisting of attr's namespaceURI attribute and 
       * localName attribute, and add it to the localname set.
       * 3.3. Let attribute namespace be the value of attr's namespaceURI value.
       * 3.4. Let candidate prefix be null.
       */
      if (requireWellFormed && localNameSet) localNameSet.set(attr.namespaceURI, attr.localName)
      let attributeNamespace = attr.namespaceURI
      let candidatePrefix: string | null = null

      /** 3.5. If attribute namespace is not null, then run these sub-steps: */
      if (attributeNamespace !== null) {
        /**
         * 3.5.1. Let candidate prefix be the result of retrieving a preferred 
         * prefix string from map given namespace attribute namespace with 
         * preferred prefix being attr's prefix value.
         */
        candidatePrefix = map.get(attr.prefix, attributeNamespace)

        /**
         * 3.5.2. If the value of attribute namespace is the XMLNS namespace, 
         * then run these steps:
         */
        if (attributeNamespace === infraNamespace.XMLNS) {
          /** 
           * 3.5.2.1. If any of the following are true, then stop running these 
           * steps and goto Loop to visit the next attribute: 
           * - the attr's value is the XML namespace;
           * _Note:_ The XML namespace cannot be redeclared and survive 
           * round-tripping (unless it defines the prefix "xml"). To avoid this 
           * problem, this algorithm always prefixes elements in the XML 
           * namespace with "xml" and drops any related definitions as seen 
           * in the above condition.
           * - the attr's prefix is null and the ignore namespace definition 
           * attribute flag is true (the Element's default namespace attribute
           * should be skipped);
           * - the attr's prefix is not null and either
           *   * the attr's localName is not a key contained in the local 
           *     prefixes map, or
           *   * the attr's localName is present in the local prefixes map but
           *     the value of the key does not match attr's value
           * and furthermore that the attr's localName (as the prefix to find) 
           * is found in the namespace prefix map given the namespace consisting 
           * of the attr's value (the current namespace prefix definition was 
           * exactly defined previously--on an ancestor element not the current
           * element whose attributes are being processed).
           */
          if (attr.value === infraNamespace.XML ||
            (attr.prefix === null && ignoreNamespaceDefinitionAttribute) ||
            (attr.prefix !== null && (!(attr.localName in localPrefixesMap) ||
              localPrefixesMap[attr.localName] !== attr.value) &&
              map.has(attr.localName, attr.value)))
            continue

          /**
           * 3.5.2.2. If the require well-formed flag is set (its value is true), 
           * and the value of attr's value attribute matches the XMLNS 
           * namespace, then throw an exception; the serialization of this 
           * attribute would produce invalid XML because the XMLNS namespace 
           * is reserved and cannot be applied as an element's namespace via 
           * XML parsing.
           * 
           * _Note:_ DOM APIs do allow creation of elements in the XMLNS
           * namespace but with strict qualifications.
           */
          if (requireWellFormed && attr.value === infraNamespace.XMLNS) {
            throw new Error("XMLNS namespace is reserved (well-formed required).")
          }

          /**
           * 3.5.2.3. If the require well-formed flag is set (its value is true), 
           * and the value of attr's value attribute is the empty string, then 
           * throw an exception; namespace prefix declarations cannot be used 
           * to undeclare a namespace (use a default namespace declaration 
           * instead).
           */
          if (requireWellFormed && attr.value === '') {
            throw new Error("Namespace prefix declarations cannot be used to undeclare a namespace (well-formed required).")
          }

          /**
           * 3.5.2.4. the attr's prefix matches the string "xmlns", then let 
           * candidate prefix be the string "xmlns".
           */
          if (attr.prefix === 'xmlns') candidatePrefix = 'xmlns'

          /**
           * 3.5.3. Otherwise, the attribute namespace is not the XMLNS namespace. 
           * Run these steps:
           * 
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
            /**
             * 3.5.3.1. Let candidate prefix be the result of generating a prefix 
             * providing map, attribute namespace, and prefix index as input.
             */
            candidatePrefix = this._generatePrefix(attributeNamespace, map, prefixIndex)
          }

          /** 
           * 3.5.3.2. Append the following to result, in the order listed:
           * 3.5.3.2.1. " " (U+0020 SPACE);
           * 3.5.3.2.2. The string "xmlns:";
           * 3.5.3.2.3. The value of candidate prefix;
           * 3.5.3.2.4. "="" (U+003D EQUALS SIGN, U+0022 QUOTATION MARK);
           * 3.5.3.2.5. The result of serializing an attribute value given 
           * attribute namespace and the require well-formed flag as input;
           * 3.5.3.2.6. """ (U+0022 QUOTATION MARK).
          */
          result += " xmlns:" + candidatePrefix + "=\"" +
            this._serializeAttributeValue(attributeNamespace, requireWellFormed) + "\""
        }
      }

      /**
       * 3.6. Append a " " (U+0020 SPACE) to result.
       * 3.7. If candidate prefix is not null, then append to result the 
       * concatenation of candidate prefix with ":" (U+003A COLON).
       */
      result += " "
      if (candidatePrefix !== null) {
        result += candidatePrefix + ':'
      }

      /**
       * 3.8. If the require well-formed flag is set (its value is true), and 
       * this attr's localName attribute contains the character 
       * ":" (U+003A COLON) or does not match the XML Name production or 
       * equals "xmlns" and attribute namespace is null, then throw an 
       * exception; the serialization of this attr would not be a 
       * well-formed attribute.
       */
      if (requireWellFormed && (attr.localName.indexOf(":") !== -1 ||
        !xml_isName(attr.localName) ||
        (attr.localName === "xmlns" && attributeNamespace === null))) {
        throw new Error("Attribute local name contains invalid characters (well-formed required).")
      }

      /**
       * 3.9. Append the following strings to result, in the order listed:
       * 3.9.1. The value of attr's localName;
       * 3.9.2. "="" (U+003D EQUALS SIGN, U+0022 QUOTATION MARK);
       * 3.9.3. The result of serializing an attribute value given attr's value
       * attribute and the require well-formed flag as input;
       * 3.9.4. """ (U+0022 QUOTATION MARK).
       */
      result += attr.localName + "=\"" +
        this._serializeAttributeValue(attr.value, requireWellFormed) + "\""
    }

    /**
     * 4. Return the value of result.
     */
    return result
  }

  /**
   * Produces an XML serialization of an attribute value.
   * 
   * @param value - attribute value
   * @param requireWellFormed - whether to check conformance
   */
  private _serializeAttributeValue(value: string | null, requireWellFormed: boolean): string {
    /**
     * From: https://w3c.github.io/DOM-Parsing/#dfn-serializing-an-attribute-value
     * 
     * 1. If the require well-formed flag is set (its value is true), and 
     * attribute value contains characters that are not matched by the XML Char
     * production, then throw an exception; the serialization of this attribute
     * value would fail to produce a well-formed element serialization.
     */
    if (requireWellFormed && value !== null && !xml_isLegalChar(value)) {
      throw new Error("Invalid characters in attribute value.")
    }

    /**
     * 2. If attribute value is null, then return the empty string.
     */
    if (value === null) return ""

    /**
     * 3. Otherwise, attribute value is a string. Return the value of attribute
     * value, first replacing any occurrences of the following:
     * - "&" with "&amp;"
     * - """ with "&quot;"
     * - "<" with "&lt;"
     * - ">" with "&gt;"
     * NOTE
     * This matches behavior present in browsers, and goes above and beyond the
     * grammar requirement in the XML specification's AttValue production by
     * also replacing ">" characters.
     */
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

    /**
     * 1. Let default namespace attr value be null.
     */
    let defaultNamespaceAttrValue: string | null = null

    /**
     * 2. Main: For each attribute attr in element's attributes, in the order
     * they are specified in the element's attribute list:
     */
    for (const attr of node.attributes) {
      /**
       * _Note:_ The following conditional steps find namespace prefixes. Only 
       * attributes in the XMLNS namespace are considered (e.g., attributes made 
       * to look like namespace declarations via 
       * setAttribute("xmlns:pretend-prefix", "pretend-namespace") are not 
       * included).
       */

      /** 2.1. Let attribute namespace be the value of attr's namespaceURI value. */
      let attributeNamespace = attr.namespaceURI
      /** 2.2. Let attribute prefix be the value of attr's prefix. */
      let attributePrefix = attr.prefix

      /** 2.3. If the attribute namespace is the XMLNS namespace, then: */
      if (attributeNamespace === infraNamespace.XMLNS) {
        /** 
         * 2.3.1. If attribute prefix is null, then attr is a default namespace 
         * declaration. Set the default namespace attr value to attr's value and 
         * stop running these steps, returning to Main to visit the next 
         * attribute. 
         */
        if (attributePrefix === null) {
          defaultNamespaceAttrValue = attr.value
          continue

          /**
           * 2.3.2. Otherwise, the attribute prefix is not null and attr is a 
           * namespace prefix definition. Run the following steps:
           */
        } else {
          /** 2.3.2.1. Let prefix definition be the value of attr's localName. */
          let prefixDefinition = attr.localName
          /** 2.3.2.2. Let namespace definition be the value of attr's value. */
          let namespaceDefinition: string | null = attr.value

          /** 
           * 2.3.2.3. If namespace definition is the XML namespace, then stop 
           * running these steps, and return to Main to visit the next 
           * attribute. 
           * 
           * _Note:_ XML namespace definitions in prefixes are completely 
           * ignored (in order to avoid unnecessary work when there might be 
           * prefix conflicts). XML namespaced elements are always handled 
           * uniformly by prefixing (and overriding if necessary) the element's 
           * localname with the reserved "xml" prefix.
           */
          if (namespaceDefinition === infraNamespace.XML) {
            continue
          }

          /** 
           * 2.3.2.4. If namespace definition is the empty string (the 
           * declarative form of having no namespace), then let namespace 
           * definition be null instead. 
           */
          if (namespaceDefinition === '') {
            namespaceDefinition = null
          }

          /**
           * 2.3.2.5. If prefix definition is found in map given the namespace 
           * namespace definition, then stop running these steps, and return to 
           * Main to visit the next attribute.
           * 
           * _Note:_ This step avoids adding duplicate prefix definitions for 
           * the same namespace in the map. This has the side-effect of avoiding 
           * later serialization of duplicate namespace prefix declarations in 
           * any descendant nodes.
           */
          if (map.has(prefixDefinition, namespaceDefinition)) {
            continue
          }

          /** 
           * 2.3.2.6. Add the prefix prefix definition to map given namespace 
           * namespace definition. 
           */
          map.set(prefixDefinition, namespaceDefinition)

          /**
           * 2.3.2.7. Add the value of prefix definition as a new key to the 
           * local prefixes map, with the namespace definition as the key's 
           * value replacing the value of null with the empty string if 
           * applicable.
           */
          localPrefixesMap[prefixDefinition] = namespaceDefinition || ''
        }
      }
    }

    /** 
     * 3. Return the value of default namespace attr value. 
     * 
     * _Note:_ The empty string is a legitimate return value and is not 
     * converted to null.
     */
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

    /**
     * 1. Let generated prefix be the concatenation of the string "ns" and the
     * current numerical value of prefix index.
     * 2. Let the value of prefix index be incremented by one.
     * 3. Add to map the generated prefix given the new namespace namespace.
     * 4. Return the value of generated prefix.
     */
    let generatedPrefix = "ns" + prefixIndex.value
    prefixIndex.value++
    prefixMap.set(generatedPrefix, newNamespace)
    return generatedPrefix
  }

  _read(size: number): void { }

}
