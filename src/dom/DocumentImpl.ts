import {
  DOMImplementation, DocumentType, Element, Text,
  NodeFilter, NodeType, Node, HTMLCollection, DocumentFragment,
  NodeList, WhatToShow, Attr, ProcessingInstruction, Comment,
  CDATASection, NodeIterator, TreeWalker, FilterResult, Range, Event,
  EventTarget
} from './interfaces'
import { NodeImpl } from './NodeImpl'
import { DOMException } from './DOMException'
import { CDATASectionImpl } from './CDATASectionImpl'
import { TextImpl } from './TextImpl'
import { AttrImpl } from './AttrImpl'
import { ProcessingInstructionImpl } from './ProcessingInstructionImpl'
import { CommentImpl } from './CommentImpl'
import { DocumentFragmentImpl } from './DocumentFragmentImpl'
import { HTMLCollectionImpl } from './HTMLCollectionImpl'
import { ElementImpl } from './ElementImpl'
import { Namespace, XMLSpec } from './spec'
import { OrderedSet } from './util/OrderedSet'
import { TreeQuery } from './util/TreeQuery'
import { TreeMutation } from './util/TreeMutation'
import { NodeIteratorImpl } from './NodeIteratorImpl'
import { TreeWalkerImpl } from './TreeWalkerImpl'
import { RangeImpl } from './RangeImpl'
import { DocumentInternal, NodeInternal } from './interfacesInternal'
import { Guard } from './util/Guard'

/**
 * Represents a document node.
 */
export class DocumentImpl extends NodeImpl implements DocumentInternal {

  _encoding: string = "UTF-8"
  _contentType: string = 'application/xml'
  _URL: string = 'about:blank'
  _origin: string = ''
  _type: "xml" | "html" = "xml"
  _mode: string = "no-quirks"
  _compatMode: string = 'CSS1Compat'

  _rangeList: Range[] = []

  /**
   * Initializes a new instance of `Document`.
   */
  public constructor() {
    super(null)

    this._nodeDocument = this
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
  get characterSet(): string { return this._encoding }

  /**
   * Returns the MIME type of the document.
   */
  get contentType(): string { return this._contentType }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): NodeType { return NodeType.Document }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return '#document' }

  /** 
   * Returns the {@link DOMImplementation} object that is associated 
   * with the document.
   */
  get implementation(): DOMImplementation {
    return require('./DOMImplementationImpl').Instance
  }

  /**
   * Gets or sets the document's URL.
   */
  get documentURI(): string { return this._URL }

  /**
   * Gets or sets the character set.
   */
  get charset(): string { return this._encoding }

  /**
   * Returns the character set.
   */
  get inputEncoding(): string { return this._encoding }

  /** 
   * Returns the {@link DocType} or `null` if there is none.
   */
  get doctype(): DocumentType | null {
    for (const child of this.childNodes) {
      if (child.nodeType === NodeType.DocumentType)
        return <DocumentType>child
    }
    return null
  }

  /** 
   * Returns the document element or `null` if there is none.
   */
  get documentElement(): Element | null {
    for (const child of this.childNodes) {
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
    const arr = OrderedSet.parse(classNames)
    return new HTMLCollectionImpl(this, function (ele: Element) {
      const classes = ele.classList
      let allClassesFound = true
      for (const className of arr) {
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
    if (!localName.match(XMLSpec.Name))
      throw DOMException.InvalidCharacterError

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
    const names = Namespace.extractNames(namespace, qualifiedName)

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
      throw DOMException.InvalidCharacterError
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
    if (!target.match(XMLSpec.Name))
      throw DOMException.InvalidCharacterError
    if (data.includes("?>"))
      throw DOMException.InvalidCharacterError

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
      throw DOMException.NotSupportedError

    if (Guard.isShadowRoot(node))
      throw DOMException.NotSupportedError

    const clonedNode = node.cloneNode(deep)

    for (const child of TreeQuery.getDescendantNodes(clonedNode, true, false)) {
      (<NodeImpl>child)._nodeDocument = this
      if (child.nodeType === NodeType.Element) {
        for (const attr of (<ElementImpl>child).attributes) {
          (<AttrImpl>attr)._nodeDocument = this
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
      throw DOMException.NotSupportedError

    if (Guard.isShadowRoot(node))
      throw DOMException.HierarchyRequestError

    TreeMutation.adoptNode(node as NodeInternal, this)

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
    const names = Namespace.extractNames(namespace, qualifiedName)

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
    throw DOMException.NotSupportedError
  }

  /**
   * Creates a new Range object.
   */
  createRange(): Range {
    const range = new RangeImpl([this, 0], [this, 0])
    this._rangeList.push(range)
    return range
  }

  /**
   * Creates and returns a new `NodeIterator` object.
   * 
   * @param root - the node to which the iterator is attached.
   * @param whatToShow - a filter on node type.
   * @param filter - a user defined filter.
   */
  createNodeIterator(root: Node, whatToShow: WhatToShow = WhatToShow.All,
    filter: NodeFilter | ((node: Node) => FilterResult) | null = null): NodeIterator {
    return new NodeIteratorImpl(root, whatToShow, filter)
  }

  /**
   * Creates and returns a new `TreeWalker` object.
   * 
   * @param root - the node to which the iterator is attached.
   * @param whatToShow - a filter on node type.
   * @param filter - a user defined filter.
   */
  createTreeWalker(root: Node, whatToShow: WhatToShow = WhatToShow.All,
    filter: NodeFilter | ((node: Node) => FilterResult) | null = null): TreeWalker {
    return new TreeWalkerImpl(root, whatToShow, filter)
  }

  /**
   * Returns a duplicate of this node, i.e., serves as a generic copy 
   * constructor for nodes. The duplicate node has no parent 
   * ({@link parentNode} returns `null`).
   *
   * @param deep - if `true`, recursively clone the subtree under the 
   * specified node. If `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(deep: boolean = false): Node {
    const clonedSelf = new DocumentImpl()

    // clone child nodes
    if (deep) {
      for (const child of this.childNodes) {
        const clonedChild = child.cloneNode(deep)
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

  /**
   * Gets the parent event target for the given event.
   * 
   * @param event - an event
   */
  _getTheParent(event: Event): EventTarget | null {
    if (event.type === "load") {
      return null
    } else {
      // TODO: return the document's relevant global object 
      return null
    }
  }

  // MIXIN: NonElementParentNode
  /* istanbul ignore next */
  getElementById(elementId: string): Element | null { throw new Error("Mixin: NonElementParentNode not implemented.") }

  // MIXIN: DocumentOrShadowRoot
  // No elements

  // MIXIN: ParentNode
  /* istanbul ignore next */
  get children(): HTMLCollection { throw new Error("Mixin: ParentNode not implemented.") }
  /* istanbul ignore next */
  get firstElementChild(): Element | null { throw new Error("Mixin: ParentNode not implemented.") }
  /* istanbul ignore next */
  get lastElementChild(): Element | null { throw new Error("Mixin: ParentNode not implemented.") }
  /* istanbul ignore next */
  get childElementCount(): number { throw new Error("Mixin: ParentNode not implemented.") }
  /* istanbul ignore next */
  prepend(...nodes: (Node | string)[]): void { throw new Error("Mixin: ParentNode not implemented.") }
  /* istanbul ignore next */
  append(...nodes: (Node | string)[]): void { throw new Error("Mixin: ParentNode not implemented.") }
  /* istanbul ignore next */
  querySelector(selectors: string): Element | null { throw new Error("Mixin: ParentNode not implemented.") }
  /* istanbul ignore next */
  querySelectorAll(selectors: string): NodeList { throw new Error("Mixin: ParentNode not implemented.") }

}
