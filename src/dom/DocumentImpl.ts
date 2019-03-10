import { Document, DOMImplementation, DocumentType, Element, Text,
  NodeFilter, NodeType, Node, HTMLCollection, DocumentFragment,
  NodeList, WhatToShow, Attr, ProcessingInstruction, Comment, 
  CDATASection } from './interfaces';
import { NodeImpl } from './NodeImpl';
import { DOMExceptionImpl } from './DOMExceptionImpl'
import { CDATASectionImpl } from './CDATASectionImpl'
import { TextImpl } from './TextImpl'
import { AttrImpl } from './AttrImpl'
import { ProcessingInstructionImpl } from './ProcessingInstructionImpl'
import { CommentImpl } from './CommentImpl'
import { DocumentFragmentImpl } from './DocumentFragmentImpl'
import { HTMLCollectionImpl } from './HTMLCollectionImpl'
import { Utility } from './Utility'
import { ElementImpl } from './ElementImpl';

/**
 * Represents a document node.
 */
export class DocumentImpl extends NodeImpl implements Document {

  _URL: string = 'about:blank'
  _origin: string = ''
  _compatMode: string = 'CSS1Compat'
  _characterSet: string = 'UTF-8'
  _contentType: string = 'application/xml'

  /**
   * Initializes a new instance of `Document`.
   */
  public constructor() {
    super(null)
  }

  /**
   * Returns the document's URL.
   */
  get URL(): string { return this._URL }

  /**
   * Returns sets the document's origin.
   */
  get origin(): string { return this._origin }

  /**
   * Returns whether the document is rendered in Quirks mode or
   * Standards mode.
   */
  get compatMode(): string { return this._compatMode }

  /**
   * Returns the character set.
   */
  get characterSet(): string { return this._characterSet }

  /**
   * Returns the MIME type of the document.
   */
  get contentType(): string { return this._contentType }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): number { return NodeType.Document }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return '#document' }

  /** 
   * Returns the {@link DOMImplementation} object that is associated 
   * with the document.
   */
  get implementation(): DOMImplementation {
    const DOMImplementationImpl = require('./DOMImplementationImpl')
    return DOMImplementationImpl.Instance
  }

  /**
   * Gets or sets the document's URL.
   */
  get documentURI(): string { return this.URL }

  /**
   * Gets or sets the character set.
   */
  get charset(): string { return this.characterSet }

  /**
   * Returns the character set.
   */
  get inputEncoding(): string { return this.characterSet }

  /** 
   * Returns the {@link DocType} or `null` if there is none.
   */
  get doctype(): DocumentType | null {
    for (let child of this.childNodes) {
      if (child.nodeType === NodeType.DocumentType)
        return <DocumentType>child
    }
    return null
  }

  /** 
   * Returns the document element or `null` if there is none.
   */
  get documentElement(): Element | null {
    for (let child of this.childNodes) {
      if (child.nodeType === NodeType.Element)
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
    return new HTMLCollectionImpl(this, function (ele: Element) {
      return (qualifiedName === '*' || ele.tagName === qualifiedName)
    })
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
    return new HTMLCollectionImpl(this, function (ele: Element) {
      return ((localName === '*' || ele.localName === localName) &&
        (namespace === '*' || ele.namespaceURI === namespace))
    })
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
    let arr = Utility.OrderedSet.parse(classNames)
    return new HTMLCollectionImpl(this, function (ele: Element) {
      let classes = ele.classList
      let allClassesFound = true
      for (let className of arr) {
        if (!classes.contains(className)) {
          allClassesFound = false
          break
        }
      }
      return allClassesFound
    })
  }

  /**
   * Returns a new {@link Element} with the given `localName`.
   * 
   * @param localName - local name
   * 
   * @returns the new {@link Element}
   */
  createElement(localName: string): Element {
    if (!localName.match(Utility.XMLSpec.Name))
      throw DOMExceptionImpl.InvalidCharacterError

    return new ElementImpl(this, localName, null, null)
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
    let names = Utility.Namespace.extractNames(namespace, qualifiedName)

    return new ElementImpl(this, names.localName, names.namespace,
      names.prefix)
  }

  /**
   * Returns a new {@link DocumentFragment}.
   * 
   * @returns the new {@link DocumentFragment}
   */
  createDocumentFragment(): DocumentFragment {
    return new DocumentFragmentImpl(this)
  }

  /**
   * Returns a new {@link Text} with the given `data`.
   * 
   * @param data - text content
   * 
   * @returns the new {@link Text}
   */
  createTextNode(data: string): Text {
    return new TextImpl(this, data)
  }

  /**
   * Returns a new {@link CDATASection} with the given `data`.
   * 
   * @param data - text content
   * 
   * @returns the new {@link CDATASection}
   */
  createCDATASection(data: string): CDATASection {
    if (data.includes(']]>'))
      throw DOMExceptionImpl.InvalidCharacterError
    return new CDATASectionImpl(this, data)
  }

  /**
   * Returns a new {@link Comment} with the given `data`.
   * 
   * @param data - text content
   * 
   * @returns the new {@link Comment}
   */
  createComment(data: string): Comment {
    return new CommentImpl(this, data)
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
    if (!target.match(Utility.XMLSpec.Name))
      throw DOMExceptionImpl.InvalidCharacterError
    if (data.includes("?>"))
      throw DOMExceptionImpl.InvalidCharacterError

    return new ProcessingInstructionImpl(this, target, data)
  }

  /**
   * Returns a copy of `node`.
   * 
   * @param deep - true to include descendant nodes.
   * 
   * @returns clone of node
   */
  importNode(node: Node, deep: boolean = false): Node {
    if (node.nodeType === NodeType.Document)
      throw DOMExceptionImpl.NotSupportedError

    if ((<any>node).host) // ShadowRoot
      throw DOMExceptionImpl.NotSupportedError

    const clonedNode = node.cloneNode(deep)

    for(const child of Utility.Tree.getDescendants<NodeImpl>(clonedNode, true, false)) {
      child._ownerDocument = this
      if (child.nodeType === NodeType.Element) {
        const ele = <ElementImpl>child
        for(const attr of ele.attributes) {
          (<AttrImpl>attr)._ownerDocument = this
        }
      }
    }

    return clonedNode
  }

  /**
   * Moves `node` from another document into this document and returns
   * it.
   * 
   * @param node - node to move.
   * 
   * @returns the adopted node
   */
  adoptNode(node: Node): Node {
    if (node.nodeType === NodeType.Document)
      throw DOMExceptionImpl.NotSupportedError

    if ((<any>node).host) // ShadowRoot
      throw DOMExceptionImpl.HierarchyRequestError

    Utility.Tree.Mutation.adoptNode(node, this)

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
    if (!localName.match(Utility.XMLSpec.Name))
      throw DOMExceptionImpl.InvalidCharacterError

    return new AttrImpl(this, null, localName, null, null, '')
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
    let names = Utility.Namespace.extractNames(namespace, qualifiedName)

    return new AttrImpl(this, null, names.localName, names.namespace,
      names.prefix, '')
  }

  /**
   * Creates an event of the type specified.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param eventInterface - a string representing the type of event 
   * to be created
   */
  createEvent(eventInterface: string): never {
    throw DOMExceptionImpl.NotSupportedError
  }

  /**
   * Creates a new Range object.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  createRange(): never {
    throw DOMExceptionImpl.NotSupportedError
  }

  /**
   * Creates a new NodeIterator object.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  createNodeIterator(root: Node, whatToShow: number = WhatToShow.All,
    filter: NodeFilter | null = null): never {
    throw DOMExceptionImpl.NotSupportedError
  }

  /**
   * Creates a new TreeWalker object.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  createTreeWalker(root: Node, whatToShow: number = WhatToShow.All,
    filter: NodeFilter | null = null): never {
    throw DOMExceptionImpl.NotSupportedError
  }

  /**
   * Returns a duplicate of this node, i.e., serves as a generic copy 
   * constructor for nodes. The duplicate node has no parent 
   * ({@link parentNode} returns `null`).
   *
   * @param deep - if `true`, recursively clone the subtree under the 
   * specified node; if `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(deep: boolean = false): Node {
    let clonedSelf = new DocumentImpl()

    // clone child nodes
    if (deep) {
      for (let child of this.childNodes) {
        let clonedChild = child.cloneNode(deep)
        clonedSelf.appendChild(clonedChild)
      }
    }
    
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

  // MIXIN: NonElementParentNode
  getElementById(elementId: string): Element | null { throw new Error("Mixin: NonElementParentNode not implemented.") }
  
  // MIXIN: DocumentOrShadowRoot
  // No elements

  // MIXIN: ParentNode
  get children(): HTMLCollection { throw new Error("Mixin: ParentNode not implemented.") }
  set children(value: HTMLCollection) { }
  get firstElementChild(): Element | null { throw new Error("Mixin: ParentNode not implemented.") }
  set firstElementChild(value: Element | null) { }
  get lastElementChild(): Element | null { throw new Error("Mixin: ParentNode not implemented.") }
  set lastElementChild(value: Element | null) { }
  get childElementCount(): number { throw new Error("Mixin: ParentNode not implemented.") }
  set childElementCount(value: number) { }
  prepend(nodes: [Node | string]): void { throw new Error("Mixin: ParentNode not implemented.") }
  append(nodes: [Node | string]): void { throw new Error("Mixin: ParentNode not implemented.") }
  querySelector(selectors: string): Element | null { throw new Error("Mixin: ParentNode not implemented.") }
  querySelectorAll(selectors: string): NodeList { throw new Error("Mixin: ParentNode not implemented.") }

}
