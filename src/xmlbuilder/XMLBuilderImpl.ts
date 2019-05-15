import { Node, Document, Element, NodeType } from "../dom/interfaces"
import { XMLBuilderOptions, XMLBuilder } from "./interfaces"

/**
 * Represents a mixin that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export class XMLBuilderImpl implements XMLBuilder {

  private _options: XMLBuilderOptions = { version: "1.0" }

  /** @inheritdoc */
  get options(): XMLBuilderOptions {
    return (<any>this._asBuilder(this._doc))._options
  }
  set options(value: XMLBuilderOptions) {
    (<any>this._asBuilder(this._doc))._options = value
  }

  /** @inheritdoc */
  element(name: string): XMLBuilder

  /** @inheritdoc */
  element(namespace: string, qualifiedName?: string): XMLBuilder {
    const node = this._asNode
    const child = (qualifiedName ?
      this._doc.createElementNS(namespace, qualifiedName) :
      this._doc.createElement(namespace)
    )
    node.appendChild(child)

    return this._asBuilder(child)
  }

  /** @inheritdoc */
  attribute(name: string, value: string): XMLBuilder

  /** @inheritdoc */
  attribute(namespace: string, qualifiedName: string, value?: string): XMLBuilder {
    const ele = this._asElement

    if (value) {
      ele.setAttributeNS(namespace, qualifiedName, value)
    } else {
      ele.setAttribute(namespace, qualifiedName)
    }

    return this
  }

  /** @inheritdoc */
  text(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createTextNode(content)
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  comment(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createComment(content)
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  cdata(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createCDATASection(content)
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  instruction(target: string, content?: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createProcessingInstruction(target, content || '')
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  raw(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createTextNode(content)
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  document(): XMLBuilder {
    return this._asBuilder(this._doc)
  }

  /** @inheritdoc */
  root(): XMLBuilder {
    const ele = this._doc.documentElement
    if (!ele) {
      throw new Error("Document root element is null. " + this._debugInfo)
    }
    return this._asBuilder(ele)
  }

  /** @inheritdoc */
  up(): XMLBuilder {
    const parent = this._asNode.parentNode
    if (!parent) {
      throw new Error("Parent node is null. " + this._debugInfo)
    }
    return this._asBuilder(parent)
  }

  /** @inheritdoc */
  prev(): XMLBuilder {
    const node = this._asNode.previousSibling
    if (!node) {
      throw new Error("Previous sibling node is null. " + this._debugInfo)
    }
    return this._asBuilder(node)
  }

  /** @inheritdoc */
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