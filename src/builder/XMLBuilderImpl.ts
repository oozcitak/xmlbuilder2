import {
  XMLBuilderOptions, XMLBuilder, AttributesObject, ExpandObject,
  WriterOptions, XMLSerializedValue, DTDOptions,
  DefaultBuilderOptions, CastAsNode, PIObject, DocumentWithSettings
} from "./interfaces"
import {
  applyDefaults, isObject, isString, isFunction, isMap, isArray, isEmpty,
  getValue, forEachObject, forEachArray
} from "@oozcitak/util"
import { namespace as infraNamespace } from "@oozcitak/infra"
import {
  StringWriterImpl, MapWriterImpl, ObjectWriterImpl, JSONWriterImpl
} from "../writers"
import { CastAsNodeImpl } from "./CastAsNode"
import { Document, Node } from "@oozcitak/dom/lib/dom/interfaces"
import {
  createParser, isDocumentNode, isDocumentFragmentNode, extractQName
} from "./dom"

/**
 * Represents a wrapper that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export class XMLBuilderImpl implements XMLBuilder {
  private _domNode: Node
  private _castAsNode?: CastAsNode

  /**
   * Initializes a new instance of `XMLBuilderNodeImpl`.
   * 
   * @param domNode - the DOM node to wrap
   */
  constructor (domNode: Node) {
    this._domNode = domNode
  }

  /** @inheritdoc */
  get as(): CastAsNode {
    if (this._castAsNode === undefined) {
      this._castAsNode = new CastAsNodeImpl(this._domNode)
    }
    return this._castAsNode
  }

  /** @inheritdoc */
  set(options: Partial<XMLBuilderOptions>): XMLBuilder {
    this._options = applyDefaults(
      applyDefaults(this._options, options, true), // apply user settings
      DefaultBuilderOptions) // provide defaults
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
      [namespace, name, attributes] = [undefined, p1, p2]
    } else {
      // ele(name: string)
      [namespace, name, attributes] = [undefined, p1, undefined]
    }

    if (attributes) {
      attributes = getValue(attributes)
    }

    if (isFunction(name)) {
      // evaluate if function
      lastChild = this.ele(name.apply(this))
    } else if (isArray(name)) {
      for (const item of forEachArray(name)) {
        lastChild = this.ele(item)
      }
    } else if (isMap(name) || isObject(name)) {
      // expand if object
      for (let [key, val] of forEachObject(name)) {
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
          if (isObject(val) || isMap(val)) {
            // if the key is #text expand child nodes under this node to support mixed content
            lastChild = this.ele(val)
          } else {
            lastChild = this.txt(val)
          }
        } else if (!this._options.ignoreConverters && key.indexOf(this._options.convert.cdata) === 0) {
          // cdata node
          if (isArray(val)) {
            for (const item of forEachArray(val)) {
              lastChild = this.dat(item)
            }
          } else {
            lastChild = this.dat(val)
          }
        } else if (!this._options.ignoreConverters && key.indexOf(this._options.convert.comment) === 0) {
          // comment node
          if (isArray(val)) {
            for (const item of forEachArray(val)) {
              lastChild = this.com(item)
            }
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
        } else if (isArray(val) && isEmpty(val)) {
          // skip empty arrays
          lastChild = this._dummy()
        } else if (isObject(val) && isEmpty(val)) {
          // empty objects produce one node
          lastChild = this.ele(key)
        } else if (!this._options.keepNullNodes && (val === null)) {
          // skip null and undefined nodes
          lastChild = this._dummy()
        } else if (isArray(val)) {
          // expand list by creating child nodes
          for (const item of forEachArray(val)) {
            const childNode: { [key: string]: any } = {}
            childNode[key] = item
            lastChild = this.ele(childNode)
          }
        } else if (isObject(val) || isMap(val)) {
          // check for a namespace declaration attribute
          const qName = extractQName(key)
          for (const [attName, attValue] of forEachObject(val)) {
            if (attName[0] === this._options.convert.att) {
              const attQName = extractQName(attName.slice(1))
              if ((attQName[0] === null && attQName[1] === "xmlns") ||
                (attQName[0] === "xmlns" && attQName[1] === qName[0])) {
                namespace = attValue
              }
            }
          }

          // create a parent node
          lastChild = this._node(namespace, key)

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
      }
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
    parent.as.node.removeChild(this.as.node)
    return parent
  }

  /** @inheritdoc */
  att(p1: AttributesObject | string, p2?: string, p3?: string): XMLBuilder {

    if (isMap(p1) || isObject(p1)) {
      // att(obj: AttributesObject)
      // expand if object
      for (const [attName, attValue] of forEachObject(p1)) {
        this.att(attName, attValue)
      }
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
      [namespace, name, value] = [undefined, p1 as string, p2]
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

    // xmlns defaults to XMLNS namespace
    if ((namespace === null || namespace === undefined) && name === "xmlns") {
      namespace = infraNamespace.XMLNS
    }

    const ele = this.as.element

    // convert to string
    if (namespace !== undefined && namespace !== null) namespace += ""
    name += ""
    value += ""

    // check if this is a namespace declaration attribute
    if (namespace === undefined) {
      const attQName = extractQName(name)
      if (attQName[0] === "xmlns") {
        namespace = infraNamespace.XMLNS
      } else if (attQName[0] !== null) {
        namespace = ele.lookupNamespaceURI(attQName[0])
      } else {
        namespace = ele.lookupNamespaceURI(attQName[0])
      }
    }

    if (namespace !== null && namespace !== undefined && !ele.isDefaultNamespace(namespace)) {
      ele.setAttributeNS(namespace, name, value)
    } else {
      ele.setAttribute(name, value)
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

    if (isArray(p1)) {
      // removeAtt(names: string[])
      for (const attName of forEachArray(p1)) {
        this.removeAtt(attName)
      }
    } else if (isArray(p2)) {
      // removeAtt(namespace: string, names: string[])
      for (const attName of forEachArray(p2)) {
        this.removeAtt(p1 + "", attName)
      }
    } else if (p1 !== undefined && p2 !== undefined) {
      // removeAtt(namespace: string, name: string)
      this.as.element.removeAttributeNS(p1 + "", p2 + "")
    } else {
      // removeAtt(name: string)
      this.as.element.removeAttribute(p1 + "")
    }

    return this
  }

  /** @inheritdoc */
  txt(content: string): XMLBuilder {
    const child = this._doc.createTextNode(content + "")
    this.as.node.appendChild(child)

    return this
  }

  /** @inheritdoc */
  com(content: string): XMLBuilder {
    const child = this._doc.createComment(content + "")
    this.as.node.appendChild(child)

    return this
  }

  /** @inheritdoc */
  dat(content: string): XMLBuilder {
    const child = this._doc.createCDATASection(content + "")
    this.as.node.appendChild(child)

    return this
  }

  /** @inheritdoc */
  ins(target: string | PIObject, content: string = ''): XMLBuilder {

    if (isArray(target)) {
      for (let item of forEachArray(target)) {
        item += ""
        const insIndex = item.indexOf(' ')
        const insTarget = (insIndex === -1 ? item : item.substr(0, insIndex))
        const insValue = (insIndex === -1 ? '' : item.substr(insIndex + 1))
        this.ins(insTarget, insValue)
      }
    } else if (isMap(target) || isObject(target)) {
      for (const [insTarget, insValue] of forEachObject(target)) {
        this.ins(insTarget, insValue)
      }
    } else {
      const child = this._doc.createProcessingInstruction(target + "", content + "")
      this.as.node.appendChild(child)
    }

    return this
  }

  /** @inheritdoc */
  dec(options: { version: "1.0" | "1.1", encoding?: string, standalone?: boolean }): XMLBuilder {
    this._options.version = options.version
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

    const importedNode = node.as.node

    if (isDocumentNode(importedNode)) {
      // import document node
      const elementNode = importedNode.documentElement
      if (elementNode === null) {
        throw new Error("Imported document has no document element node. " + this._debugInfo())
      }
      const clone = hostDoc.importNode(elementNode, true)
      hostNode.appendChild(clone)
    } else if (isDocumentFragmentNode(importedNode)) {
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
  forEachChild(callback: (node: XMLBuilder) => void, thisArg?: any): XMLBuilder {
    this._domNode.childNodes.forEach(
      node => callback.call(thisArg, (new XMLBuilderImpl(node)))
    )
    return this
  }

  /** @inheritdoc */
  forEachAttribute(callback: (node: XMLBuilder) => void, thisArg?: any): XMLBuilder {
    this.as.element.attributes._attributeList.forEach(
      node => callback.call(thisArg, (new XMLBuilderImpl(node)))
    )
    return this
  }

  /** @inheritdoc */
  toString(writerOptions?: WriterOptions): string {
    writerOptions = writerOptions || {}
    if (writerOptions.format === undefined) {
      writerOptions.format = "xml"
    }

    return <string>this._serialize(writerOptions)
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
   * Converts the node into its string or object representation.
   * 
   * @param options - serialization options
   */
  private _serialize(writerOptions: WriterOptions): XMLSerializedValue {
    if (writerOptions.format === "xml") {
      const writer = new StringWriterImpl(this._options)
      return writer.serialize(this.as.node, writerOptions)
    } else if (writerOptions.format === "map") {
      const writer = new MapWriterImpl(this._options)
      return writer.serialize(this.as.node, writerOptions)
    } else if (writerOptions.format === "object") {
      const writer = new ObjectWriterImpl(this._options)
      return writer.serialize(this.as.node, writerOptions)
    } else if (writerOptions.format === "json") {
      const writer = new JSONWriterImpl(this._options)
      return writer.serialize(this.as.node, writerOptions)
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

    // inherit namespace from parent
    if (namespace === null || namespace === undefined) {
      const qName = extractQName(name)
      const parent = this.as.node.parentNode
      if (parent) {
        namespace = parent.lookupNamespaceURI(qName[0])
      }

      // override namespace if there is a namespace declaration
      // attribute
      if (attributes !== undefined) {
        for (let [attName, attValue] of forEachObject(attributes)) {
          if (attName === "xmlns") {
            namespace = attValue
          } else {
            const attQName = extractQName(attName)
            if (attQName[0] === "xmlns" && attQName[1] === qName[0]) {
              namespace = attValue
            }
          }
        }
      }
    }

    const node = this.as.node

    const child = (namespace !== null && namespace !== undefined ?
      this._doc.createElementNS(namespace + "", name) :
      this._doc.createElement(name)
    )

    node.appendChild(child)
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
   * Returns the document owning this node.
   */
  protected get _doc(): Document {
    const node = this.as.node
    if (isDocumentNode(node)) {
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
    const node = this.as.node
    const parentNode = this.as.node.parentNode

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
    const doc = this._doc as unknown as DocumentWithSettings
    /* istanbul ignore next */
    if (doc._xmlBuilderOptions === undefined) {
      throw new Error("Builder options is not set.")
    }
    return doc._xmlBuilderOptions
  }
  protected set _options(value: XMLBuilderOptions) {
    const doc = this._doc as unknown as DocumentWithSettings
    doc._xmlBuilderOptions = value
  }

}
