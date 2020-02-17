import {
  XMLBuilderOptions, XMLBuilder, AttributesObject, ExpandObject,
  WriterOptions, XMLSerializedValue, DTDOptions,
  DefaultBuilderOptions, PIObject, DocumentWithSettings
} from "./interfaces"
import {
  applyDefaults, isObject, isString, isFunction, isMap, isArray, isEmpty,
  getValue, forEachObject, forEachArray, isSet
} from "@oozcitak/util"
import {
  StringWriterImpl, MapWriterImpl, ObjectWriterImpl, JSONWriterImpl
} from "../writers"
import { Document, Node, Element } from "@oozcitak/dom/lib/dom/interfaces"
import { createParser, throwIfParserError } from "./dom"
import { Guard } from "@oozcitak/dom/lib/util"

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
  set(options: Partial<XMLBuilderOptions>): XMLBuilder {
    this._options = applyDefaults(
      applyDefaults(this._options, options, true), // apply user settings
      DefaultBuilderOptions) as XMLBuilderOptions // provide defaults
    return this
  }

  /** @inheritdoc */
  ele(p1: string | ExpandObject, p2?: AttributesObject | string,
    p3?: AttributesObject): XMLBuilder {

    let namespace: string | undefined
    let name: string | ExpandObject | undefined
    let attributes: AttributesObject | undefined

    let lastChild: XMLBuilder | null = null

    if (isString(p1) && /^\s*</.test(p1)) {
      // parse XML string
      const contents = "<TEMP_ROOT>" + p1 + "</TEMP_ROOT>"
      const domParser = createParser()
      const doc = domParser.parseFromString(contents, "text/xml")
      /* istanbul ignore next */
      if (doc.documentElement === null) {
        throw new Error("Document element is null.")
      }
      throwIfParserError(doc)
      for (const child of doc.documentElement.childNodes) {
        const newChild = doc.importNode(child, true)
        lastChild = new XMLBuilderImpl(newChild)
        this._domNode.appendChild(newChild)
      }
      if (lastChild === null) {
        throw new Error("Could not create any elements with: " + p1.toString() + ". " + this._debugInfo())
      }
      return lastChild
    } else if (isString(p1) && /^\s*[\{\[]/.test(p1)) {
      // parse JSON string
      const obj = JSON.parse(p1) as ExpandObject
      return this.ele(obj)
    } else if (isObject(p1)) {
      // ele(obj: ExpandObject)
      [namespace, name, attributes] = [undefined, p1, undefined]
    } else if (isString(p1) && isString(p2)) {
      // ele(namespace: string, name: string, attributes?: AttributesObject)
      [namespace, name, attributes] = [p1, p2, p3]
    } else if (isString(p1) && isObject(p2)) {
      // ele(name: string, attributes: AttributesObject)
      [namespace, name] = this._extractNamespace(p1)
      attributes = p2
    } else {
      // ele(name: string)
      [namespace, name] = this._extractNamespace(p1)
    }

    if (attributes) {
      attributes = getValue(attributes)
    }

    if (isFunction(name)) {
      // evaluate if function
      lastChild = this.ele(name.apply(this))
    } else if (isArray(name) || isSet(name)) {
      forEachArray(name, item => lastChild = this.ele(item), this)
    } else if (isMap(name) || isObject(name)) {
      // expand if object
      forEachObject(name, (key, val) => {
        if (isFunction(val)) {
          // evaluate if function
          val = val.apply(this)
        }

        if (!this._options.ignoreConverters && key.indexOf(this._options.convert.att) === 0) {
          // assign attributes
          if (key === this._options.convert.att) {
            lastChild = this.att(val)
          } else {
            lastChild = this.att(key.substr(this._options.convert.att.length), val)
          }
        } else if (!this._options.ignoreConverters && key.indexOf(this._options.convert.text) === 0) {
          // text node
          if (isMap(val) || isObject(val)) {
            // if the key is #text expand child nodes under this node to support mixed content
            lastChild = this.ele(val)
          } else {
            lastChild = this.txt(val)
          }
        } else if (!this._options.ignoreConverters && key.indexOf(this._options.convert.cdata) === 0) {
          // cdata node
          if (isArray(val) || isSet(val)) {
            forEachArray(val, item => lastChild = this.dat(item), this)
          } else {
            lastChild = this.dat(val)
          }
        } else if (!this._options.ignoreConverters && key.indexOf(this._options.convert.comment) === 0) {
          // comment node
          if (isArray(val) || isSet(val)) {
            forEachArray(val, item => lastChild = this.com(item), this)
          } else {
            lastChild = this.com(val)
          }
        } else if (!this._options.ignoreConverters && key.indexOf(this._options.convert.ins) === 0) {
          // processing instruction
          if (isString(val)) {
            const insIndex = val.indexOf(' ')
            const insTarget = (insIndex === -1 ? val : val.substr(0, insIndex))
            const insValue = (insIndex === -1 ? '' : val.substr(insIndex + 1))
            lastChild = this.ins(insTarget, insValue)
          } else {
            lastChild = this.ins(val)
          }
        } else if ((isArray(val) || isSet(val)) && isEmpty(val)) {
          // skip empty arrays
          lastChild = this._dummy()
        } else if ((isMap(val) || isObject(val)) && isEmpty(val)) {
          // empty objects produce one node
          lastChild = this.ele(key)
        } else if (!this._options.keepNullNodes && (val === null)) {
          // skip null and undefined nodes
          lastChild = this._dummy()
        } else if (isArray(val) || isSet(val)) {
          // expand list by creating child nodes
          forEachArray(val, item => {
            const childNode: { [key: string]: any } = {}
            childNode[key] = item
            lastChild = this.ele(childNode)
          }, this)
        } else if (isMap(val) || isObject(val)) {
          // create a parent node
          [namespace, name] = this._extractNamespace(key)
          lastChild = this._node(namespace, name)

          // expand child nodes under parent
          lastChild.ele(val)
        } else if (val) {
          // leaf element node with a single text node
          lastChild = this.ele(key)
          lastChild.txt(val)
        } else {
          // leaf element node
          lastChild = this.ele(key)
        }
      }, this)
    } else {
      // element node
      lastChild = this._node(namespace, name, attributes)
    }

    if (lastChild === null) {
      throw new Error("Could not create any elements with: " + name.toString() + ". " + this._debugInfo())
    }

    return lastChild

  }

  /** @inheritdoc */
  remove(): XMLBuilder {
    const parent = this.up()
    parent.node.removeChild(this.node)
    return parent
  }

  /** @inheritdoc */
  att(p1: AttributesObject | string, p2?: string, p3?: string): XMLBuilder {

    if (isMap(p1) || isObject(p1)) {
      // att(obj: AttributesObject)
      // expand if object
      forEachObject(p1, (attName, attValue) => this.att(attName, attValue), this)
      return this
    }

    // get primitive values
    p1 = getValue(p1)
    if (p2 !== undefined && p2 !== null) {
      p2 = getValue(p2)
    }
    if (p3 !== undefined && p3 !== null) {
      p3 = getValue(p3)
    }

    let namespace: string | null | undefined
    let name: string | undefined
    let value: string

    if (p1 !== undefined && p2 !== undefined && p3 !== undefined) {
      // att(namespace: string, name: string, value: string)
      [namespace, name, value] = [p1 as string, p2, p3]
    } else if (p1 !== undefined && p2 !== undefined) {
      // ele(name: string, value: string)
      [namespace, name] = this._extractNamespace(p1 as string)
      value = p2
    } else {
      throw new Error("Attribute name and value not specified. " + this._debugInfo())
    }

    if (this._options.keepNullAttributes && (value === null)) {
      // keep null attributes
      value = ""
    } else if (value === null) {
      // skip null attributes
      return this
    }

    const ele = this.node as Element

    if (namespace !== null && namespace !== undefined) {
      ele.setAttributeNS(namespace + "", name + "", value + "")
    } else {
      ele.setAttribute(name + "", value + "")
    }

    return this
  }

  /** @inheritdoc */
  removeAtt(p1: string | string[], p2?: string | string[]): XMLBuilder {

    // get primitive values
    p1 = getValue(p1)
    if (p2 !== undefined) {
      p2 = getValue(p2)
    }

    if (isArray(p1) || isSet(p1)) {
      // removeAtt(names: string[])
      forEachArray(p1, attName => this.removeAtt(attName), this)
    } else if (isArray(p2) || isSet(p2)) {
      // removeAtt(namespace: string, names: string[])
      forEachArray(p2, attName => this.removeAtt(p1 + "", attName), this)
    } else if (p1 !== undefined && p2 !== undefined) {
      // removeAtt(namespace: string, name: string)
      (this.node as Element).removeAttributeNS(p1 + "", p2 + "")
    } else {
      // removeAtt(name: string)
      (this.node as Element).removeAttribute(p1 + "")
    }

    return this
  }

  /** @inheritdoc */
  txt(content: string): XMLBuilder {
    const child = this._doc.createTextNode(content + "")
    this.node.appendChild(child)

    return this
  }

  /** @inheritdoc */
  com(content: string): XMLBuilder {
    const child = this._doc.createComment(content + "")
    this.node.appendChild(child)

    return this
  }

  /** @inheritdoc */
  dat(content: string): XMLBuilder {
    const child = this._doc.createCDATASection(content + "")
    this.node.appendChild(child)

    return this
  }

  /** @inheritdoc */
  ins(target: string | PIObject, content: string = ''): XMLBuilder {

    if (isArray(target) || isSet(target)) {
      forEachArray(target, item => {
        item += ""
        const insIndex = item.indexOf(' ')
        const insTarget = (insIndex === -1 ? item : item.substr(0, insIndex))
        const insValue = (insIndex === -1 ? '' : item.substr(insIndex + 1))
        this.ins(insTarget, insValue)
      }, this)
    } else if (isMap(target) || isObject(target)) {
      forEachObject(target, (insTarget, insValue) => this.ins(insTarget, insValue), this)
    } else {
      const child = this._doc.createProcessingInstruction(target + "", content + "")
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
    const pubID = ((options && options.pubID) || "") + ""
    const sysID = ((options && options.sysID) || "") + ""

    // create doctype node
    const docType = this._doc.implementation.createDocumentType(
      this._doc.documentElement !== null ? this._doc.documentElement.tagName : 'ROOT',
      pubID, sysID)

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

    if (Guard.isDocumentNode(importedNode)) {
      // import document node
      const elementNode = importedNode.documentElement
      if (elementNode === null) {
        throw new Error("Imported document has no document element node. " + this._debugInfo())
      }
      const clone = hostDoc.importNode(elementNode, true)
      hostNode.appendChild(clone)
    } else if (Guard.isDocumentFragmentNode(importedNode)) {
      // import child nodes
      for (const childNode of importedNode.childNodes) {
        const clone = hostDoc.importNode(childNode, true)
        hostNode.appendChild(clone)
      }
    } else {
      // import node
      const clone = hostDoc.importNode(importedNode, true)
      hostNode.appendChild(clone)
    }

    return this
  }

  /** @inheritdoc */
  doc(): XMLBuilder {
    return new XMLBuilderImpl(this._doc)
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
  each(callback: ((node: XMLBuilder, index: number) => void), self = false,
    recursive = false, thisArg?: any): XMLBuilder {
    let node = this._getFirstDescendantNode(this._domNode, self, recursive)
    let index = 0
    while (node) {
      callback.call(thisArg, new XMLBuilderImpl(node), index++)
      node = this._getNextDescendantNode(this._domNode, node, recursive)
    }

    return this
  }

  /** @inheritdoc */
  map<T>(callback: ((node: XMLBuilder, index: number) => T), self = false,
    recursive = false, thisArg?: any): T[] {
    let result: T[] = []
    this.each((node, index) =>
      result.push(callback.call(thisArg, node, index)),
      self, recursive
    )
    return result
  }

  /** @inheritdoc */
  reduce<T>(callback: ((value: T, node: XMLBuilder, index: number) => T),
    initialValue: T, self = false, recursive = false, thisArg?: any): T {
    let value = initialValue
    this.each((node, index) =>
      value = callback.call(thisArg, value, node, index),
      self, recursive
    )
    return value
  }

  /** @inheritdoc */
  find(predicate: ((node: XMLBuilder, index: number) => boolean), self = false,
    recursive = false, thisArg?: any): XMLBuilder | undefined {
    let node = this._getFirstDescendantNode(this._domNode, self, recursive)
    let index = 0
    while (node) {
      const builder = new XMLBuilderImpl(node)
      if (predicate.call(thisArg, builder, index++)) {
        return builder
      }
      node = this._getNextDescendantNode(this._domNode, node, recursive)
    }
    return undefined
  }

  /** @inheritdoc */
  filter(predicate: ((node: XMLBuilder, index: number) => boolean), self = false,
    recursive = false, thisArg?: any): XMLBuilder[] {
    let result: XMLBuilder[] = []
    this.each((node, index) => {
      if (predicate.call(thisArg, node, index)) {
        result.push(node)
      }
    }, self, recursive)
    return result
  }

  /** @inheritdoc */
  every(predicate: ((node: XMLBuilder, index: number) => boolean), self = false,
    recursive = false, thisArg?: any): boolean {
    let node = this._getFirstDescendantNode(this._domNode, self, recursive)
    let index = 0
    while (node) {
      const builder = new XMLBuilderImpl(node)
      if (!predicate.call(thisArg, builder, index++)) {
        return false
      }
      node = this._getNextDescendantNode(this._domNode, node, recursive)
    }
    return true
  }

  /** @inheritdoc */
  some(predicate: ((node: XMLBuilder, index: number) => boolean), self = false,
    recursive = false, thisArg?: any): boolean {
    let node = this._getFirstDescendantNode(this._domNode, self, recursive)
    let index = 0
    while (node) {
      const builder = new XMLBuilderImpl(node)
      if (predicate.call(thisArg, builder, index++)) {
        return true
      }
      node = this._getNextDescendantNode(this._domNode, node, recursive)
    }
    return false
  }

  /** @inheritdoc */
  toArray(self = false, recursive = false): XMLBuilder[] {
    let result: XMLBuilder[] = []
    this.each((node, ) => result.push(node), self, recursive)
    return result
  }

  /** @inheritdoc */
  toString(writerOptions?: WriterOptions): string {
    writerOptions = writerOptions || {}
    if (writerOptions.format === undefined) {
      writerOptions.format = "xml"
    }

    return this._serialize(writerOptions) as string
  }

  /** @inheritdoc */
  toObject(writerOptions?: WriterOptions): XMLSerializedValue {
    writerOptions = writerOptions || {}
    if (writerOptions.format === undefined) {
      writerOptions.format = "object"
    }

    return this._serialize(writerOptions)
  }

  /** @inheritdoc */
  end(writerOptions?: WriterOptions): XMLSerializedValue {
    writerOptions = writerOptions || {}
    if (writerOptions.format === undefined) {
      writerOptions.format = "xml"
    }

    return (this.doc() as XMLBuilderImpl)._serialize(writerOptions)
  }

  /**
   * Gets the next descendant of the given node of the tree rooted at `root`
   * in depth-first pre-order.
   * 
   * @param root - root node of the tree
   * @param self - whether to visit the current node along with child nodes
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   */
  private _getFirstDescendantNode(root: Node, self: boolean, recursive: boolean): Node | null {
    if (self)
      return this._domNode
    else if (recursive)
      return this._getNextDescendantNode(root, root, recursive)
    else
      return this._domNode.firstChild
  }

  /**
   * Gets the next descendant of the given node of the tree rooted at `root`
   * in depth-first pre-order.
   * 
   * @param root - root node of the tree
   * @param node - current node
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   */
  private _getNextDescendantNode(root: Node, node: Node, recursive: boolean): Node | null {
    if (recursive) {
      // traverse child nodes
      if (node.firstChild) return node.firstChild

      if (node === root) return null

      // traverse siblings
      if (node.nextSibling) return node.nextSibling

      // traverse parent's next sibling
      let parent = node.parentNode
      while (parent && parent !== root) {
        if (parent.nextSibling) return parent.nextSibling
        parent = parent.parentNode
      }
    } else {
      if (root === node)
        return node.firstChild
      else
        return node.nextSibling
    }

    return null
  }

  /**
   * Converts the node into its string or object representation.
   * 
   * @param options - serialization options
   */
  private _serialize(writerOptions: WriterOptions): XMLSerializedValue {
    if (writerOptions.format === "xml") {
      const writer = new StringWriterImpl(this._options)
      return writer.serialize(this.node, writerOptions)
    } else if (writerOptions.format === "map") {
      const writer = new MapWriterImpl(this._options)
      return writer.serialize(this.node, writerOptions)
    } else if (writerOptions.format === "object") {
      const writer = new ObjectWriterImpl(this._options)
      return writer.serialize(this.node, writerOptions)
    } else if (writerOptions.format === "json") {
      const writer = new JSONWriterImpl(this._options)
      return writer.serialize(this.node, writerOptions)
    } else {
      throw new Error("Invalid writer format: " + writerOptions.format + ". " + this._debugInfo())
    }
  }

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param name - element name
   * @param attributes - a JS object with element attributes
   * @param text - contents of a text child node
   *  
   * @returns the new element node
   */
  private _node(namespace: string | null | undefined, name: string,
    attributes?: AttributesObject): XMLBuilder {

    name += ""

    const child = (namespace !== null && namespace !== undefined ?
      this._doc.createElementNS(namespace + "", name) :
      this._doc.createElement(name)
    )

    this.node.appendChild(child)
    const builder = new XMLBuilderImpl(child)

    // update doctype node if the new node is the document element node
    const oldDocType = this._doc.doctype
    if (child === this._doc.documentElement && oldDocType !== null) {
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

  /**
   * Creates a dummy element node without adding it to the list of child nodes.
   * 
   * Dummy nodes are special nodes representing a node with a `null` value. 
   * Dummy nodes are created while recursively building the XML tree. Simply
   * skipping `null` values doesn't work because that would break the recursive
   * chain.
   * 
   * @returns the new dummy element node
   */
  private _dummy(): XMLBuilder {
    return new XMLBuilderImpl(this._doc.createElement('dummy_node'))
  }

  /**
   * Extracts a namespace and name from the given string.
   * 
   * @param str - a string containing both a name and namespace separated by an
   * '@' character.
   */
  private _extractNamespace(str: string): [string | undefined, string] {
    const atIndex = str.indexOf("@")
    if (atIndex <= 0) {
      return [undefined, str]
    } else {
      return[str.slice(atIndex + 1), str.slice(0, atIndex)]
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
      if (!docNode) throw new Error("Owner document is null")
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
