import { Node, Document, Element, NodeType } from "../dom/interfaces"
import {
  XMLBuilderOptions, XMLBuilderNode, AttributesObject, ExpandObject,
  WriterOptions, XMLSerializedValue, Validator, DTDOptions,
  XMLBuilderOptionsAsParams, DefaultBuilderOptions
} from "./interfaces"
import {
  isArray, isFunction, isObject, isEmpty, getValue, isString, applyDefaults,
  forEachArray, forEachObject, isMap, getObjectValue, removeObjectValue
} from "../util"
import { Namespace } from "../dom/spec"
import { StringWriterImpl, MapWriterImpl, ObjectWriterImpl } from "./writers"

/**
 * Represents a mixin that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export class XMLBuilderNodeImpl implements XMLBuilderNode {

  private _isRawNode: boolean = false

  /** @inheritdoc */
  set(options: XMLBuilderOptionsAsParams): XMLBuilderNode {
    this._options = applyDefaults(
      applyDefaults(this._options, options, true), // apply user settings
      DefaultBuilderOptions) // provide defaults
    return this
  }

  /** @inheritdoc */
  ele(p1: string | ExpandObject, p2?: AttributesObject | string,
    p3?: AttributesObject): XMLBuilderNode {

    let namespace: string | undefined
    let name: string | ExpandObject | undefined
    let attributes: AttributesObject | undefined

    if(isObject(p1)) {
      // ele(obj: ExpandObject)
      [namespace, name, attributes] = [undefined, p1, undefined]
    } else if(isString(p1) && isString(p2)) {
      // ele(namespace: string, name: string, attributes?: AttributesObject)
      [namespace, name, attributes] = [p1, p2, p3]
    } else if(isString(p1) && isObject(p2)) {
      // ele(name: string, attributes: AttributesObject)
      [namespace, name, attributes] = [undefined, p1, p2]
    } else if(isString(p1)) {
      // ele(name: string)
      [namespace, name, attributes] = [undefined, p1, undefined]
    }

    if (attributes) {
      attributes = getValue(attributes)
    }

    let lastChild: XMLBuilderNode | null = null

    if (isFunction(name)) {
      // evaluate if function
      lastChild = this.ele(name.apply(this))
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
          lastChild = this.dat(val)
        } else if (!this._options.ignoreConverters && key.indexOf(this._options.convert.comment) === 0) {
          // comment node
          lastChild = this.com(val)
        } else if (!this._options.ignoreConverters && key.indexOf(this._options.convert.raw) === 0) {
          // raw text node
          lastChild = this.raw(val)
        } else if (!this._options.ignoreConverters && key.indexOf(this._options.convert.ins) === 0) {
          // processing instruction
          const insIndex = val.indexOf(' ')
          const insTarget = (insIndex === -1 ? val : val.substr(0, insIndex))
          const insValue = (insIndex === -1 ? '' : val.substr(insIndex + 1))
          lastChild = this.ins(insTarget, insValue)
        } else if (Array.isArray(val) && isEmpty(val)) {
          // skip empty arrays
          lastChild = this._dummy()
        } else if (isObject(val) && isEmpty(val)) {
          // empty objects produce one node
          lastChild = this.ele(key)
        } else if (!this._options.keepNullNodes && (val === null)) {
          // skip null and undefined nodes
          lastChild = this._dummy()
        } else if (Array.isArray(val)) {
          // expand list by creating child nodes
          for (const item of forEachArray(val)) {
            const childNode: { [key: string]: any } = {}
            childNode[key] = item
            lastChild = this.ele(childNode)
          }
        } else if (isObject(val) || isMap(val)) {
          // check for a namespace declaration attribute
          const qName = Namespace.extractQName(key)
          for(const [attName, attValue] of forEachObject(val)) {
            if (attName[0] === this._options.convert.att) {
              const attQName = Namespace.extractQName(attName.slice(1))
              if ((attQName.prefix === null && attQName.localName === "xmlns") ||
               (attQName.prefix === "xmlns" && attQName.localName === qName.prefix)) {
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
    } else if (isString(name)) {
      // element node
      lastChild = this._node(namespace, name, attributes)
    }

    if (lastChild === null) {
      throw new Error("Could not create any elements with: " + (name || '').toString() + ". " + this._debugInfo())
    }

    return lastChild

  }

  /** @inheritdoc */
  remove(): XMLBuilderNode {
    const parent = this.up()
    this._asAny._remove()
    return parent
  }

  /** @inheritdoc */
  att(namespace: AttributesObject | string, name?: string | (() => string),
    value?: string | (() => string)): XMLBuilderNode {

    if (isMap(namespace) || isObject(namespace)) {
      if (name !== undefined) {
        throw new Error("Unexpected argument (expecting a single object argument). " + this._debugInfo())
      }

      // expand if object
      for (const [attName, attValue] of forEachObject(namespace)) {
        this.att(attName, attValue)
      }
    } else {
      if (name === undefined) {
        throw new Error("Attribute name and value not specified. " + this._debugInfo())
      }

      let attNamespace: string | null = null
      let attName: string
      let attValue: string
      if (isFunction(name)) {
        name = name.apply(this)
      }
      if (isFunction(value)) {
        value = value.apply(this)
      }

      if (value === undefined) {
        [attNamespace, attName, attValue] = [null, namespace, name]
      } else {
        [attNamespace, attName, attValue] = [namespace, name, value]
      }

      if (this._options.keepNullAttributes && (attValue === null)) {
        attValue = ""
      }

      if (attValue !== null) {
        const ele = this._asElement

        attName = getValue(attName)
        attValue = getValue(attValue)

        // character validation
        attName = this._validate.name(attName, this._debugInfo())
        attValue = this._validate.attValue(attValue, this._debugInfo())

        const attQName = Namespace.extractQName(attName)
        if (attQName.prefix === "xmlns") {
          // prefixed namespace declaration attribute
          ele.setAttributeNS(Namespace.XMLNS, attName, attValue)
        } else {
          if (attNamespace === null && this._options.inheritNS) {
            attNamespace = ele.lookupNamespaceURI(attQName.prefix)
          }
          if (attNamespace !== null && !ele.isDefaultNamespace(attNamespace)) {
            ele.setAttributeNS(this._validate.namespace(attNamespace, this._debugInfo()), attName, attValue)
          } else {
            ele.setAttribute(attName, attValue)
          }
        }
      }
    }

    return this
  }

  /** @inheritdoc */
  removeAtt(namespace: string | string[], name?: string | string[]): XMLBuilderNode {
    if (name === undefined) {
      [namespace, name] = ["", namespace]
    }

    if (isArray(namespace)) {
      throw new TypeError("namespace parameter must be a string" + this._debugInfo())
    }

    if (isArray(name)) {
      for (const attName of name) {
        this.removeAtt(namespace, attName)
      }
    } else {
      if (namespace) {
        this._asElement.removeAttributeNS(namespace, name)
      } else {
        this._asElement.removeAttribute(name)
      }
    }

    return this
  }

  /** @inheritdoc */
  txt(content: string): XMLBuilderNode {
    // character validation
    content = this._validate.text(content, this._debugInfo())

    const child = this._doc.createTextNode(content)
    this._asElement.appendChild(child)

    return this
  }

  /** @inheritdoc */
  com(content: string): XMLBuilderNode {
    // character validation
    content = this._validate.comment(content, this._debugInfo())

    const child = this._doc.createComment(content)
    this._asElement.appendChild(child)

    return this
  }

  /** @inheritdoc */
  raw(content: string): XMLBuilderNode {
    // character validation
    content = this._validate.raw(content, this._debugInfo())

    const child = this._doc.createTextNode(content)
    const builder = (<XMLBuilderNodeImpl><unknown>child)
    builder._isRawNode = true
    this._asElement.appendChild(child)

    return this
  }

  /** @inheritdoc */
  dat(content: string): XMLBuilderNode {
    // character validation
    content = this._validate.cdata(content, this._debugInfo())

    const child = this._doc.createCDATASection(content)
    this._asElement.appendChild(child)

    return this
  }

  /** @inheritdoc */
  ins(target: string, content: string = ''): XMLBuilderNode {
    // character validation
    target = this._validate.insTarget(target, this._debugInfo())
    content = this._validate.insValue(content, this._debugInfo())

    const child = this._doc.createProcessingInstruction(target, content)
    this._asElement.appendChild(child)

    return this
  }

  /** @inheritdoc */
  dec(options: { version: "1.0" | "1.1", encoding?: string, standalone?: boolean }): XMLBuilderNode {
    this._options.version = options.version
    this._options.encoding = options.encoding
    this._options.standalone = options.standalone

    return this
  }

  /** @inheritdoc */
  dtd(options?: DTDOptions): XMLBuilderNode {
    // character validation
    const pubID = this._validate.pubID((options && options.pubID) || '', this._debugInfo())
    const sysID = this._validate.sysID((options && options.sysID) || '', this._debugInfo())

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
  import(node: XMLBuilderNode): XMLBuilderNode {
    const hostNode = this._asNode
    const hostDoc = hostNode.ownerDocument
    if (hostDoc === null) {
      throw new Error("Owner document is null. " + this._debugInfo())
    }

    const importedNode = (<XMLBuilderNodeImpl>node)._asNode

    if (importedNode.nodeType === NodeType.Document) {
      // import document node
      const elementNode = (<Document>importedNode).documentElement
      if (elementNode === null) {
        throw new Error("Imported document has no document node. " + this._debugInfo())
      }
      const clone = hostDoc.importNode(elementNode, true)
      hostNode.appendChild(clone)
    } else if (importedNode.nodeType === NodeType.DocumentFragment) {
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
  doc(): XMLBuilderNode {
    return XMLBuilderNodeImpl._FromNode(this._doc)
  }

  /** @inheritdoc */
  root(): XMLBuilderNode {
    const ele = this._doc.documentElement
    if (!ele) {
      throw new Error("Document root element is null. " + this._debugInfo())
    }
    return XMLBuilderNodeImpl._FromNode(ele)
  }

  /** @inheritdoc */
  up(): XMLBuilderNode {
    const parent = this._asNode.parentNode
    if (!parent) {
      throw new Error("Parent node is null. " + this._debugInfo())
    }
    return XMLBuilderNodeImpl._FromNode(parent)
  }

  /** @inheritdoc */
  prev(): XMLBuilderNode {
    const node = this._asNode.previousSibling
    if (!node) {
      throw new Error("Previous sibling node is null. " + this._debugInfo())
    }
    return XMLBuilderNodeImpl._FromNode(node)
  }

  /** @inheritdoc */
  next(): XMLBuilderNode {
    const node = this._asNode.nextSibling
    if (!node) {
      throw new Error("Next sibling node is null. " + this._debugInfo())
    }
    return XMLBuilderNodeImpl._FromNode(node)
  }

  /** @inheritdoc */
  first(): XMLBuilderNode {
    const node = this._asNode.firstChild
    if (!node) {
      throw new Error("First child node is null. " + this._debugInfo())
    }
    return XMLBuilderNodeImpl._FromNode(node)
  }

  /** @inheritdoc */
  last(): XMLBuilderNode {
    const node = this._asNode.lastChild
    if (!node) {
      throw new Error("Last child node is null. " + this._debugInfo())
    }
    return XMLBuilderNodeImpl._FromNode(node)
  }

  /** @inheritdoc */
  toString(writerOptions?: WriterOptions): string {
    writerOptions = writerOptions || {}
    if (writerOptions.format === undefined) {
      writerOptions.format = "text"
    }

    return <string>this._serialize(writerOptions)
  }

  /** @inheritdoc */
  toObject(writerOptions?: WriterOptions): XMLSerializedValue {
    writerOptions = writerOptions || {}
    if (writerOptions.format === undefined) {
      writerOptions.format = "map"
    }

    return this._serialize(writerOptions)
  }

  /** @inheritdoc */
  end(writerOptions?: WriterOptions): XMLSerializedValue {
    writerOptions = writerOptions || {}
    if (writerOptions.format === undefined) {
      writerOptions.format = "text"
    }

    return (<XMLBuilderNodeImpl>this.doc())._serialize(writerOptions)
  }

  /**
   * Converts the node into its string or object representation.
   * 
   * @param options - serialization options
   */
  private _serialize(writerOptions: WriterOptions): XMLSerializedValue {
    if (writerOptions.format === "text") {
      const writer = new StringWriterImpl(this._options)
      return writer.serialize(this._asNode, writerOptions)
    } else if (writerOptions.format === "map") {
      const writer = new MapWriterImpl(this._options)
      return writer.serialize(this._asNode, writerOptions)
    } else if (writerOptions.format === "object") {
      const writer = new ObjectWriterImpl(this._options)
      return writer.serialize(this._asNode, writerOptions)
    } else {
      return ''
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
    attributes?: AttributesObject): XMLBuilderNode {

    // inherit namespace from parent
    if (namespace === null || namespace === undefined) {
      const qName = Namespace.extractQName(name)
      if (this._options.inheritNS) {
        const parent = this._asNode.parentNode
        if (parent) {
          namespace = parent.lookupNamespaceURI(qName.prefix)
        }
      }

      // override namespace if there is a namespace declaration
      // attribute
      if (attributes !== undefined) {
        for (let [attName, attValue] of forEachObject(attributes)) {
          if (attName === "xmlns") {
            namespace = attValue
          } else {
            const attQName = Namespace.extractQName(attName)
            if (attQName.prefix === "xmlns" && attQName.localName === qName.prefix) {
              namespace = attValue
            }
          }
        }    
      }
    }

    const node = this._asNode

    // character validation
    this._validate.name(name, this._debugInfo())

    const child = (namespace !== null && namespace !== undefined ?
      this._doc.createElementNS(namespace, name) :
      this._doc.createElement(name)
    )

    node.appendChild(child)
    const builder = XMLBuilderNodeImpl._FromNode(child)

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
  private _dummy(): XMLBuilderNode {
    const child = this._doc.createElement('dummy_node')
    return XMLBuilderNodeImpl._FromNode(child)
  }

  /**
   * Returns the document owning this node.
   */
  protected get _doc(): Document {
    const node = this._asNode
    const doc = node.ownerDocument
    if (!doc) {
      throw new Error("Document is null. " + this._debugInfo())
    }
    return doc
  }

  /**
   * Cast to `any` to call methods without a TypeScript interface definition.
   */
  protected get _asAny(): any {
    return <any>this
  }

  /**
   * Returns the underlying DOM node.
   */
  protected get _asNode(): Node {
    const node = <Node><unknown>this

    if (!node.nodeType) {
      throw new Error("This function can only be applied to a node." + this._debugInfo())
    }

    return node
  }

  /**
   * Returns the underlying element node.
   */
  protected get _asElement(): Element {
    const ele = <Element><unknown>this

    if (!ele.nodeType || ele.nodeType !== NodeType.Element) {
      throw new Error("This function can only be applied to an element node." + this._debugInfo())
    }

    return ele
  }

  /**
   * Returns the underlying document node.
   */
  protected get _asDocument(): Document {
    const doc = <Document><unknown>this

    if (!doc.nodeType || doc.nodeType !== NodeType.Document) {
      throw new Error("This function can only be applied to a document node." + this._debugInfo())
    }

    return doc
  }

  /**
   * Converts a DOM node to an `XMLBuilder`.
   */
  protected static _FromNode(node: Node): XMLBuilderNode {
    return <XMLBuilderNode><unknown>node
  }

  /**
   * Returns debug information for this node.
   * 
   * @param name - node name
   */
  protected _debugInfo(name?: string): string {
    const node = this._asNode
    const parentNode = this._asNode.parentNode

    name = name || node.nodeName
    const parentName = parentNode ? parentNode.nodeName : ''

    if (!name && !parentName) {
      return ""
    } else if (!name) {
      return "parent: <" + parentName + ">"
    } else if (!parentName) {
      return "node: <" + name + ">"
    } else {
      return "node: <" + name + ">, parent: <" + parentName + ">"
    }
  }

  /**
   * Gets or sets builder options.
   */
  protected get _options(): XMLBuilderOptions {
    return (<any><unknown>this.doc())._builderOptions
  }
  protected set _options(value: XMLBuilderOptions) {
    (<any><unknown>this.doc())._builderOptions = value
  }

  /**
   * Gets or sets validator functions.
   */
  protected get _validate(): Validator {
    return (<any><unknown>this.doc())._validator
  }
  protected set _validate(value: Validator) {
    (<any><unknown>this.doc())._validator = value
  }

}
