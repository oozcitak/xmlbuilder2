import { DOMImplementationInstance } from '../dom'
import { Node, Document, Element, NodeType } from "../dom/interfaces"
import { XMLBuilderOptions } from "./interfaces"

/**
 * Represents a mixin that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export class XMLBuilder {

  private static _domImpl = DOMImplementationInstance

  private _options: XMLBuilderOptions = { version: "1.0" }
 
  /**
   * Initializes a new instance of `XMLBuilder`.
   * 
   * @param options - builder options
   */
  constructor(options?: XMLBuilderOptions) {
    this._options = options || { version: "1.0" }
  }

  /**
   * Configures options for XML builder. Call this function without
   * arguments to reset the options to their defaults.
   * 
   * @param options - builder options
   * 
   * @returns builder with the given options applied
   */
  withOptions(options?: XMLBuilderOptions): XMLBuilder {
    this._options = options || { version: "1.0" }
    return this
  }

  /**
   * Creates a new XML document.
   * 
   * @param name - the qualified name of the document element
   * @param namespace - the namespace of the document element
   * 
   * @returns root element node
   */
  create(name?: string, namespace?: string): XMLBuilder {
    const doc = XMLBuilder._domImpl.createDocument('', '')
    const builder = this._asBuilder(doc)
    builder.withOptions(this._options)
    
    if (name) {
      return builder.element(name)
    } else {
      return builder
    }
  }

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param name - element name
   * 
   * @returns the new element node
   */
  element(name: string): XMLBuilder

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param namespace - element namespace
   * @param qualifiedName - qualified name
   * 
   * @returns the new element node
   */
  element(namespace: string, qualifiedName?: string): XMLBuilder {
    const node = this._asNode
    const child = (qualifiedName ? 
      this._doc.createElementNS(namespace, qualifiedName) :
      this._doc.createElement(namespace)
    )
    node.appendChild(child)

    const builder = this._asBuilder(child)
    return builder.withOptions(this._options)
  }

  /**
   * Creates or updates an element attribute.
   * 
   * @param name - attribute name
   * @param value - attribute value
   * 
   * @returns current element node
   */
  attribute(name: string, value: string): XMLBuilder
  
  /**
   * Creates or updates an element attribute.
   * 
   * @param namespace - attribute namespace
   * @param qualifiedName - qualified name
   * @param value - attribute value
   * 
   * @returns current element node
   */
  attribute(namespace: string, qualifiedName: string, value?: string): XMLBuilder {
    const ele = this._asElement

    if (value) {
      ele.setAttributeNS(namespace, qualifiedName, value)
    } else {
      ele.setAttribute(namespace, qualifiedName)
    }

    return this
  }

  /**
   * Creates a new text node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  text(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createTextNode(content)
    ele.appendChild(child)

    return this
  }

  /**
   * Creates a new comment node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  comment(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createComment(content)
    ele.appendChild(child)

    return this
  }

  /**
   * Creates a new CDATA node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  cdata(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createCDATASection(content)
    ele.appendChild(child)
    
    return this
  }

  /**
   * Creates a new processing instruction node and appends it to the list of 
   * child nodes.
   * 
   * @param target - instruction target
   * @param content - node content
   * 
   * @returns current element node
   */
  instruction(target:string, content?: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createProcessingInstruction(target, content || '')
    ele.appendChild(child)
    
    return this
  }

  /**
   * Creates a new raw text node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  raw(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createTextNode(content)
    ele.appendChild(child)
    
    return this
  }

  /**
   * Returns the document node.
   */
  document(): XMLBuilder {
    return this._asBuilder(this._doc)
  }

  /**
   * Returns the root element node.
   */
  root(): XMLBuilder {
    const ele = this._doc.documentElement
    if (!ele) {
      throw new Error("Document root element is null. " + this._debugInfo)
    }
    return this._asBuilder(ele)
  }

  /**
   * Returns the parent node.
   */
  up(): XMLBuilder {
    const parent = this._asNode.parentNode
    if (!parent) {
      throw new Error("Parent node is null. " + this._debugInfo)
    }
    return this._asBuilder(parent)
  }

  /**
   * Returns the previous sibling node.
   */
  prev(): XMLBuilder {
    const node = this._asNode.previousSibling
    if (!node) {
      throw new Error("Previous sibling node is null. " + this._debugInfo)
    }
    return this._asBuilder(node)
  }

  /**
   * Returns the next sibling node.
   */
  next(): XMLBuilder {
    const node = this._asNode.nextSibling
    if (!node) {
      throw new Error("Next sibling node is null. " + this._debugInfo)
    }
    return this._asBuilder(node)
  }

  /**
   * Returns the document owning this node.
   */
  private get _doc(): Document {
    const node = this._asNode
    const doc = node.ownerDocument
    if (!doc) {
      throw new Error("Document is null. " + this._debugInfo)
    }
    return doc
  }

  /**
   * Returns the underlying node.
   */
  private get _asNode(): Node {
    const node = <Node><unknown>this

    if (!node.nodeType) {
      throw new Error("This function can only be applied to a node.")
    }

    return node
  }

  /**
   * Returns the underlying element node.
   */
  private get _asElement(): Element {
    const ele = <Element><unknown>this

    if (!ele.nodeType || ele.nodeType != NodeType.Element) {
      throw new Error("This function can only be applied to an element node.")
    }

    return ele
  }

  /**
   * Returns the underlying document node.
   */
  private get _asDocument(): Document {
    const doc = <Document><unknown>this

    if (!doc.nodeType || doc.nodeType != NodeType.Document) {
      throw new Error("This function can only be applied to a document node.")
    }

    return doc
  }

  /**
   * Converts a node to an xml builder.
   */
  private _asBuilder(node: Node): XMLBuilder {
    return <XMLBuilder><unknown>node
  }

  /**
   * Returns debug information for this node.
   */
  private get _debugInfo(): string {
    return ''
  }
}