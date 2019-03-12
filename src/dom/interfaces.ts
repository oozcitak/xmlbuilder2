/**
 * Represents a generic XML node.
 */
export interface Node {

  /** 
   * Returns the type of node. 
   */
  readonly nodeType: number

  /** 
   * Returns a string appropriate for the type of node. 
   */
  readonly nodeName: string

  /**
   * Gets the absolute base URL of the node.
   */
  readonly baseURI: string

  /** 
   * Returns whether the node is rooted to a document node. 
   */
  readonly isConnected: boolean

  /** 
   * Returns the parent document. 
   */
  readonly ownerDocument: Document | null

  /**
   * Returns the root node.
   * 
   * @param options - if options has `composed = true` this function
   * returns the node's shadow-including root, otherwise it returns
   * the node's root node.
   */
  getRootNode(options?: { composed: boolean }): Node

  /** 
   * Returns the parent node. 
   */
  readonly parentNode: Node | null

  /** 
   * Returns the parent element. 
   */
  readonly parentElement: Element | null

  /** 
   * Determines whether a node has any children.
   */
  hasChildNodes(): boolean

  /** 
   * Returns a {@link NodeList} of child nodes. 
   */
  readonly childNodes: NodeList

  /** 
   * Returns the first child node. 
   */
  readonly firstChild: Node | null

  /** 
   * Returns the last child node. 
   */
  readonly lastChild: Node | null

  /** 
   * Returns the previous sibling node. 
   */
  readonly previousSibling: Node | null

  /** 
   * Returns the next sibling node. 
   */
  readonly nextSibling: Node | null

  /** 
   * Gets or sets the data associated with a {@link CharacterData} node.
   * For other node types returns `null`. 
   */
  nodeValue: string | null

  /** 
   * Returns the concatenation of data of all the {@link CharacterData}
   * node descendants in tree order. When set, replaces the text 
   * contents of the node with the given value. 
   */
  textContent: string | null

  /**
   * Puts all {@link Text} nodes in the full depth of the sub-tree
   * underneath this node into a "normal" form where only markup 
   * (e.g., tags, comments, processing instructions, CDATA sections,
   * and entity references) separates {@link Text} nodes, i.e., there
   * are no adjacent text nodes.
   */
  normalize(): void

  /**
   * Returns a duplicate of this node, i.e., serves as a generic copy 
   * constructor for nodes. The duplicate node has no parent 
   * ({@link parentNode} returns `null`).
   *
   * @param deep - if `true`, recursively clone the subtree under the 
   * specified node if `false`, clone only the node itself (and its 
   * attributes, if it is an {@link Element}).
   */
  cloneNode(deep?: boolean): Node

  /**
   * Determines if the given node is equal to this one.
   * 
   * @param node - the node to compare with
   */
  isEqualNode(node?: Node): boolean

  /**
   * Determines if the given node is reference equal to this one.
   * 
   * @param node - the node to compare with
   */
  isSameNode(node?: Node): boolean

  /**
   * Returns a bitmask indicating the position of the given `node`
   * relative to this node.
   */
  compareDocumentPosition(node: Node): number

  /**
   * Returns `true` if given node is an inclusive descendant of this
   * node, and `false` otherwise (including when other node is `null`).
   * 
   * @param node - the node to check
   */
  contains(node: Node | null): boolean

  /**
   * Returns the prefix for a given namespace URI, if present, and 
   * `null` if not.
   * 
   * @param namespace - the namespace to search
   */
  lookupPrefix(namespace?: string | null): string | null

  /**
   * Returns the namespace URI for a given prefix if present, and `null`
   * if not.
   * 
   * @param prefix - the prefix to search
   */
  lookupNamespaceURI(prefix?: string | null): string | null

  /**
   * Returns `true` if the namespace is the default namespace on this
   * node or `false` if not.
   * 
   * @param namespace - the namespace to check
   */
  isDefaultNamespace(namespace?: string | null): boolean

  /**
   * Inserts the node `newChild` before the existing child node
   * `refChild`. If `refChild` is `null`, inserts `newChild` at the end
   * of the list of children.
   *
   * If `newChild` is a {@link DocumentFragment} object, all of its 
   * children are inserted, in the same order, before `refChild`.
   *
   * If `newChild` is already in the tree, it is first removed.
   *
   * @param newChild - the node to insert
   * @param refChild - the node before which the new node must be
   *   inserted
   * 
   * @returns the newly inserted child node
   */
  insertBefore(newChild: Node | DocumentFragment,
    refChild: Node | null): Node | null

  /**
   * Adds the node `newChild` to the end of the list of children of this
   * node, and returns it. If `newChild` is already in the tree, it is
   * first removed.
   *
   * If `newChild` is a {@link DocumentFragment} object, the entire 
   * contents of the document fragment are moved into the child list of
   * this node.
   *
   * @param newChild - the node to add
   * 
   * @returns the newly inserted child node
   */
  appendChild(newChild: Node): Node | null

  /**
   * Replaces the child node `oldChild` with `newChild` in the list of 
   * children, and returns the `oldChild` node. If `newChild` is already
   * in the tree, it is first removed.
   *
   * @param newChild - the new node to put in the child list
   * @param oldChild - the node being replaced in the list
   * 
   * @returns the removed child node
   */
  replaceChild(newChild: Node, oldChild: Node): Node

  /**
  * Removes the child node indicated by `oldChild` from the list of
  * children, and returns it.
  *
  * @param oldChild - the node being removed from the list
  * 
  * @returns the removed child node
  */
  removeChild(oldChild: Node): Node

}

/**
 * Represents a generic text node.
 */
export interface CharacterData extends Node,
  NonDocumentTypeChildNode, ChildNode {

  /** 
   * Gets or sets the text data of the node. 
   */
  data: string

  /** 
   * Returns the number of code units in {@link data}.
   */
  readonly length: number

  /**
   * Returns `count` number of characters from node data starting at
   * the given `offset`.
   * 
   * @param offset - the offset at which retrieval starts
   * @param count - the number of characters to return
   */
  substringData(offset: number, count: number): string

  /**
   * Appends the given string to text data of the node.
   * 
   * @param data - the string of text to add to node data
   */
  appendData(data: string): void

  /**
   * Inserts the given string into the text data of the node starting at
   * the given `offset`.
   * 
   * @param offset - the offset at which insertion starts
   * @param data - the string of text to add to node data
   */
  insertData(offset: number, data: string): void

  /**
   * Deletes `count` number of characters from node data starting at
   * the given `offset`.
   * 
   * @param offset - the offset at which removal starts
   * @param count - the number of characters to delete
   */
  deleteData(offset: number, count: number): void

  /**
   * Deletes `count` number of characters from node data starting at
   * the given `offset` and replaces it with the given `data`.
   * 
   * @param offset - the offset at which removal starts
   * @param count - the number of characters to delete
   * @param data - the string of text to add to node data
   */
  replaceData(offset: number, count: number, data: string): void

}

/**
 * Represents a text node.
 */
export interface Text extends CharacterData, Slotable {

  /**
   * Splits data at the given offset and returns the remainder as a text
   * node.
   * 
   * @param offset - the offset at which to split nodes.
   */
  splitText(offset: number): Text

  /** 
   * Returns the combined data of all direct text node siblings.
   */
  readonly wholeText: string

}

/**
 * Represents a collection of elements.
 */
export interface HTMLCollection extends Iterable<Element> {

  /** 
   * Returns the number of elements in the collection.
   */
  readonly length: number

  /** 
   * Returns the element with index `index` from the collection.
   * 
   * @param index - the zero-based index of the element to return
   */
  item(index: number): Element | null

  /** 
   * Returns the first element with ID or name `name` from the
   * collection.
   * 
   * @param name - the name of the element to return
   */
  namedItem(name: string): Element | null

  /**
   * Returns the element with index index from the collection. The 
   * elements are sorted in tree order.
   */
  [index: number]: any

  /*
   * Returns the first element with ID or name name from the 
   * collection.
   */
  [key: string]: any

}


/**
 * Represents a document node.
 */
export interface Document extends Node, NonElementParentNode,
  DocumentOrShadowRoot, ParentNode {

  /** 
   * Returns the {@link DOMImplementation} object that is associated 
   * with the document.
   */
  readonly implementation: DOMImplementation

  /**
   * Returns the document's URL.
   */
  readonly URL: string

  /**
   * Gets or sets the document's URL.
   */
  readonly documentURI: string

  /**
   * Returns sets the document's origin.
   */
  readonly origin: string

  /**
   * Returns whether the document is rendered in Quirks mode or
   * Standards mode.
   */
  readonly compatMode: string

  /**
   * Returns the character set.
   */
  readonly characterSet: string

  /**
   * Gets or sets the character set.
   */
  readonly charset: string

  /**
   * Returns the character set.
   */
  readonly inputEncoding: string

  /**
   * Returns the MIME type of the document.
   */
  readonly contentType: string

  /** 
   * Returns the {@link DocType} or `null` if there is none.
   */
  readonly doctype: DocumentType | null

  /** 
   * Returns the document element or `null` if there is none.
   */
  readonly documentElement: Element | null

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
  getElementsByTagName(qualifiedName: string): HTMLCollection

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
  getElementsByTagNameNS(namespace: string, localName: string): HTMLCollection

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
  getElementsByClassName(classNames: string): HTMLCollection

  /**
   * Returns a new {@link Element} with the given `localName`.
   * 
   * @param localName - local name
   * 
   * @returns the new {@link Element}
   */
  createElement(localName: string, options?: string | { is: string }): Element

  /**
   * Returns a new {@link Element} with the given `namespace` and
   * `qualifiedName`.
   * 
   * @param namespace - namespace URL
   * @param qualifiedName - qualified name
   * 
   * @returns the new {@link Element}
   */
  createElementNS(namespace: string | null, qualifiedName: string,
    options?: string | { is: string }): Element

  /**
   * Returns a new {@link DocumentFragment}.
   * 
   * @returns the new {@link DocumentFragment}
   */
  createDocumentFragment(): DocumentFragment

  /**
   * Returns a new {@link Text} with the given `data`.
   * 
   * @param data - text content
   * 
   * @returns the new {@link Text}
   */
  createTextNode(data: string): Text

  /**
   * Returns a new {@link CDATASection} with the given `data`.
   * 
   * @param data - text content
   * 
   * @returns the new {@link CDATASection}
   */
  createCDATASection(data: string): CDATASection

  /**
   * Returns a new {@link Comment} with the given `data`.
   * 
   * @param data - text content
   * 
   * @returns the new {@link Comment}
   */
  createComment(data: string): Comment

  /**
   * Returns a new {@link ProcessingInstruction} with the given `target`
   * and `data`.
   * 
   * @param target - instruction target
   * @param data - text content
   * 
   * @returns the new {@link ProcessingInstruction}
   */
  createProcessingInstruction(target: string, data: string): ProcessingInstruction

  /**
   * Returns a copy of `node`.
   * 
   * @param deep - true to include descendant nodes.
   * 
   * @returns clone of node
   */
  importNode(node: Node, deep?: boolean): Node

  /**
   * Moves `node` from another document into this document and returns
   * it.
   * 
   * @param node - node to move.
   * 
   * @returns the adopted node
   */
  adoptNode(node: Node): Node

  /**
   * Returns a new {@link Attr} with the given `localName`.
   * 
   * @param localName - local name
   * 
   * @returns the new {@link Attr}
   */
  createAttribute(localName: string): Attr

  /**
   * Returns a new {@link Attr} with the given `namespace` and
   * `qualifiedName`.
   * 
   * @param namespace - namespace URL
   * @param qualifiedName - qualified name
   * 
   * @returns the new {@link Attr}
   */
  createAttributeNS(namespace: string | null, qualifiedName: string): Attr

  /**
   * Creates an event of the type specified.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param eventInterface - a string representing the type of event 
   * to be created
   */
  createEvent(eventInterface: string): never

  /**
   * Creates a new Range object.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  createRange(): never

  /**
   * Creates a new NodeIterator object.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  createNodeIterator(root: Node, whatToShow?: number,
    filter?: NodeFilter | null): never

  /**
   * Creates a new TreeWalker object.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  createTreeWalker(root: Node, whatToShow?: number,
    filter?: NodeFilter | null): never

}

/**
 * Represents an XML document.
 */
export interface XMLDocument extends Document {

}

/**
 * Represents a document fragment in the XML tree.
 */
export interface DocumentFragment extends Node, NonElementParentNode,
  ParentNode {

}

/**
 * Represents a shadow root.
 */
export interface ShadowRoot extends DocumentFragment, DocumentOrShadowRoot {

  /** 
   * Gets the shadow root's mode.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  readonly mode: string

  /** 
   * Gets the shadow root's host.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  readonly host: Element

}

/**
 * Represents an element node.
 */
export interface Element extends Node, ParentNode,
  NonDocumentTypeChildNode, ChildNode, Slotable {

  /** 
   * Gets the namespace URI.
   */
  readonly namespaceURI: string | null

  /** 
   * Gets the namespace prefix.
   */
  readonly prefix: string | null

  /** 
   * Gets the local name.
   */
  readonly localName: string

  /** 
   * If namespace prefix is not `null`, returns the concatenation of
   * namespace prefix, `":"`, and local name. Otherwise it returns the
   * local name.
   */
  readonly tagName: string

  /** 
   * Gets or sets the identifier of this element.
   */
  id: string

  /** 
   * Gets or sets the interface Iname of this element.
   */
  className: string

  /** 
   * Returns a {@link DOMTokenList} with tokens from the class 
   * attribute.
   */
  readonly classList: DOMTokenList

  /** 
   * Gets or sets the slot attribute of this element.
   */
  slot: string

  /**
   * Determines if the element node contains any attributes.
   */
  hasAttributes(): boolean

  /** 
   * Returns a {@link NamedNodeMap} of attributes.
   */
  readonly attributes: NamedNodeMap

  /**
   * Returns the list of all attribute's qualified names.
   */
  getAttributeNames(): string[]

  /**
   * Returns the value of the attribute with the given `qualifiedName`.
   * 
   * @param qualifiedName - qualified name to search for
   */
  getAttribute(qualifiedName: string): string | null

  /**
   * Returns the value of the attribute with the given `namespace` and 
   * `qualifiedName`.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  getAttributeNS(namespace: string | null, localName: string): string | null

  /**
   * Sets the value of the attribute with the given `qualifiedName`.
   * 
   * @param qualifiedName - qualified name to search for
   * @param value - attribute value to set
   */
  setAttribute(qualifiedName: string, value: string): void

  /**
   * Sets the value of the attribute with the given `namespace` and 
   * `qualifiedName`.
   * 
   * @param namespace - namespace to search for
   * @param qualifiedName - qualified name to search for
   * @param value - attribute value to set
   */
  setAttributeNS(namespace: string | null, qualifiedName: string,
    value: string): void

  /**
   * Removes the attribute with the given `qualifiedName`.
   * 
   * @param qualifiedName - qualified name to search for
   */
  removeAttribute(qualifiedName: string): void

  /**
   * Removes the attribute with the given `namespace` and 
   * `qualifiedName`.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  removeAttributeNS(namespace: string | null, localName: string): void

  /**
   * Determines whether the attribute with the given `qualifiedName`
   * exists.
   * 
   * @param qualifiedName - qualified name to search for
   */
  hasAttribute(qualifiedName: string): boolean

  /**
   * Determines whether the attribute with the given `namespace` and 
   * `qualifiedName` exists.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  hasAttributeNS(namespace: string | null, localName: string): boolean

  /**
   * Returns the attribute with the given `qualifiedName`.
   * 
   * @param qualifiedName - qualified name to search for
   */
  getAttributeNode(qualifiedName: string): Attr | null

  /**
   * Returns the attribute with the given `namespace` and 
   * `qualifiedName`.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  getAttributeNodeNS(namespace: string | null,
    localName: string): Attr | null

  /**
   * Sets the attribute given with `attr`.
   * 
   * @param attr - attribute to set
   */
  setAttributeNode(attr: Attr): Attr | null

  /**
   * Sets the attribute given with `attr`.
   * 
   * @param attr - attribute to set
   */
  setAttributeNodeNS(attr: Attr): Attr | null

  /**
   * Removes the given attribute.
   * 
   * @param attr - attribute to remove
   */
  removeAttributeNode(attr: Attr): Attr

  /**
   * Creates a shadow root for element and returns it.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param init - A ShadowRootInit dictionary.
   */
  attachShadow(init: { mode: string }): ShadowRoot

  /**
   * Returns element's shadow root, if any, and if shadow root's mode
   * is "open", and null otherwise.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   */
  readonly shadowRoot: ShadowRoot | null

  /**
   * Returns the first (starting at element) inclusive ancestor that
   * matches selectors, and `null` otherwise.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param selectors 
   */
  closest(selectors: string): Element | null

  /**
   * Returns `true` if matching selectors against element's root yields 
   * element, and `false` otherwise.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param selectors 
   */
  matches(selectors: string): boolean

  /**
   * Returns a {@link HTMLCollection} of all descendant elements 
   * whose qualified name is `qualifiedName`.
   * 
   * @param qualifiedName - the qualified name to match or `*` to match
   * all descendant elements.
   * 
   * @returns an {@link HTMLCollection} of matching descendant
   * elements
   */
  getElementsByTagName(qualifiedName: string): HTMLCollection

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
  getElementsByTagNameNS(namespace: string | null,
    localName: string): HTMLCollection

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
  getElementsByClassName(classNames: string): HTMLCollection

  /**
   * Inserts a given element node at a given position relative to this
   * node.
   * 
   * @param where - a string defining where to insert the element node.
   *   - `beforebegin` before this element itself.
   *   - `afterbegin` before the first child.
   *   - `beforeend` after the last child.
   *   - `afterend` after this element itself.
   * @param element - the element to insert
   * 
   * @returns the inserted element
   */
  insertAdjacentElement(where: string, element: Element): Element | null

  /**
   * Inserts a given text node at a given position relative to this
   * node.
   * 
   * @param where - a string defining where to insert the element node.
   *   - `beforebegin` before this element itself.
   *   - `afterbegin` before the first child.
   *   - `beforeend` after the last child.
   *   - `afterend` after this element itself.
   * @param data - text node data 
   * 
   * @returns the inserted element
   */
  insertAdjacentText(where: string, data: string): void

}

/**
 * Represents an object providing methods which are not dependent on 
 * any particular document
 */
export interface DocumentType extends Node, ChildNode {

  /**
   * Returns the name of the node.
   */
  readonly name: string

  /**
   * Returns the `PUBLIC` identifier of the node.
   */
  readonly publicId: string

  /**
   * Returns the `SYSTEM` identifier of the node.
   */
  readonly systemId: string

}

/**
 * Represents a mixin that extends non-element parent nodes. This mixin
 * is implemented by {@link Document} and {@link DocumentFragment}.
 */
export interface NonElementParentNode {

  /**
   * Returns an {@link Element}  who has an id attribute `elementId`.
   * 
   * @param id - the value of the `id` attribute to match
   */
  getElementById(id: string): Element | null,

}

/**
 * Represents a mixin for an interface to be used to share APIs between
 * documents and shadow roots. This mixin is implemented by
 * {@link Document} and {@link ShadowRoot}.
 */
export interface DocumentOrShadowRoot {

}

/**
 * Represents a mixin that extends parent nodes that can have children.
 * This mixin is implemented by {@link Element}, {@link Document} and
 * {@link DocumentFragment}.
 */
export interface ParentNode {

  /**
   * Returns the child elements.
   */
  readonly children: HTMLCollection

  /**
   * Returns the first child that is an element, and `null` otherwise.
   */
  readonly firstElementChild: Element | null

  /**
   * Returns the last child that is an element, and `null` otherwise.
   */
  readonly lastElementChild: Element | null

  /**
   * Returns the number of children that are elements.
   */
  readonly childElementCount: number

  /**
   * Prepends the list of nodes or strings before the first child node.
   * Strings are converted into {@link Text} nodes.
   * 
   * @param nodes - the array of nodes or strings
   */
  prepend(...nodes: Array<Node | string>): void

  /**
   * Appends the list of nodes or strings after the last child node.
   * Strings are converted into {@link Text} nodes.
   * 
   * @param nodes - the array of nodes or strings
   */
  append(...nodes: Array<Node | string>): void

  /**
   * Returns the first element that is a descendant of node that
   * matches selectors.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param selectors - a selectors string
   */
  querySelector(selectors: string): Element | null

  /**
   * Returns all element descendants of node that match selectors.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param selectors - a selectors string
   */
  querySelectorAll(selectors: string): NodeList

}

/**
 * Represents a mixin that extends child nodes that can have siblings
 * including doctypes. This mixin is implemented by {@link Element},
 * {@link CharacterData} and {@link DocumentType}.
 */
export interface ChildNode {

  /**
   * Inserts nodes just before this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  before(...nodes: Array<Node | string>): void

  /**
   * Inserts nodes just after this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  after(...nodes: Array<Node | string>): void

  /**
   * Replaces nodes with this node, while replacing strings in
   * nodes with equivalent text nodes.
   */
  replaceWith(...nodes: Array<Node | string>): void

  /**
   * Removes this node form its tree.
   */
  remove(): void

}

/**
 * Represents a mixin that allows nodes to become the contents of
 * a <slot> element. This mixin is implemented by {@link Element} and
 * {@link Text}.
 */
export interface Slotable {

  /**
   * Returns the <slot> element which this node is inserted in.
   * 
   * This method is not supported by this module.
   */
  readonly assignedSlot: any
}

/**
 * Represents an attribute of an element node.
 */
export interface Attr extends Node {

  /** 
   * Gets the namespace URI.
   */
  readonly namespaceURI: string | null

  /** 
   * Gets the namespace prefix.
   */
  readonly prefix: string | null

  /** 
   * Gets the local name.
   */
  readonly localName: string

  /** 
   * If namespace prefix is not `null`, returns the concatenation of
   * namespace prefix, `":"`, and local name. Otherwise it returns the
   * local name.
   */
  readonly name: string

  /** 
   * Gets or sets the attribute value.
   */
  value: string

  /** 
   * Gets the owner element node.
   */
  readonly ownerElement: Element | null

  /** 
   * Useless always returns true 
   */
  readonly specified: boolean

}

/**
 * Represents a CDATA node.
 */
export interface CDATASection extends Text {

}

/**
 * Represents a comment node.
 */
export interface Comment extends CharacterData {

}

/**
 * Represents an object providing methods which are not dependent on 
 * any particular document
 */
export interface DOMImplementation {

  createDocumentType(qualifiedName: string,
    publicId: string, systemId: string): DocumentType

  /**
   * Creates and returns an {@link XMLDocument}.
   * 
   * @param namespace - the namespace of the document element
   * @param qualifiedName - the qualified name of the document element
   * @param doctype - a {@link DocType} to assign to this document
   */
  createDocument(namespace: string | null, qualifiedName: string,
    doctype: DocumentType | null): XMLDocument

  /**
   * Creates and returns a HTML document.
   * 
   * @param title - document title
   */
  createHTMLDocument(title?: string): Document

  /**
   * Obsolete, always returns true.
   */
  hasFeature(): boolean

}

/**
 * Represents a token set.
 */
export interface DOMTokenList extends Iterable<string> {

  /**
   * Returns the number of tokens.
   */
  readonly length: number

  /**
   * Returns the token at the given index.
   * 
   * @param index - the index to of the token
   */
  item(index: number): string | null

  /**
   * Returns true if the set contains the given token.
   * 
   * @param tokens - the token to check
   */
  contains(token: string): boolean

  /**
   * Adds the given tokens to the set.
   * 
   * @param tokens - the list of tokens to add
   */
  add(...tokens: Array<string>): void

  /**
   * Removes the given tokens from the set.
   * 
   * @param tokens - the list of tokens to remove
   */
  remove(...tokens: Array<string>): void

  /**
   * Removes a given token from the set and returns `false` if it exists,
   * otherwise adds the token and returns `true`.
   * 
   * @param token - the token to toggle
   * @param force - if `false` the token will only be removed but not
   * added again otherwise if `true` the token will only be added but
   * not removed again.
   * 
   * @returns `false` if the token is not in the list after the call, 
   * or `true` if the token is in the list after the call.
   */
  toggle(token: string, force?: boolean | undefined): boolean

  /**
   * Replaces the given token with a new token.
   * 
   * @param token - the token to replace
   * @param newToken - the new token
   * 
   * @returns `true` if `token` was replaced with `newToken`,
   * and `false` otherwise.
   */
  replace(token: string, newToken: string): boolean

  /**
   * Determines if a given token is in the associated attribute's
   * supported tokens
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param token - the token to check
   */
  supports(token: string): boolean

  /**
   * Gets the value of the token list as a string, or sets the token
   * list to the given value.
   */
  value: string

}

/**
 * Represents a collection of nodes.
 */
export interface NamedNodeMap extends Iterable<Attr> {

  /** 
   * Returns the number of attribute in the collection.
   */
  readonly length: number

  /** 
   * Returns the attribute with index `index` from the collection.
   * 
   * @param index - the zero-based index of the attribute to return
   */
  item(index: number): Attr | null

  /**
   * Returns the attribute with the given `qualifiedName`.
   * 
   * @param qualifiedName - qualified name to search for
   */
  getNamedItem(qualifiedName: string): Attr | null

  /**
   * Returns the attribute with the given `namespace` and 
   * `qualifiedName`.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  getNamedItemNS(namespace: string | null, localName: string): Attr | null

  /**
   * Sets the attribute given with `attr`.
   * 
   * @param attr - attribute to set
   */
  setNamedItem(attr: Attr): Attr | null

  /**
   * Sets the attribute given with `attr`.
   * 
   * @param attr - attribute to set
   */
  setNamedItemNS(attr: Attr): Attr | null

  /**
   * Removes the attribute with the given `qualifiedName`.
   * 
   * @param qualifiedName - qualified name to search for
   */
  removeNamedItem(qualifiedName: string): Attr

  /**
   * Removes the attribute with the given `namespace` and 
   * `qualifiedName`.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  removeNamedItemNS(namespace: string | null, localName: string): Attr

}

/**
 * Represents a node filter.
 */
export interface NodeFilter {

  /** 
   * Callback function.
   */
  acceptNode(node: Node): number
}

/**
 * Represents an ordered list of nodes.
 */
export interface NodeList extends Iterable<Node> {

  /**
   * Returns the number of nodes in the list.
   */
  readonly length: number

  /** 
   * Returns the node with index `index` from the collection.
   * 
   * @param index - the zero-based index of the node to return
   */
  item(index: number): Node | null

  /**
   * Returns an iterator for node indices.
   */
  keys(): IterableIterator<number>

  /**
   * Returns an iterator for nodes.
   */
  values(): IterableIterator<Node>

  /**
   * Returns an iterator for indices and nodes.
   */
  entries(): IterableIterator<[number, Node]>

  /**
   * Returns an iterator for the node list.
   */
  [Symbol.iterator](): IterableIterator<Node>

  /**
   * Calls the callback function for each node in the list. The callback
   * receives arguments as follows:
   *   - the current node
   *   - index of the current node
   *   - the node list object
   * 
   * @param callback - function to execute for each node 
   * @param thisArg - value to use as `this` when executing callback 
   */
  forEach(callback: (node: Node, index: number, list: NodeList) => any,
    thisArg: any): void

}

/**
 * Represents a mixin that extends child nodes that can have siblings
 * other than doctypes. This mixin is implemented by {@link Element} and
 * {@link CharacterData}.
 */
export interface NonDocumentTypeChildNode {

  /**
   * Returns the previous sibling that is an element node.
   */
  readonly previousElementSibling: Element | null

  /**
   * Returns the next sibling that is an element node.
   */
  readonly nextElementSibling: Element | null
}

/**
 * Represents a processing instruction node.
 */
export interface ProcessingInstruction extends CharacterData {

  /** 
   * Gets the target of the node.
   */
  readonly target: string

}

/**
 * Defines the type of a node object.
 */
export enum NodeType {
  Element = 1,
  Attribute = 2,
  Text = 3,
  CData = 4,
  EntityReference = 5, // historical
  Entity = 6, // historical
  ProcessingInstruction = 7,
  Comment = 8,
  Document = 9,
  DocumentType = 10,
  DocumentFragment = 11,
  Notation = 12 // historical
}

/**
 * Defines the position of a node in the document relative to another
 * node.
 */
export enum Position {
  Disconnected = 0x01,
  Preceding = 0x02,
  Following = 0x04,
  Contains = 0x08,
  ContainedBy = 0x10,
  ImplementationSpecific = 0x20
}

/**
 * Defines the return value of a filter callback.
 */
export enum FilterResult {
  Accept = 1,
  Reject = 2,
  Skip = 3
}

/**
 * Defines what to show in node filter.
 */
export enum WhatToShow {
  All = 0xffffffff,
  Element = 0x1,
  Attribute = 0x2,
  Text = 0x4,
  CDataSection = 0x8,
  EntityReference = 0x10,
  Entity = 0x20,
  ProcessingInstruction = 0x40,
  Comment = 0x80,
  Document = 0x100,
  DocumentType = 0x200,
  DocumentFragment = 0x400,
  Notation = 0x800
}

/**
 * Defines the mode of a shadow root.
 */
export enum ShadowRootMode {
  Open = "open",
  Closed = "closed"
}