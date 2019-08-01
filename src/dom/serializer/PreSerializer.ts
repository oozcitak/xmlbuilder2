import {
  Node, Element, NodeType, Document, Comment, Text, DocumentFragment,
  DocumentType, ProcessingInstruction, CDATASection
} from "../../dom/interfaces"
import { Namespace, XMLSpec } from "../../dom/spec"
import { TupleSet } from "./TupleSet"
import { NamespacePrefixMap } from './NamespacePrefixMap'
import { PreSerializedNode, PreSerializedAttr } from "./interfaces"
import { DOMException } from ".."

/**
 * Stores the last generated prefix. An object is used instead of a number so
 * that the value can be passed by reference.
 */
type PrefixIndex = { value: number }

/**
 * Pre-serializes XML nodes.
 */
export class PreSerializer {

  private _xmlVersion: "1.0" | "1.1"

  /**
   * Initializes a new instance of `PreSerializer`.
   * 
   * @param xmlVersion - XML specification version
   */
  constructor(xmlVersion: "1.0" | "1.1") {
    this._xmlVersion = xmlVersion
  }

  /**
   * Produces an XML serialization of the given node. The pre-serializer inserts
   * namespace declarations where necessary and produces qualified names for
   * nodes and attributes.
   * 
   * A serializer should process each `PreSerializedNode` produced by this
   * function and use the information provided to serialize the node.
   * 
   * @param node - node to serialize
   * @param requireWellFormed - whether to check conformance
   */
  serialize(node: Node, requireWellFormed: boolean): PreSerializedNode<Node> {
    /** From: https://w3c.github.io/DOM-Parsing/#xml-serialization
     * 
     * 1. Let namespace be a context namespace with value null. 
     * The context namespace tracks the XML serialization algorithm's current 
     * default namespace. The context namespace is changed when either an Element
     * Node has a default namespace declaration, or the algorithm generates a 
     * default namespace declaration for the Element Node to match its own
     * namespace. The algorithm assumes no namespace (null) to start.
     * 2. Let prefix map be a new namespace prefix map.
     * 3. Add the XML namespace with prefix value "xml" to prefix map.
     * 4. Let prefix index be a generated namespace prefix index with value 1. 
     * The generated namespace prefix index is used to generate a new unique 
     * prefix value when no suitable existing namespace prefix is available to 
     * serialize a node's namespaceURI (or the namespaceURI of one of node's 
     * attributes). See the generate a prefix algorithm.
     */
    const namespace: string | null = null
    const prefixMap = new NamespacePrefixMap([["xml", Namespace.XML]])
    const prefixIndex: PrefixIndex = { value: 1 }

    /**
     * 5. Return the result of running the XML serialization algorithm on node 
     * passing the context namespace namespace, namespace prefix map prefix map,
     * generated namespace prefix index reference to prefix index, and the 
     * flag require well-formed. If an exception occurs during the execution 
     * of the algorithm, then catch that exception and throw an 
     * "InvalidStateError" DOMException.
     */
    try {
      return this._serializeNode(node, namespace, prefixMap, prefixIndex,
        requireWellFormed)
    } catch {
      throw DOMException.InvalidStateError
    }
  }

  /**
   * Produces an XML serialization of a node.
   * 
   * @param node - node to serialize
   * @param namespace - context namespace
   * @param prefixMap - namespace prefix map
   * @param prefixIndex - generated namespace prefix index
   * @param requireWellFormed - whether to check conformance
   * @param level - current depth of the XML tree
   */
  private _serializeNode(node: Node, namespace: string | null,
    prefixMap: NamespacePrefixMap, prefixIndex: PrefixIndex,
    requireWellFormed: boolean, level: number = 0): PreSerializedNode<Node> {

    switch (node.nodeType) {
      case NodeType.Element:
        return this._serializeElement(<Element>node, namespace, prefixMap, prefixIndex, requireWellFormed, level)
      case NodeType.Document:
        return this._serializeDocument(<Document>node, namespace, prefixMap, prefixIndex, requireWellFormed, level)
      case NodeType.Comment:
        return this._serializeComment(<Comment>node, namespace, prefixMap, prefixIndex, requireWellFormed, level)
      case NodeType.Text:
        return this._serializeText(<Text>node, namespace, prefixMap, prefixIndex, requireWellFormed, level)
      case NodeType.DocumentFragment:
        return this._serializeDocumentFragment(<DocumentFragment>node, namespace, prefixMap, prefixIndex, requireWellFormed, level)
      case NodeType.DocumentType:
        return this._serializeDocumentType(<DocumentType>node, namespace, prefixMap, prefixIndex, requireWellFormed, level)
      case NodeType.ProcessingInstruction:
        return this._serializeProcessingInstruction(<ProcessingInstruction>node, namespace, prefixMap, prefixIndex, requireWellFormed, level)
      case NodeType.CData:
        return this._serializeCData(<CDATASection>node, namespace, prefixMap, prefixIndex, requireWellFormed, level)
      default:
        return {
          node: node,
          level: level,
          attributes: [],
          children: []
        }
    }
  }

  /**
   * Produces an XML serialization of an element node.
   * 
   * @param node - node to serialize
   * @param namespace - context namespace
   * @param prefixMap - namespace prefix map
   * @param prefixIndex - generated namespace prefix index
   * @param requireWellFormed - whether to check conformance
   * @param level - current depth of the XML tree
   */
  private _serializeElement(node: Element, namespace: string | null,
    prefixMap: NamespacePrefixMap, prefixIndex: PrefixIndex,
    requireWellFormed: boolean, level: number): PreSerializedNode<Element> {

    const attributes: PreSerializedAttr[] = []
    const children: PreSerializedNode<Node>[] = []

    /**
     * From: https://w3c.github.io/DOM-Parsing/#xml-serializing-an-element-node
     * 
     * 1. If the require well-formed flag is set (its value is true), and this 
     * node's localName attribute contains the character ":" (U+003A COLON) or 
     * does not match the XML Name production, then throw an exception; the 
     * serialization of this node would not be a well-formed element.
     */
    if (requireWellFormed && (node.localName.includes(":") ||
      !XMLSpec.isName(node.localName))) {
      throw new Error("Node local name contains invalid characters (well-formed required).")
    }

    /**
     * 2. Let markup be the string "<" (U+003C LESS-THAN SIGN).
     * 3. Let qualified name be an empty string.
     * 4. Let skip end tag be a boolean flag with value false.
     * 5. Let ignore namespace definition attribute be a boolean flag with value
     * false.
     * 6. Given prefix map, copy a namespace prefix map and let map be the 
     * result.
     * 7. Let local prefixes map be an empty map. The map has unique Node prefix 
     * strings as its keys, with corresponding namespaceURI Node values as the 
     * map's key values (in this map, the null namespace is represented by the 
     * empty string).
     * 
     * _Note:_ This map is local to each element. It is used to ensure there 
     * are no conflicting prefixes should a new namespace prefix attribute need 
     * to be generated. It is also used to enable skipping of duplicate prefix 
     * definitions when writing an element's attributes: the map allows the 
     * algorithm to distinguish between a prefix in the namespace prefix map 
     * that might be locally-defined (to the current Element) and one that is 
     * not.
     * 8. Let local default namespace be the result of recording the namespace 
     * information for node given map and local prefixes map.
     * 
     * _Note:_ The above step will update map with any found namespace prefix 
     * definitions, add the found prefix definitions to the local prefixes map 
     * and return a local default namespace value defined by a default namespace 
     * attribute if one exists. Otherwise it returns null.
     * 9. Let inherited ns be a copy of namespace.
     * 10. Let ns be the value of node's namespaceURI attribute.
     */
    let qualifiedName = ''
    let ignoreNamespaceDefinitionAttribute = false
    let map = prefixMap.copy()
    let localPrefixesMap = new Map<string, string>()
    let localDefaultNamespace = this._recordNamespaceInformation(node, map, localPrefixesMap)
    let inheritedNS = namespace
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
      if (ns === Namespace.XML) {
        qualifiedName = `xml:${node.localName}`
      } else {
        qualifiedName = node.localName
      }
      /** 11.4. Append the value of qualified name to markup. */
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
        if (requireWellFormed) {
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
        qualifiedName = `${candidatePrefix}:${node.localName}`
        if (localDefaultNamespace !== null && localDefaultNamespace !== Namespace.XML) {
          inheritedNS = localDefaultNamespace || null
        }

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
        if (localPrefixesMap.has(prefix)) {
          prefix = this._generatePrefix(ns, map, prefixIndex)
        }

        /**
         * 12.5.2. Add prefix to map given namespace ns.
         * 12.5.3. Append to qualified name the concatenation of prefix, ":" 
         * (U+003A COLON), and node's localName.
         * 12.5.4. Append the value of qualified name to markup.
         */
        map.set(prefix, ns)
        qualifiedName += `${prefix}:${node.localName}`

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
        attributes.push({ name: 'xmlns:' + prefix, value: ns || '' })

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
         * 
         * 12.6.4. Append the value of qualified name to markup.
         */
        ignoreNamespaceDefinitionAttribute = true
        qualifiedName += node.localName
        inheritedNS = ns

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
        attributes.push({ name: 'xmlns', value: ns || '' })

        /**
         * 12.7. Otherwise, the node has a local default namespace that matches 
         * ns. Append to qualified name the value of node's localName, let the
         * value of inherited ns be ns, and append the value of qualified name
         * to markup.
         */
      } else {
        qualifiedName += node.localName
        inheritedNS = ns
      }
    }

    /**
     * 13. Append to markup the result of the XML serialization of node's 
     * attributes given map, prefix index, local prefixes map, ignore namespace
     * definition attribute flag, and require well-formed flag.
     */
    const eleAttributes = this._serializeAttributes(node, map, prefixIndex,
      localPrefixesMap, ignoreNamespaceDefinitionAttribute, requireWellFormed)
    attributes.push(...eleAttributes)

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
     * 17. If the value of skip end tag is true, then return the value of markup
     * and skip the remaining steps. The node is a leaf-node.
     * 18. If ns is the HTML namespace, and the node's localName matches the 
     * string "template", then this is a template element. Append to markup the 
     * result of XML serializing a DocumentFragment node given the template 
     * element's template contents (a DocumentFragment), providing inherited 
     * ns, map, prefix index, and the require well-formed flag.
     * 
     * _Note:_ This allows template content to round-trip, given the rules for 
     * parsing XHTML documents.
     * 
     * 19. Otherwise, append to markup the result of running the XML 
     * serialization algorithm on each of node's children, in tree order, 
     * providing inherited ns, map, prefix index, and the require well-formed 
     * flag.
     */
    for (const childNode of node.childNodes) {
      children.push(this._serializeNode(childNode, inheritedNS, map,
        prefixIndex, requireWellFormed, level + 1))
    }

    /**
     * 20. Append the following to markup, in the order listed:
     * 20.1. "</" (U+003C LESS-THAN SIGN, U+002F SOLIDUS);
     * 20.2. The value of qualified name;
     * 20.3. ">" (U+003E GREATER-THAN SIGN).
     * 21. Return the value of markup.
     */
    return {
      node: node,
      level: level,
      name: qualifiedName,
      attributes: attributes,
      children: children
    }
  }

  /**
   * Produces an XML serialization of a document node.
   * 
   * @param node - node to serialize
   * @param namespace - context namespace
   * @param prefixMap - namespace prefix map
   * @param prefixIndex - generated namespace prefix index
   * @param requireWellFormed - whether to check conformance
   * @param level - current depth of the XML tree
   */
  private _serializeDocument(node: Document, namespace: string | null,
    prefixMap: NamespacePrefixMap, prefixIndex: PrefixIndex,
    requireWellFormed: boolean, level: number): PreSerializedNode<Document> {

    /**
     * If the require well-formed flag is set (its value is true), and this node
     * has no documentElement (the documentElement attribute's value is null), 
     * then throw an exception; the serialization of this node would not be a 
     * well-formed document.
     */
    if (requireWellFormed && node.documentElement === null) {
      throw new Error("Missing document element (well-formed required).")
    }
    /**
     * Otherwise, run the following steps:
     * 1. Let serialized document be an empty string.
     * 2. For each child child of node, in tree order, run the XML 
     * serialization algorithm on the child passing along the provided 
     * arguments, and append the result to serialized document.
     * 
     * _Note:_ This will serialize any number of ProcessingInstruction and
     * Comment nodes both before and after the Document's documentElement node,
     * including at most one DocumentType node. (Text nodes are not allowed as
     * children of the Document.)
     * 
     * 3. Return the value of serialized document.
    */
    const children: PreSerializedNode<Node>[] = []
    for (const childNode of node.childNodes) {
      children.push(this._serializeNode(childNode, namespace, prefixMap,
        prefixIndex, requireWellFormed, level))
    }
    return {
      node: node,
      level: level,
      attributes: [],
      children: children
    }
  }

  /**
   * Produces an XML serialization of a comment node.
   * 
   * @param node - node to serialize
   * @param namespace - context namespace
   * @param prefixMap - namespace prefix map
   * @param prefixIndex - generated namespace prefix index
   * @param requireWellFormed - whether to check conformance
   * @param level - current depth of the XML tree
   */
  private _serializeComment(node: Comment, namespace: string | null,
    prefixMap: NamespacePrefixMap, prefixIndex: PrefixIndex,
    requireWellFormed: boolean, level: number): PreSerializedNode<Comment> {

    /**
     * If the require well-formed flag is set (its value is true), and node's 
     * data contains characters that are not matched by the XML Char production 
     * or contains "--" (two adjacent U+002D HYPHEN-MINUS characters) or that 
     * ends with a "-" (U+002D HYPHEN-MINUS) character, then throw an exception;
     * the serialization of this node's data would not be well-formed.
     */
    if (requireWellFormed && (!XMLSpec.isLegalChar(node.data, this._xmlVersion) ||
      node.data.includes("--") || node.data.endsWith("-"))) {
      throw new Error("Comment data contains invalid characters (well-formed required).")
    }

    /**
     * Otherwise, return the concatenation of "<!--", node's data, and "-->".
     */
    return {
      node: node,
      level: level,
      attributes: [],
      children: []
    }
  }

  /**
   * Produces an XML serialization of a text node.
   * 
   * @param node - node to serialize
   * @param namespace - context namespace
   * @param prefixMap - namespace prefix map
   * @param prefixIndex - generated namespace prefix index
   * @param requireWellFormed - whether to check conformance
   * @param level - current depth of the XML tree
   */
  private _serializeText(node: Text, namespace: string | null,
    prefixMap: NamespacePrefixMap, prefixIndex: PrefixIndex,
    requireWellFormed: boolean, level: number): PreSerializedNode<Text> {

    /**
     * 1. If the require well-formed flag is set (its value is true), and 
     * node's data contains characters that are not matched by the XML Char 
     * production, then throw an exception; the serialization of this node's 
     * data would not be well-formed.
     */
    if (requireWellFormed && !XMLSpec.isLegalChar(node.data, this._xmlVersion)) {
      throw new Error("Text data contains invalid characters (well-formed required).")
    }

    /**
     * 2. Let markup be the value of node's data.
     * 3. Replace any occurrences of "&" in markup by "&amp;".
     * 4. Replace any occurrences of "<" in markup by "&lt;".
     * 5. Replace any occurrences of ">" in markup by "&gt;".
     * 6. Return the value of markup.
     */
    return {
      node: node,
      level: level,
      attributes: [],
      children: []
    }
  }

  /**
   * Produces an XML serialization of a document fragment node.
   * 
   * @param node - node to serialize
   * @param namespace - context namespace
   * @param prefixMap - namespace prefix map
   * @param prefixIndex - generated namespace prefix index
   * @param requireWellFormed - whether to check conformance
   * @param level - current depth of the XML tree
   */
  private _serializeDocumentFragment(node: DocumentFragment,
    namespace: string | null,
    prefixMap: NamespacePrefixMap, prefixIndex: PrefixIndex,
    requireWellFormed: boolean, level: number): PreSerializedNode<DocumentFragment> {

    /**
     * 1. Let markup the empty string.
     * 2. For each child child of node, in tree order, run the XML serialization
     * algorithm on the child given namespace, prefix map, a reference to prefix
     * index, and flag require well-formed. Concatenate the result to markup.
     * 3. Return the value of markup.
     */
    const children: PreSerializedNode<Node>[] = []
    for (const childNode of node.childNodes) {
      children.push(this._serializeNode(childNode, namespace, prefixMap,
        prefixIndex, requireWellFormed, level))
    }
    return {
      node: node,
      level: level,
      attributes: [],
      children: children
    }
  }

  /**
   * Produces an XML serialization of a document type node.
   * 
   * @param node - node to serialize
   * @param namespace - context namespace
   * @param prefixMap - namespace prefix map
   * @param prefixIndex - generated namespace prefix index
   * @param requireWellFormed - whether to check conformance
   * @param level - current depth of the XML tree
   */
  private _serializeDocumentType(node: DocumentType, namespace: string | null,
    prefixMap: NamespacePrefixMap, prefixIndex: PrefixIndex,
    requireWellFormed: boolean, level: number): PreSerializedNode<DocumentType> {

    /**
     * 1. If the require well-formed flag is true and the node's publicId 
     * attribute contains characters that are not matched by the XML PubidChar
     *  production, then throw an exception; the serialization of this node 
     * would not be a well-formed document type declaration.
     */
    if (requireWellFormed && !XMLSpec.isPubidChar(node.publicId)) {
      throw new Error("DocType public identifier does not match PubidChar construct (well-formed required).")
    }

    /**    
     * 2. If the require well-formed flag is true and the node's systemId
     * attribute contains characters that are not matched by the XML Char
     * production or that contains both a """ (U+0022 QUOTATION MARK) and a
     * "'" (U+0027 APOSTROPHE), then throw an exception; the serialization
     * of this node would not be a well-formed document type declaration.
     */
    if (requireWellFormed &&
      (!XMLSpec.isLegalChar(node.systemId, this._xmlVersion) ||
        (node.systemId.includes('"') && node.systemId.includes("'")))) {
      throw new Error("DocType system identifier contains invalid characters (well-formed required).")
    }

    /**
     * 3. Let markup be an empty string.
     * 4. Append the string "<!DOCTYPE" to markup.
     * 5. Append " " (U+0020 SPACE) to markup.
     * 6. Append the value of the node's name attribute to markup. For a node
     * belonging to an HTML document, the value will be all lowercase.
     * 7. If the node's publicId is not the empty string then append the 
     * following, in the order listed, to markup:
     * 7.1. " " (U+0020 SPACE);
     * 7.2. The string "PUBLIC";
     * 7.3. " " (U+0020 SPACE);
     * 7.4. """ (U+0022 QUOTATION MARK);
     * 7.5. The value of the node's publicId attribute;
     * 7.6. """ (U+0022 QUOTATION MARK).
     * 8. If the node's systemId is not the empty string and the node's publicId
     * is set to the empty string, then append the following, in the order
     * listed, to markup:
     * 8.1. " " (U+0020 SPACE);
     * 8.2. The string "SYSTEM".
     * 9. If the node's systemId is not the empty string then append the 
     * following, in the order listed, to markup:
     * 9.2. " " (U+0020 SPACE);
     * 9.3. """ (U+0022 QUOTATION MARK);
     * 9.3. The value of the node's systemId attribute;
     * 9.4. """ (U+0022 QUOTATION MARK).
     * 10. Append ">" (U+003E GREATER-THAN SIGN) to markup.
     * 11. Return the value of markup.
     */
    return {
      node: node,
      level: level,
      attributes: [],
      children: []
    }
  }

  /**
   * Produces an XML serialization of a processing instruction node.
   * 
   * @param node - node to serialize
   * @param namespace - context namespace
   * @param prefixMap - namespace prefix map
   * @param prefixIndex - generated namespace prefix index
   * @param requireWellFormed - whether to check conformance
   * @param level - current depth of the XML tree
   */
  private _serializeProcessingInstruction(node: ProcessingInstruction,
    namespace: string | null, prefixMap: NamespacePrefixMap,
    prefixIndex: PrefixIndex, requireWellFormed: boolean,
    level: number): PreSerializedNode<ProcessingInstruction> {

    /**
     * 1. If the require well-formed flag is set (its value is true), and node's
     * target contains a ":" (U+003A COLON) character or is an ASCII 
     * case-insensitive match for the string "xml", then throw an exception; 
     * the serialization of this node's target would not be well-formed.
     */
    if (requireWellFormed && (node.target.includes(":") || (/^xml$/i).test(node.target))) {
      throw new Error("Processing instruction target contains invalid characters (well-formed required).")
    }

    /**
     * 2. If the require well-formed flag is set (its value is true), and node's
     * data contains characters that are not matched by the XML Char production
     * or contains the string "?>" (U+003F QUESTION MARK, 
     * U+003E GREATER-THAN SIGN), then throw an exception; the serialization of
     * this node's data would not be well-formed.
     */
    if (requireWellFormed && (!XMLSpec.isLegalChar(node.data, this._xmlVersion) ||
      node.data.includes("?>"))) {
      throw new Error("Processing instruction data contains invalid characters (well-formed required).")
    }

    /**
     * 3. Let markup be the concatenation of the following, in the order listed:
     * 3.1. "<?" (U+003C LESS-THAN SIGN, U+003F QUESTION MARK);
     * 3.2. The value of node's target;
     * 3.3. " " (U+0020 SPACE);
     * 3.4. The value of node's data;
     * 3.5. "?>" (U+003F QUESTION MARK, U+003E GREATER-THAN SIGN).
     * 4. Return the value of markup.
     */
    return {
      node: node,
      level: level,
      attributes: [],
      children: []
    }
  }

  /**
   * Produces an XML serialization of a CDATA node.
   * 
   * @param node - node to serialize
   * @param namespace - context namespace
   * @param prefixMap - namespace prefix map
   * @param prefixIndex - generated namespace prefix index
   * @param requireWellFormed - whether to check conformance
   * @param level - current depth of the XML tree
   */
  private _serializeCData(node: CDATASection, namespace: string | null,
    prefixMap: NamespacePrefixMap, prefixIndex: PrefixIndex,
    requireWellFormed: boolean, level: number): PreSerializedNode<CDATASection> {

    if (requireWellFormed && (node.data.includes("]]>"))) {
      throw new Error("CDATA contains invalid characters (well-formed required).")
    }

    return {
      node: node,
      level: level,
      attributes: [],
      children: []
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
    prefixIndex: PrefixIndex, localPrefixesMap: Map<string, string>,
    ignoreNamespaceDefinitionAttribute: boolean,
    requireWellFormed: boolean): PreSerializedAttr[] {

    const result: PreSerializedAttr[] = []

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
    const localNameSet = new TupleSet<string | null, string>()

    /** 
     * 3. Loop: For each attribute attr in element's attributes, in the order 
     * they are specified in the element's attribute list: 
     */
    for (const attr of node.attributes) {
      /**
       * 3.1. If the require well-formed flag is set (its value is true), and the 
       * localname set contains a tuple whose values match those of a new tuple 
       * consisting of attr's namespaceURI attribute and localName attribute, 
       * then throw an exception; the serialization of this attr would fail to
       * produce a well-formed element serialization.
       */
      if (requireWellFormed && localNameSet.has([attr.namespaceURI, attr.localName])) {
        throw new Error("Element contains duplicate attributes (well-formed required).")
      }

      /**
       * 3.2. Create a new tuple consisting of attr's namespaceURI attribute and 
       * localName attribute, and add it to the localname set.
       * 3.3. Let attribute namespace be the value of attr's namespaceURI value.
       * 3.4. Let candidate prefix be null.
       */
      localNameSet.set([attr.namespaceURI, attr.localName])
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
        if (attributeNamespace === Namespace.XMLNS) {
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
          if (attr.value === Namespace.XML ||
            (attr.prefix === null && ignoreNamespaceDefinitionAttribute) ||
            (attr.prefix !== null && (!localPrefixesMap.has(attr.localName) ||
              localPrefixesMap.get(attr.localName) !== attr.value) &&
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
          if (requireWellFormed && attr.value === Namespace.XMLNS) {
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
          candidatePrefix = 'xmlns'

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
          result.push({ name: 'xmlns:' + candidatePrefix, value: attributeNamespace })
        }
      }

      /**
       * 3.6. Append a " " (U+0020 SPACE) to result.
       * 3.7. If candidate prefix is not null, then append to result the 
       * concatenation of candidate prefix with ":" (U+003A COLON).
       */
      let attrName = ''
      if (candidatePrefix !== null) {
        attrName = candidatePrefix + ':'
      }

      /**
       * 3.8. If the require well-formed flag is set (its value is true), and 
       * this attr's localName attribute contains the character 
       * ":" (U+003A COLON) or does not match the XML Name production or 
       * equals "xmlns" and attribute namespace is null, then throw an 
       * exception; the serialization of this attr would not be a 
       * well-formed attribute.
       */
      if (requireWellFormed && (attr.localName.includes(":") ||
        !XMLSpec.isName(attr.localName) || 
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
      attrName += attr.localName
      result.push({ attr: attr, name: attrName, value: attr.value })
    }

    /**
     * 4. Return the value of result.
     */

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
    localPrefixesMap: Map<string, string>): string | null {

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
      if (attributeNamespace === Namespace.XMLNS) {
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
          if (namespaceDefinition === Namespace.XML) {
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
          localPrefixesMap.set(prefixDefinition, namespaceDefinition || '')
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

}