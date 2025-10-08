import {
  XMLBuilderOptions, XMLBuilder, AttributesObject, ExpandObject,
  WriterOptions, XMLSerializedValue, DTDOptions,
  DefaultBuilderOptions, PIObject, DocumentWithSettings, XMLWriterOptions,
  JSONWriterOptions, ObjectWriterOptions, MapWriterOptions, YAMLWriterOptions
} from "../interfaces"
import {
  applyDefaults, isObject, isString, isMap, isArray, isEmpty,
  getValue, forEachObject, forEachArray, isSet
} from "@oozcitak/util"
import { XMLWriter, MapWriter, ObjectWriter, JSONWriter, YAMLWriter } from "../writers"
import { Document, Node, Element, NodeType } from "@oozcitak/dom/lib/dom/interfaces"
import { Guard } from "@oozcitak/dom/lib/util"
import {
  namespace_extractQName, tree_index, create_element
} from "@oozcitak/dom/lib/algorithm"
import { sanitizeInput } from "./dom"
import { namespace as infraNamespace } from "@oozcitak/infra"
import { ObjectReader, JSONReader, XMLReader, YAMLReader } from "../readers"

/**
 * Represents a wrapper that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export class XMLBuilderImpl implements XMLBuilder {
  private _domNode: Node

  /**
   * Initializes a new instance of `XMLBuilderNodeImpl`.
   *
   * @param domNode - the DOM node to wrap
   */
  constructor(domNode: Node) {
    this._domNode = domNode
  }

  /** @inheritdoc */
  get node(): Node { return this._domNode }

  /** @inheritdoc */
  get options(): XMLBuilderOptions { return this._options }

  /** @inheritdoc */
  set(options: Partial<XMLBuilderOptions>): XMLBuilder {
    this._options = applyDefaults(
      applyDefaults(this._options, options, true), // apply user settings
      DefaultBuilderOptions) as XMLBuilderOptions // provide defaults
    return this
  }

  /** @inheritdoc */
  ele(p1: string | null | ExpandObject, p2?: AttributesObject | string,
    p3?: AttributesObject): XMLBuilder {

    let namespace: string | null | undefined
    let name: string | ExpandObject | undefined | null
    let attributes: AttributesObject | undefined

    if (isObject<string>(p1)) {
      // ele(obj: ExpandObject)
      return new ObjectReader(this._options).parse(this, p1)
    } else if (isString(p1) && p1 !== null && /^\s*</.test(p1)) {
      // parse XML document string
      return new XMLReader(this._options).parse(this, p1)
    } else if (isString(p1) && p1 !== null && /^\s*[\{\[]/.test(p1)) {
      // parse JSON string
      return new JSONReader(this._options).parse(this, p1)
    } else if (isString(p1) && p1 !== null && /^(\s*|(#.*)|(%.*))*---/.test(p1)) {
      // parse YAML string
      return new YAMLReader(this._options).parse(this, p1)
    }

    if ((p1 === null || isString(p1)) && isString(p2)) {
      // ele(namespace: string, name: string, attributes?: AttributesObject)
      [namespace, name, attributes] = [p1, p2, p3]
    } else if (p1 !== null) {
      // ele(name: string, attributes?: AttributesObject)
      [namespace, name, attributes] = [undefined, p1, isObject(p2) ? p2 : undefined]
    } else {
      throw new Error("Element name cannot be null. " + this._debugInfo())
    }

    if (attributes) {
      attributes = getValue(attributes)
    }

    [namespace, name] = this._extractNamespace(
      sanitizeInput(namespace, this._options.invalidCharReplacement),
      sanitizeInput(name as string, this._options.invalidCharReplacement), true)

    // inherit namespace from parent
    if (namespace === undefined) {
      const [prefix] = namespace_extractQName(name)
      namespace = this.node.lookupNamespaceURI(prefix)
    }

    // create a child element node
    const childNode = (namespace !== undefined && namespace !== null ?
      this._doc.createElementNS(namespace, name) :
      this._doc.createElement(name)
    )

    this.node.appendChild(childNode)
    const builder = new XMLBuilderImpl(childNode)

    // update doctype node if the new node is the document element node
    const oldDocType = this._doc.doctype
    if (childNode === this._doc.documentElement && oldDocType !== null) {
      const docType = this._doc.implementation.createDocumentType(
        this._doc.documentElement.tagName,
        oldDocType.publicId, oldDocType.systemId)
      this._doc.replaceChild(docType, oldDocType)
    }

    // create attributes
    if (attributes && !isEmpty(attributes)) {
      builder.att(attributes)
    }

    return builder
  }

  /** @inheritdoc */
  remove(): XMLBuilder {
    const parent = this.up()
    parent.node.removeChild(this.node)
    return parent
  }

  /** @inheritdoc */
  att(p1: AttributesObject | string | null, p2?: string, p3?: string): XMLBuilder {

    if (isMap<string>(p1) || isObject<string>(p1)) {
      // att(obj: AttributesObject)
      // expand if object
      forEachObject(p1, (attName, attValue) => this.att(attName, attValue), this)
      return this
    }

    // get primitive values
    if (p1 !== undefined && p1 !== null) p1 = getValue(p1 + "")
    if (p2 !== undefined && p2 !== null) p2 = getValue(p2 + "")
    if (p3 !== undefined && p3 !== null) p3 = getValue(p3 + "")

    let namespace: string | null | undefined
    let name: string | undefined
    let value: string | undefined

    if ((p1 === null || isString(p1)) && isString(p2) && (p3 === null || isString(p3))) {
      // att(namespace: string, name: string, value: string)
      [namespace, name, value] = [p1, p2, p3]
    } else if (isString(p1) && (p2 == null || isString(p2))) {
      // ele(name: string, value: string)
      [namespace, name, value] = [undefined, p1, p2]
    } else {
      throw new Error("Attribute name and value not specified. " + this._debugInfo())
    }

    if (this._options.keepNullAttributes && (value == null)) {
      // keep null attributes
      value = ""
    } else if (value == null) {
      // skip null|undefined attributes
      return this
    }

    if (!Guard.isElementNode(this.node)) {
      throw new Error("An attribute can only be assigned to an element node.")
    }
    let ele = this.node as Element
    [namespace, name] = this._extractNamespace(namespace, name, false)
    name = sanitizeInput(name, this._options.invalidCharReplacement)
    namespace = sanitizeInput(namespace, this._options.invalidCharReplacement)
    value = sanitizeInput(value, this._options.invalidCharReplacement)
    const [prefix, localName] = namespace_extractQName(name)
    const [elePrefix] = namespace_extractQName(ele.prefix ? ele.prefix + ':' + ele.localName : ele.localName)

    // check if this is a namespace declaration attribute
    // assign a new element namespace if it wasn't previously assigned
    let eleNamespace: string | null = null
    if (prefix === "xmlns") {
      namespace = infraNamespace.XMLNS
      if (ele.namespaceURI === null && elePrefix === localName) {
        eleNamespace = value
      }
    } else if (prefix === null && localName === "xmlns" && elePrefix === null) {
      namespace = infraNamespace.XMLNS
      eleNamespace = value
    }

    // re-create the element node if its namespace changed
    // we can't simply change the namespaceURI since its read-only
    if (eleNamespace !== null) {
      this._updateNamespace(eleNamespace)
      ele = this.node as Element
    }

    if (namespace !== undefined) {
      ele.setAttributeNS(namespace, name, value)
    } else {
      ele.setAttribute(name, value)
    }

    return this
  }

  /** @inheritdoc */
  removeAtt(p1: string | null | string[], p2?: string | string[]): XMLBuilder {
    if (!Guard.isElementNode(this.node)) {
      throw new Error("An attribute can only be removed from an element node.")
    }

    // get primitive values
    p1 = getValue(p1)
    if (p2 !== undefined) {
      p2 = getValue(p2)
    }

    let namespace: undefined | null | string
    let name: string | string[]

    if (p1 !== null && p2 === undefined) {
      name = p1
    } else if ((p1 === null || isString(p1)) && p2 !== undefined) {
      namespace = p1
      name = p2
    } else {
      throw new Error("Attribute namespace must be a string. " + this._debugInfo())
    }

    if (isArray<string>(name) || isSet<string>(name)) {
      // removeAtt(names: string[])
      // removeAtt(namespace: string, names: string[])
      forEachArray(name, attName =>
        namespace === undefined ? this.removeAtt(attName) : this.removeAtt(namespace, attName), this)
    } else if (namespace !== undefined) {
      // removeAtt(namespace: string, name: string)
      name = sanitizeInput(name, this._options.invalidCharReplacement)
      namespace = sanitizeInput(namespace, this._options.invalidCharReplacement)
      this.node.removeAttributeNS(namespace, name)
    } else {
      // removeAtt(name: string)
      name = sanitizeInput(name, this._options.invalidCharReplacement)
      this.node.removeAttribute(name)
    }

    return this
  }

  /** @inheritdoc */
  txt(content: string): XMLBuilder {
    if (content === null || content === undefined) {
      if (this._options.keepNullNodes) {
        // keep null nodes
        content = ""
      } else {
        // skip null|undefined nodes
        return this
      }
    }

    const child = this._doc.createTextNode(
      sanitizeInput(content, this._options.invalidCharReplacement))
    this.node.appendChild(child)

    return this
  }

  /** @inheritdoc */
  com(content: string): XMLBuilder {
    if (content === null || content === undefined) {
      if (this._options.keepNullNodes) {
        // keep null nodes
        content = ""
      } else {
        // skip null|undefined nodes
        return this
      }
    }

    const child = this._doc.createComment(
      sanitizeInput(content, this._options.invalidCharReplacement))
    this.node.appendChild(child)

    return this
  }

  /** @inheritdoc */
  dat(content: string): XMLBuilder {
    if (content === null || content === undefined) {
      if (this._options.keepNullNodes) {
        // keep null nodes
        content = ""
      } else {
        // skip null|undefined nodes
        return this
      }
    }

    const child = this._doc.createCDATASection(
      sanitizeInput(content, this._options.invalidCharReplacement))
    this.node.appendChild(child)

    return this
  }

  /** @inheritdoc */
  ins(target: string | PIObject, content: string = ''): XMLBuilder {
    if (content === null || content === undefined) {
      if (this._options.keepNullNodes) {
        // keep null nodes
        content = ""
      } else {
        // skip null|undefined nodes
        return this
      }
    }

    if (isArray<string>(target) || isSet<string>(target)) {
      forEachArray<string>(target, item => {
        item += ""
        const insIndex = item.indexOf(' ')
        const insTarget = (insIndex === -1 ? item : item.substr(0, insIndex))
        const insValue = (insIndex === -1 ? '' : item.substr(insIndex + 1))
        this.ins(insTarget, insValue)
      }, this)
    } else if (isMap<string>(target) || isObject<string>(target)) {
      forEachObject(target, (insTarget, insValue) => this.ins(insTarget, insValue), this)
    } else {
      const child = this._doc.createProcessingInstruction(
        sanitizeInput(target, this._options.invalidCharReplacement),
        sanitizeInput(content, this._options.invalidCharReplacement))
      this.node.appendChild(child)
    }

    return this
  }

  /** @inheritdoc */
  dec(options: { version?: "1.0", encoding?: string, standalone?: boolean }): XMLBuilder {
    this._options.version = options.version || "1.0"
    this._options.encoding = options.encoding
    this._options.standalone = options.standalone

    return this
  }

  /** @inheritdoc */
  dtd(options?: DTDOptions): XMLBuilder {
    const name = sanitizeInput((options && options.name) || (this._doc.documentElement ? this._doc.documentElement.tagName : "ROOT"), this._options.invalidCharReplacement)
    const pubID = sanitizeInput((options && options.pubID) || "", this._options.invalidCharReplacement)
    const sysID = sanitizeInput((options && options.sysID) || "", this._options.invalidCharReplacement)

    // name must match document element
    if (this._doc.documentElement !== null && name !== this._doc.documentElement.tagName) {
      throw new Error("DocType name does not match document element name.")
    }

    // create doctype node
    const docType = this._doc.implementation.createDocumentType(name, pubID, sysID)

    if (this._doc.doctype !== null) {
      // replace existing doctype
      this._doc.replaceChild(docType, this._doc.doctype)
    } else {
      // insert before document element node or append to end
      this._doc.insertBefore(docType, this._doc.documentElement)
    }

    return this
  }

  /** @inheritdoc */
  import(node: XMLBuilder): XMLBuilder {
    const hostNode = this._domNode
    const hostDoc = this._doc

    const importedNode = node.node

    const updateImportedNodeNs = (clone: Element) => {
      // update namespace of imported node only when not specified
      if (!clone._namespace) {
        const [prefix] = namespace_extractQName(
          clone.prefix ? clone.prefix + ':' + clone.localName : clone.localName
        );
        const namespace = hostNode.lookupNamespaceURI(prefix)
        new XMLBuilderImpl(clone)._updateNamespace(namespace)
      }
    };

    if (Guard.isDocumentNode(importedNode)) {
      // import document node
      const elementNode = importedNode.documentElement
      if (elementNode === null) {
        throw new Error("Imported document has no document element node. " + this._debugInfo())
      }
      const clone = hostDoc.importNode(elementNode, true) as Element
      hostNode.appendChild(clone)
      updateImportedNodeNs(clone)
    } else if (Guard.isDocumentFragmentNode(importedNode)) {
      // import child nodes
      for (const childNode of importedNode.childNodes) {
        const clone = hostDoc.importNode(childNode, true)
        hostNode.appendChild(clone)
        if (Guard.isElementNode(clone)) {
          updateImportedNodeNs(clone)
        }
      }
    } else {
      // import node
      const clone = hostDoc.importNode(importedNode, true)
      hostNode.appendChild(clone)
      if (Guard.isElementNode(clone)) {
        updateImportedNodeNs(clone)
      }
    }

    return this
  }

  /** @inheritdoc */
  doc(): XMLBuilder {
    if ((this._doc as DocumentWithSettings)._isFragment) {
      let node: Node | null = this.node
      while (node && node.nodeType !== NodeType.DocumentFragment) {
        node = node.parentNode
      }
      /* istanbul ignore next */
      if (node === null) {
        throw new Error("Node has no parent node while searching for document fragment ancestor. " + this._debugInfo())
      }
      return new XMLBuilderImpl(node)
    } else {
      return new XMLBuilderImpl(this._doc)
    }
  }

  /** @inheritdoc */
  root(): XMLBuilder {
    const ele = this._doc.documentElement
    if (!ele) {
      throw new Error("Document root element is null. " + this._debugInfo())
    }
    return new XMLBuilderImpl(ele)
  }

  /** @inheritdoc */
  up(): XMLBuilder {
    const parent = this._domNode.parentNode
    if (!parent) {
      throw new Error("Parent node is null. " + this._debugInfo())
    }
    return new XMLBuilderImpl(parent)
  }

  /** @inheritdoc */
  prev(): XMLBuilder {
    const node = this._domNode.previousSibling
    if (!node) {
      throw new Error("Previous sibling node is null. " + this._debugInfo())
    }
    return new XMLBuilderImpl(node)
  }

  /** @inheritdoc */
  next(): XMLBuilder {
    const node = this._domNode.nextSibling
    if (!node) {
      throw new Error("Next sibling node is null. " + this._debugInfo())
    }
    return new XMLBuilderImpl(node)
  }

  /** @inheritdoc */
  first(): XMLBuilder {
    const node = this._domNode.firstChild
    if (!node) {
      throw new Error("First child node is null. " + this._debugInfo())
    }
    return new XMLBuilderImpl(node)
  }

  /** @inheritdoc */
  last(): XMLBuilder {
    const node = this._domNode.lastChild
    if (!node) {
      throw new Error("Last child node is null. " + this._debugInfo())
    }
    return new XMLBuilderImpl(node)
  }

  /** @inheritdoc */
  each(callback: ((node: XMLBuilder, index: number, level: number) => void), self = false,
    recursive = false, thisArg?: any): XMLBuilder {
    let result = this._getFirstDescendantNode(this._domNode, self, recursive)
    while (result[0]) {
      const nextResult = this._getNextDescendantNode(this._domNode, result[0], recursive, result[1], result[2])
      callback.call(thisArg, new XMLBuilderImpl(result[0]), result[1], result[2])
      result = nextResult
    }

    return this
  }

  /** @inheritdoc */
  map<T>(callback: ((node: XMLBuilder, index: number, level: number) => T), self = false,
    recursive = false, thisArg?: any): T[] {
    let result: T[] = []
    this.each((node, index, level) =>
      result.push(callback.call(thisArg, node, index, level)),
      self, recursive
    )
    return result
  }

  /** @inheritdoc */
  reduce<T>(callback: ((value: T, node: XMLBuilder, index: number, level: number) => T),
    initialValue: T, self = false, recursive = false, thisArg?: any): T {
    let value = initialValue
    this.each((node, index, level) =>
      value = callback.call(thisArg, value, node, index, level),
      self, recursive
    )
    return value
  }

  /** @inheritdoc */
  find(predicate: ((node: XMLBuilder, index: number, level: number) => boolean), self = false,
    recursive = false, thisArg?: any): XMLBuilder | undefined {
    let result = this._getFirstDescendantNode(this._domNode, self, recursive)
    while (result[0]) {
      const builder = new XMLBuilderImpl(result[0])
      if (predicate.call(thisArg, builder, result[1], result[2])) {
        return builder
      }
      result = this._getNextDescendantNode(this._domNode, result[0], recursive, result[1], result[2])
    }
    return undefined
  }

  /** @inheritdoc */
  filter(predicate: ((node: XMLBuilder, index: number, level: number) => boolean), self = false,
    recursive = false, thisArg?: any): XMLBuilder[] {
    let result: XMLBuilder[] = []
    this.each((node, index, level) => {
      if (predicate.call(thisArg, node, index, level)) {
        result.push(node)
      }
    }, self, recursive)
    return result
  }

  /** @inheritdoc */
  every(predicate: ((node: XMLBuilder, index: number, level: number) => boolean), self = false,
    recursive = false, thisArg?: any): boolean {
    let result = this._getFirstDescendantNode(this._domNode, self, recursive)
    while (result[0]) {
      const builder = new XMLBuilderImpl(result[0])
      if (!predicate.call(thisArg, builder, result[1], result[2])) {
        return false
      }
      result = this._getNextDescendantNode(this._domNode, result[0], recursive, result[1], result[2])
    }
    return true
  }

  /** @inheritdoc */
  some(predicate: ((node: XMLBuilder, index: number, level: number) => boolean), self = false,
    recursive = false, thisArg?: any): boolean {
    let result = this._getFirstDescendantNode(this._domNode, self, recursive)
    while (result[0]) {
      const builder = new XMLBuilderImpl(result[0])
      if (predicate.call(thisArg, builder, result[1], result[2])) {
        return true
      }
      result = this._getNextDescendantNode(this._domNode, result[0], recursive, result[1], result[2])
    }
    return false
  }

  /** @inheritdoc */
  toArray(self = false, recursive = false): XMLBuilder[] {
    let result: XMLBuilder[] = []
    this.each(node => result.push(node), self, recursive)
    return result
  }

  /** @inheritdoc */
  toString(writerOptions?: XMLWriterOptions | JSONWriterOptions | YAMLWriterOptions): string {
    writerOptions = writerOptions || {}
    if (writerOptions.format === undefined) {
      writerOptions.format = "xml"
    }

    return this._serialize(writerOptions) as string
  }

  /** @inheritdoc */
  toObject(writerOptions?: ObjectWriterOptions | MapWriterOptions): any {
    writerOptions = writerOptions || {}
    if (writerOptions.format === undefined) {
      writerOptions.format = "object"
    }

    return this._serialize(writerOptions)
  }

  /** @inheritdoc */
  end(writerOptions?: WriterOptions): any {
    writerOptions = writerOptions || {}
    if (writerOptions.format === undefined) {
      writerOptions.format = "xml"
    }

    return (this.doc() as XMLBuilderImpl)._serialize(writerOptions)
  }

  /**
   * Gets the next descendant of the given node of the tree rooted at `root`
   * in depth-first pre-order. Returns a three-tuple with
   * [descendant, descendant_index, descendant_level].
   *
   * @param root - root node of the tree
   * @param self - whether to visit the current node along with child nodes
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   */
  private _getFirstDescendantNode(root: Node, self: boolean, recursive: boolean): [Node | null, number, number] {
    if (self)
      return [this._domNode, 0, 0]
    else if (recursive)
      return this._getNextDescendantNode(root, root, recursive, 0, 0)
    else
      return [this._domNode.firstChild, 0, 1]
  }

  /**
   * Gets the next descendant of the given node of the tree rooted at `root`
   * in depth-first pre-order. Returns a three-tuple with
   * [descendant, descendant_index, descendant_level].
   *
   * @param root - root node of the tree
   * @param node - current node
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   * @param index - child node index
   * @param level - current depth of the XML tree
   */
  private _getNextDescendantNode(root: Node, node: Node, recursive: boolean, index: number, level: number): [Node | null, number, number] {
    if (recursive) {
      // traverse child nodes
      if (node.firstChild) return [node.firstChild, 0, level + 1]

      if (node === root) return [null, -1, -1]

      // traverse siblings
      if (node.nextSibling) return [node.nextSibling, index + 1, level]

      // traverse parent's next sibling
      let parent = node.parentNode
      while (parent && parent !== root) {
        if (parent.nextSibling) return [parent.nextSibling, tree_index(parent.nextSibling), level - 1]
        parent = parent.parentNode
        level--
      }
    } else {
      if (root === node)
        return [node.firstChild, 0, level + 1]
      else
        return [node.nextSibling, index + 1, level]
    }

    return [null, -1, -1]
  }

  /**
   * Converts the node into its string or object representation.
   *
   * @param options - serialization options
   */
  private _serialize(writerOptions: WriterOptions): XMLSerializedValue {
    if (writerOptions.format === "xml") {
      const writer = new XMLWriter(this._options, writerOptions)
      return writer.serialize(this.node)
    } else if (writerOptions.format === "map") {
      const writer = new MapWriter(this._options, writerOptions)
      return writer.serialize(this.node)
    } else if (writerOptions.format === "object") {
      const writer = new ObjectWriter(this._options, writerOptions)
      return writer.serialize(this.node)
    } else if (writerOptions.format === "json") {
      const writer = new JSONWriter(this._options, writerOptions)
      return writer.serialize(this.node)
    } else if (writerOptions.format === "yaml") {
      const writer = new YAMLWriter(this._options, writerOptions)
      return writer.serialize(this.node)
    } else {
      throw new Error("Invalid writer format: " + writerOptions.format + ". " + this._debugInfo())
    }
  }

  /**
   * Extracts a namespace and name from the given string.
   *
   * @param namespace - namespace
   * @param name - a string containing both a name and namespace separated by an
   * `'@'` character
   * @param ele - `true` if this is an element namespace; otherwise `false`
   */
  private _extractNamespace(namespace: string | null | undefined, name: string, ele: boolean): [string | null | undefined, string] {
    // extract from name
    const atIndex = name.indexOf("@")
    if (atIndex > 0) {
      if (namespace === undefined) namespace = name.slice(atIndex + 1)
      name = name.slice(0, atIndex)
    }

    if (namespace === undefined) {
      // look-up default namespace
      namespace = (ele ? this._options.defaultNamespace.ele : this._options.defaultNamespace.att)
    } else if (namespace !== null && namespace[0] === "@") {
      // look-up namespace aliases
      const alias = namespace.slice(1)
      namespace = this._options.namespaceAlias[alias]
      if (namespace === undefined) {
        throw new Error("Namespace alias `" + alias + "` is not defined. " + this._debugInfo())
      }
    }

    return [namespace, name]
  }

  /**
   * Updates the element's namespace.
   *
   * @param ns - new namespace
   */
  private _updateNamespace(ns: string | null): void {
    const ele = this._domNode
    if (Guard.isElementNode(ele) && ns !== null && ele.namespaceURI !== ns) {
      const [elePrefix, eleLocalName] = namespace_extractQName(ele.prefix ? ele.prefix + ':' + ele.localName : ele.localName)

      // re-create the element node if its namespace changed
      // we can't simply change the namespaceURI since its read-only
      const newEle = create_element(this._doc, eleLocalName, ns, elePrefix)
      for (const attr of ele.attributes) {
        const attrQName = attr.prefix ? attr.prefix + ':' + attr.localName : attr.localName
        const [attrPrefix] = namespace_extractQName(attrQName)
        let newAttrNS = attr.namespaceURI
        if (newAttrNS === null && attrPrefix !== null) {
          newAttrNS = ele.lookupNamespaceURI(attrPrefix)
        }

        if (newAttrNS === null) {
          newEle.setAttribute(attrQName, attr.value)
        } else {
          newEle.setAttributeNS(newAttrNS, attrQName, attr.value)
        }
      }

      // replace the new node in parent node
      const parent = ele.parentNode
      /* istanbul ignore next */
      if (parent === null) {
        throw new Error("Parent node is null." + this._debugInfo())
      }
      parent.replaceChild(newEle, ele)
      this._domNode = newEle

      // check child nodes
      for (const childNode of ele.childNodes) {
        const newChildNode = childNode.cloneNode(true)
        newEle.appendChild(newChildNode)
        if (Guard.isElementNode(newChildNode) && !newChildNode._namespace) {
          const [newChildNodePrefix] = namespace_extractQName(newChildNode.prefix ? newChildNode.prefix + ':' + newChildNode.localName : newChildNode.localName)
          const newChildNodeNS = newEle.lookupNamespaceURI(newChildNodePrefix)
          new XMLBuilderImpl(newChildNode)._updateNamespace(newChildNodeNS)
        }
      }
    }
  }

  /**
   * Returns the document owning this node.
   */
  protected get _doc(): Document {
    const node = this.node
    if (Guard.isDocumentNode(node)) {
      return node
    } else {
      const docNode = node.ownerDocument
      /* istanbul ignore next */
      if (!docNode) throw new Error("Owner document is null. " + this._debugInfo())
      return docNode
    }
  }

  /**
   * Returns debug information for this node.
   *
   * @param name - node name
   */
  protected _debugInfo(name?: string): string {
    const node = this.node
    const parentNode = node.parentNode

    name = name || node.nodeName
    const parentName = parentNode ? parentNode.nodeName : ''

    if (!parentName) {
      return "node: <" + name + ">"
    } else {
      return "node: <" + name + ">, parent: <" + parentName + ">"
    }
  }

  /**
   * Gets or sets builder options.
   */
  protected get _options(): XMLBuilderOptions {
    const doc = this._doc as DocumentWithSettings
    /* istanbul ignore next */
    if (doc._xmlBuilderOptions === undefined) {
      throw new Error("Builder options is not set.")
    }
    return doc._xmlBuilderOptions
  }
  protected set _options(value: XMLBuilderOptions) {
    const doc = this._doc as DocumentWithSettings
    doc._xmlBuilderOptions = value
  }

}
