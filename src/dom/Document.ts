import { Node } from "./Node"
import { Element } from "./Element"
import { DOMImplementation } from "./DOMImplementation"
import { DocType } from "./DocType"
import { DOMException } from "./DOMException"
import { HTMLCollection } from "./HTMLCollection"
import { Utility } from "./Utility"
import { XMLSpec } from "./XMLSpec"
import { DocumentFragment } from "./DocumentFragment"
import { Text } from "./Text"
import { Comment } from "./Comment"
import { ProcessingInstruction } from "./ProcessingInstruction"
import { NodeFilter } from "./NodeFilter"
import { Attr } from "./Attr"

/**
 * Represents a document node.
 */
export class Document extends Node {

  URL: string | undefined
  documentURI: string | undefined
  origin: string | undefined
  compatMode: string | undefined
  characterSet: string | undefined
  charset: string | undefined
  inputEncoding: string | undefined
  contentType: string | undefined

  /**
   * Initializes a new instance of `Document`.
   */
  public constructor() {
    super(null)
  }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): number { return Node.Document }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return '#document' }

  /** 
   * Returns the {@link DOMImplementation} object that is associated 
   * with the document.
   */
  get implementation(): DOMImplementation {
    return new DOMImplementation()
  }

  /** 
   * Returns the {@link DocType} or `null` if there is none.
   */
  get doctype(): DocType | null {
    for (let child of this.childNodes) {
      if (child.nodeType === Node.DocumentType)
        return <DocType>child
    }
    return null
  }

  /** 
   * Returns the document element or `null` if there is none.
   */
  get documentElement(): Element | null {
    for (let child of this.childNodes) {
      if (child.nodeType === Node.Element)
        return <Element>child
    }
    return null
  }

  /**
   * Returns a {@link HTMLCollection} of all descendant elements 
   * whose qualified name is `qualifiedName`.
   * 
   * @param qualifiedName - the qualified name to match or `*` to match all
   * descendant elements.
   * 
   * @returns an {@link HTMLCollection} of matching descendant
   * elements
   */
  getElementsByTagName(qualifiedName: string): HTMLCollection {
    if (this.documentElement)
      return this.documentElement.getElementsByTagName(qualifiedName)
    else
      return new HTMLCollection()
  }

  /**
   * Returns a {@link HTMLCollection} of all descendant elements 
   * whose namespace is `namespace` and local name is `localName`.
   * 
   * @param namespace - the namespace to match or `*` to match any
   * namespace.
   * @param localName - the local name to match or `*` to match any
   * local name.
   * 
   * @returns an {@link HTMLCollection} of matching descendant
   * elements
   */
  getElementsByTagNameNS(namespace: string, localName: string): HTMLCollection {
    if (this.documentElement)
      return this.documentElement.getElementsByTagNameNS(namespace, localName)
    else
      return new HTMLCollection()
  }

  /**
   * Returns a {@link HTMLCollection} of all descendant elements 
   * whose classes are contained in the list of classes given in 
   * `classNames`.
   * 
   * @param classNames - a space-separated list of classes
   * 
   * @returns an {@link HTMLCollection} of matching descendant
   * elements
   */
  getElementsByClassName(classNames: string): HTMLCollection {
    if (this.documentElement)
      return this.documentElement.getElementsByClassName(classNames)
    else
      return new HTMLCollection()
  }

  /**
   * Returns a new {@link Element} with the given `localName`.
   * 
   * @param localName - local name
   * 
   * @returns the new {@link Element}
   */
  createElement(localName: string): Element {
    return new Element(this, '', '', localName)
  }

  /**
   * Returns a new {@link Element} with the given `namespace` and
   * `qualifiedName`.
   * 
   * @param namespace - namespace URL
   * @param qualifiedName - qualified name
   * 
   * @returns the new {@link Element}
   */
  createElementNS(namespace: string | null, qualifiedName: string): Element {
    if (!qualifiedName.match(XMLSpec.Name))
      throw DOMException.InvalidCharacterError
    if (!qualifiedName.match(XMLSpec.QName))
      throw DOMException.NamespaceError

    let parts = qualifiedName.split(':')
    let prefix = (parts.length === 2 ? parts[0] : null)
    let localName = (parts.length === 2 ? parts[1] : qualifiedName)

    if (prefix && !namespace)
      throw DOMException.NamespaceError

    if (prefix === "xml" && namespace !== Node.XML)
      throw DOMException.NamespaceError

    if (namespace !== Node.XMLNS &&
      (prefix === "xmlns" || qualifiedName === "xmlns"))
      throw DOMException.NamespaceError

    if (namespace === Node.XMLNS &&
      (prefix !== "xmlns" || qualifiedName !== "xmlns"))
      throw DOMException.NamespaceError

    return new Element(this, namespace, prefix || '', localName)
  }

  /**
   * Returns a new {@link DocumentFragment}.
   * 
   * @returns the new {@link DocumentFragment}
   */
  createDocumentFragment(): DocumentFragment {
    return new DocumentFragment(this)
  }

  /**
   * Returns a new {@link Text} with the given `data`.
   * 
   * @param data - text content
   * 
   * @returns the new {@link Text}
   */
  createTextNode(data: string): Text {
    return new Text(this, data)
  }

  /**
   * Returns a new {@link Comment} with the given `data`.
   * 
   * @param data - text content
   * 
   * @returns the new {@link Comment}
   */
  createComment(data: string): Comment {
    return new Comment(this, data)
  }

  /**
   * Returns a new {@link ProcessingInstruction} with the given `target`
   * and `data`.
   * 
   * @param target - instruction target
   * @param data - text content
   * 
   * @returns the new {@link ProcessingInstruction}
   */
  createProcessingInstruction(target: string, data: string): ProcessingInstruction {
    if (!target.match(XMLSpec.Name))
      throw DOMException.InvalidCharacterError
    if (!data.includes("?>"))
      throw DOMException.InvalidCharacterError

    return new ProcessingInstruction(this, target, data)
  }

  /**
   * Returns a copy of `node`.
   * 
   * @param deep - true to includes descendant nodes.
   * 
   * @returns the clone
   */
  importNode(node: Node, deep: boolean = false): Node {
    if (node.nodeType === Node.Document)
      throw DOMException.NotSupportedError

    return node.cloneNode(this, deep)
  }

  /**
   * Moves `node` from another document and returns it.
   * 
   * @param node - node to move.
   * 
   * @returns the adopted node
   */
  adoptNode(node: Node): Node {
    if (node.nodeType === Node.Document)
      throw DOMException.NotSupportedError

    let oldDocument = node.ownerDocument

    if (node.parentNode)
      node.parentNode.removeChild(node)

    node.ownerDocument = this
    Utility.forEachDescendant(node,
      (child) => child.ownerDocument = this)

    return node
  }

  /**
   * Returns a new {@link Attr} with the given `localName`.
   * 
   * @param localName - local name
   * 
   * @returns the new {@link Attr}
   */
  createAttribute(localName: string): Attr {
    if (!localName.match(XMLSpec.Name))
      throw DOMException.InvalidCharacterError

    return new Attr(null, null, '', localName, '')
  }

  /**
   * Returns a new {@link Attr} with the given `namespace` and
   * `qualifiedName`.
   * 
   * @param namespace - namespace URL
   * @param qualifiedName - qualified name
   * 
   * @returns the new {@link Attr}
   */
  createAttributeNS(namespace: string, qualifiedName: string): Attr {
    if (!qualifiedName.match(XMLSpec.Name))
      throw DOMException.InvalidCharacterError
    if (!qualifiedName.match(XMLSpec.QName))
      throw DOMException.NamespaceError

    let parts = qualifiedName.split(':')
    let prefix = (parts.length === 2 ? parts[0] : null)
    let localName = (parts.length === 2 ? parts[1] : qualifiedName)

    if (prefix && !namespace)
      throw DOMException.NamespaceError

    if (prefix === "xml" && namespace !== Node.XML)
      throw DOMException.NamespaceError

    if (namespace !== Node.XMLNS &&
      (prefix === "xmlns" || qualifiedName === "xmlns"))
      throw DOMException.NamespaceError

    if (namespace === Node.XMLNS &&
      (prefix !== "xmlns" || qualifiedName !== "xmlns"))
      throw DOMException.NamespaceError

    return new Attr(null, namespace, prefix || '', localName, '')
  }

  /**
   * Creates an event of the type specified.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param type - a string representing the type of event to be created
   */
  createEvent(type: any): never {
    throw DOMException.NotSupportedError
  }

  /**
   * Creates a new Range object.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  createRange(): never {
    throw DOMException.NotSupportedError
  }

  /**
   * Creates a new NodeIterator object.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  createNodeIterator(root: Node, whatToShow: number = NodeFilter.ShowAll,
    filter: NodeFilter | null = null): never {
    throw DOMException.NotSupportedError
  }

  /**
   * Creates a new TreeWalker object.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  createTreeWalker(root: Node, whatToShow: number = NodeFilter.ShowAll,
    filter: NodeFilter | null = null): never {
    throw DOMException.NotSupportedError
  }

  /**
   * Returns a duplicate of this node, i.e., serves as a generic copy 
   * constructor for nodes. The duplicate node has no parent 
   * ({@link parentNode} returns `null`).
   *
   * @param document - new owner document
   * @param deep - if `true`, recursively clone the subtree under the 
   * specified node; if `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(document: Document | boolean | null = null,
    deep: boolean = false): Node {

    if (typeof document === "boolean") {
      deep = document
      document = null
    }

    if (!document)
      document = this.ownerDocument

    let clonedSelf = new Document()
    clonedSelf._parentNode = null
    return clonedSelf
  }

  /**
   * Returns the prefix for a given namespace URI, if present, and 
   * `null` if not.
   * 
   * @param namespace - the namespace to search
   */
  lookupPrefix(namespace: string | null): string | null {
    if (!namespace) return null

    if (this.documentElement)
      return this.documentElement.lookupPrefix(namespace)

    return null
  }

  /**
   * Returns the namespace URI for a given prefix if present, and `null`
   * if not.
   * 
   * @param prefix - the prefix to search
   */
  lookupNamespaceURI(prefix: string | null): string | null {
    if (!prefix) prefix = null

    if (this.documentElement)
      return this.documentElement.lookupNamespaceURI(prefix)

    return null
  }
}