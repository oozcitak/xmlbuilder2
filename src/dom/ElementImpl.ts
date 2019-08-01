import {
  Attr, NamedNodeMap, DOMTokenList, Document, ShadowRoot, NodeType, Node, 
  Element, HTMLCollection, NodeList, ShadowRootMode
} from './interfaces'
import { HTMLSpec } from './spec'
import { TextImpl } from './TextImpl'
import { NodeImpl } from './NodeImpl'
import { AttrImpl } from './AttrImpl'
import { HTMLCollectionImpl } from './HTMLCollectionImpl'
import { NamedNodeMapImpl } from './NamedNodeMapImpl'
import { DOMTokenListImpl } from './DOMTokenListImpl'
import { DOMException } from './DOMException'
import { Namespace } from './spec/Namespace'
import { OrderedSet } from './util/OrderedSet'
import { TreeMutation } from './util/TreeMutation'
import { ShadowRootImpl } from './ShadowRootImpl'
import { ElementInternal, AttrInternal } from './interfacesInternal'
import { HTMLSlotElement } from '../htmldom/interfaces'

/**
 * Represents an element node.
 */
export class ElementImpl extends NodeImpl implements ElementInternal {

  _namespace: string | null
  _namespacePrefix: string | null
  _localName: string
  _shadowRoot: ShadowRoot | null = null
  _attributeList: NamedNodeMap = new NamedNodeMapImpl(this)

  _customElementState: "undefined" | "failed" | "uncustomized" | "custom" = "undefined"
  _customElementDefinition  = ElementImpl
  _is: string = ""

  _uniqueIdentifier?: string | undefined;


  /**
   * Initializes a new instance of `Element`.
   *
   * @param ownerDocument - the owner document
   * @param localName - the local name of the element
   * @param namespaceURI - the namespace URI
   * @param prefix - the namespace prefix
   */
  public constructor(ownerDocument: Document | null,
    localName: string, namespaceURI: string | null, prefix: string | null = null) {
    super(ownerDocument)

    this._localName = localName
    this._namespace = namespaceURI
    this._namespacePrefix = prefix || null
  }

  /** 
   * Returns the type of node. 
   */
  get nodeType(): NodeType { return NodeType.Element }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return this._qualifiedName }

  /** 
   * Gets the namespace URI.
   */
  get namespaceURI(): string | null { return this._namespace }

  /** 
   * Gets the namespace prefix.
   */
  get prefix(): string | null { return this._namespacePrefix }

  /** 
   * Gets the local name.
   */
  get localName(): string { return this._localName }

  /** 
   * Gets the qualified name.
   */
  get tagName(): string { return this._qualifiedName }

  /** 
   * Gets or sets the identifier of this element.
   */
  get id(): string { return this.getAttribute('id') || '' }
  set id(value: string) { this.setAttribute('id', value) }

  /** 
   * Gets or sets the class name of this element.
   */
  get className(): string { return this.getAttribute('class') || '' }
  set className(value: string) { this.setAttribute('class', value) }

  /** 
   * Returns a {@link DOMTokenList} with tokens from the class attribute.
   */
  get classList(): DOMTokenList { return new DOMTokenListImpl(this, 'class') }

  /** 
   * Gets or sets the slot attribute of this element.
   */
  get slot(): string { return this.getAttribute('slot') || '' }
  set slot(value: string) { this.setAttribute('slot', value) }

  /** 
   * Returns a {@link NamedNodeMap} of attributes.
   */
  get attributes(): NamedNodeMap { return this._attributeList }

  /**
   * Determines if the element node contains any attributes.
   */
  hasAttributes(): boolean { return (this.attributes.length !== 0) }

  /**
   * Returns the list of all attribute's qualified names.
   */
  getAttributeNames(): string[] {
    const names: string[] = []

    for (const att of this.attributes) {
      names.push(att.name)
    }

    return names
  }

  /**
   * Returns the value of the attribute with the given `name`.
   * 
   * @param name - qualified name to search for
   */
  getAttribute(name: string): string | null {
    const att = this.attributes.getNamedItem(name)
    return (att ? att.value : null)
  }

  /**
   * Returns the value of the attribute with the given `namespace` and 
   * `localName`.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  getAttributeNS(namespace: string, localName: string): string | null {
    const att = this.attributes.getNamedItemNS(namespace, localName)
    return (att ? att.value : null)
  }

  /**
   * Sets the value of the attribute with the given `name`.
   * 
   * @param name - qualified name to search for
   * @param value - attribute value to set
   */
  setAttribute(name: string, value: string): void {
    let attr = this.attributes.getNamedItem(name)

    if (attr) {
      attr.value = value
    } else {
      attr = new AttrImpl(this._nodeDocument, this, name,
        null, null, value)
      this.attributes.setNamedItem(attr)
    }
  }
  /**
   * Sets the value of the attribute with the given `namespace` and 
   * `qualifiedName`.
   * 
   * @param namespace - namespace to search for
   * @param qualifiedName - qualified name to search for
   * @param value - attribute value to set
   */
  setAttributeNS(namespace: string, qualifiedName: string, value: string): void {
    const names = Namespace.extractNames(namespace, qualifiedName)
    let attr = this.attributes.getNamedItemNS(namespace, names.localName)

    if (attr) {
      attr.value = value
    } else {
      attr = new AttrImpl(this._nodeDocument, this, names.localName,
        namespace, names.prefix, value)
      this.attributes.setNamedItemNS(attr)
    }
  }

  /**
   * Removes the attribute with the given `name`.
   * 
   * @param name - qualified name to search for
   */
  removeAttribute(name: string): void {
    try {
      this.attributes.removeNamedItem(name)
    } catch (e) {
      // ignore NotFoundError thrown by
      // NamedNodeMap.removeNamedItem()
    }
  }

  /**
   * Removes the attribute with the given `namespace` and `localName`.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  removeAttributeNS(namespace: string, localName: string): void {
    try {
      this.attributes.removeNamedItemNS(namespace, localName)
    } catch (e) {
      // ignore NotFoundError thrown by
      // NamedNodeMap.removeNamedItem()
    }
  }

  /**
   * Determines whether the attribute with the given `name` exists.
   * 
   * @param name - qualified name to search for
   */
  hasAttribute(name: string): boolean {
    for (const att of this.attributes) {
      if (att.name === name)
        return true
    }

    return false
  }

  /**
   * Determines whether the attribute with the given `namespace` and 
   * `localName` exists.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  hasAttributeNS(namespace: string, localName: string): boolean {
    for (const att of this.attributes) {
      if (att.namespaceURI === namespace && att.localName === localName)
        return true
    }

    return false
  }

  /**
   * Returns the attribute with the given `name`.
   * 
   * @param name - qualified name to search for
   */
  getAttributeNode(name: string): Attr | null {
    return this.attributes.getNamedItem(name)
  }

  /**
   * Returns the attribute with the given `namespace` and 
   * `localName`.
   * 
   * @param namespace - namespace to search for
   * @param localName - local name to search for
   */
  getAttributeNodeNS(namespace: string, localName: string): Attr | null {
    return this.attributes.getNamedItemNS(namespace, localName)
  }

  /**
   * Sets the attribute given with `attr`.
   * 
   * @param attr - attribute to set
   */
  setAttributeNode(attr: Attr): Attr | null {
    const attrImpl = <AttrInternal>attr
    attrImpl._nodeDocument = this._nodeDocument
    attrImpl._element = this
    return this.attributes.setNamedItem(attrImpl)
  }

  /**
   * Sets the attribute given with `attr`.
   * 
   * @param attr - attribute to set
   */
  setAttributeNodeNS(attr: Attr): Attr | null {
    const attrImpl = <AttrInternal>attr
    attrImpl._nodeDocument = this._nodeDocument
    attrImpl._element = this
    return this.attributes.setNamedItemNS(attrImpl)
  }

  /**
   * Removes the given attribute.
   * 
   * @param attr - attribute to remove
   */
  removeAttributeNode(attr: Attr): Attr {
    return this.attributes.removeNamedItemNS(attr.namespaceURI, attr.localName)
  }

  /**
   * Creates a shadow root for element and returns it.
   * 
   * @param init - A ShadowRootInit dictionary.
   */
  attachShadow(init: { mode: ShadowRootMode }): ShadowRoot {
    if (this.namespaceURI !== Namespace.HTML)
      throw DOMException.NotSupportedError
    if (!HTMLSpec.isValidCustomElementName(this.localName) && !HTMLSpec.isValidElementName(this.localName))
      throw DOMException.NotSupportedError
    if (this._shadowRoot)
      throw DOMException.InvalidStateError

    const shadow = new ShadowRootImpl(this._nodeDocument, this, init.mode)
    this._shadowRoot = shadow
    return shadow
  }

  /**
   * Returns element's shadow root, if any, and if shadow root's mode
   * is `"open"`, and `null` otherwise.
   */
  get shadowRoot(): ShadowRoot | null {
    if (this._shadowRoot && this._shadowRoot.mode === 'open')
      return this._shadowRoot
    else
      return null
  }

  /**
   * Returns the first (starting at element) inclusive ancestor that
   * matches selectors, and `null` otherwise.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param selectors 
   */
  closest(selectors: string): Element | null {
    throw DOMException.NotImplementedError
  }

  /**
   * Returns `true` if matching selectors against element's root yields 
   * element, and `false` otherwise.
   * 
   * This method is not supported by this module and will throw an
   * exception.
   * 
   * @param selectors 
   */
  matches(selectors: string): boolean {
    throw DOMException.NotImplementedError
  }

  /** 
   * Gets or sets the concatenation of data of all the {@link Text}
   * node descendants in tree order. When set, replaces the text 
   * contents of the node with the given value. 
   */
  get textContent(): string | null {
    let str = ''
    for (const child of this._childNodes) {
      if (child.nodeType !== NodeType.Comment &&
        child.nodeType !== NodeType.ProcessingInstruction) {
        const childContent = child.textContent
        if (childContent)
          str += childContent
      }
    }
    return str
  }
  set textContent(value: string | null) {
    const node = new TextImpl(this._nodeDocument, value || '')
    TreeMutation.replaceAllNode(node, this)
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
    const clonedSelf = new ElementImpl(this._nodeDocument,
      this.localName, this.namespaceURI, this.prefix)

    // clone attributes
    for (const attr of this.attributes) {
      const clonedAtt = <Attr>attr.cloneNode(deep)
      clonedSelf.attributes.setNamedItem(clonedAtt)
    }

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
   * Determines if the given node is equal to this one.
   * 
   * @param node - the node to compare with
   */
  isEqualNode(node: Node | null = null): boolean {
    if (!super.isEqualNode(node))
      return false

    const other = <Element>node
    if (!other || this.namespaceURI !== other.namespaceURI ||
      this.prefix !== other.prefix ||
      this.localName !== other.localName ||
      this.attributes.length !== other.attributes.length) {
      return false
    } else {
      for (let i = 0; i < this.attributes.length; i++) {
        const att1 = this.attributes.item(i)
        const att2 = other.attributes.item(i)
        if (att1 && att2 && (
          att1.namespaceURI !== att2.namespaceURI ||
          att1.localName !== att2.localName ||
          att1.value !== att2.value)) {
          return false
        }
      }

      return true
    }
  }

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
  insertAdjacentElement(where: string, element: Element): Element | null {
    switch (where.toLowerCase()) {
      case 'beforebegin':
        if (!this.parentNode) return null

        this.parentNode.insertBefore(element, this)
        break
      case 'afterbegin':
        this.insertBefore(element, this.firstChild)
        break
      case 'beforeend':
        this.insertBefore(element, null)
        break
      case 'afterend':
        if (!this.parentNode) return null

        this.parentNode.insertBefore(element, this.nextSibling)
        break
    }

    return element
  }

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
  insertAdjacentText(where: string, data: string): void {
    const text = new TextImpl(this._nodeDocument, data)

    switch (where.toLowerCase()) {
      case 'beforebegin':
        if (!this.parentNode) return

        this.parentNode.insertBefore(text, this)
        break
      case 'afterbegin':
        this.insertBefore(text, this.firstChild)
        break
      case 'beforeend':
        this.insertBefore(text, null)
        break
      case 'afterend':
        if (!this.parentNode) return

        this.parentNode.insertBefore(text, this.nextSibling)
        break
    }
  }

  /**
   * Returns the prefix for a given namespace URI, if present, and 
   * `null` if not.
   * 
   * @param namespace - the namespace to search
   */
  lookupPrefix(namespace: string | null): string | null {
    if (!namespace) return null

    if (this.namespaceURI === namespace && this.prefix) {
      return this.prefix
    }

    for (const attr of this.attributes) {
      if (attr.prefix === "xmlns" && attr.value === namespace) {
        return attr.localName
      }
    }

    if (this.parentElement)
      return this.parentElement.lookupPrefix(namespace)

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

    if (this.namespaceURI && this.prefix === prefix)
      return this.namespaceURI

    for (const attr of this.attributes) {
      if (attr.namespaceURI === Namespace.XMLNS) {
        if ((attr.prefix === 'xmlns' && attr.localName === prefix) ||
          (!prefix && !attr.prefix && attr.localName === 'xmlns')) {
          return attr.value || null
        }
      }
    }

    if (this.parentElement)
      return this.parentElement.lookupNamespaceURI(prefix)

    return null
  }


  /** 
   * Returns the qualified name.
   */
  get _qualifiedName(): string {
    return (this._namespacePrefix ?
      this._namespacePrefix + ':' + this.localName :
      this.localName)
  }

  /**
   * Returns the upper-cased qualified name for a html element.
   */
  get _htmlUppercasedQualifiedName(): string {
    let qualifiedName = this._qualifiedName
    if (this._namespace === Namespace.HTML && this._nodeDocument._type === "html") {
      // TODO: https://infra.spec.whatwg.org/#ascii-uppercase
      qualifiedName = qualifiedName.toUpperCase()
    }
    return qualifiedName
  }

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

  // MIXIN: NonDocumentTypeChildNode
  /* istanbul ignore next */
  get previousElementSibling(): Element | null { throw new Error("Mixin: NonDocumentTypeChildNode not implemented.") }
  /* istanbul ignore next */
  get nextElementSibling(): Element | null { throw new Error("Mixin: NonDocumentTypeChildNode not implemented.") }

  // MIXIN: ChildNode
  /* istanbul ignore next */
  before(...nodes: (Node | string)[]): void { throw new Error("Mixin: ChildNode not implemented.") }
  /* istanbul ignore next */
  after(...nodes: (Node | string)[]): void { throw new Error("Mixin: ChildNode not implemented.") }
  /* istanbul ignore next */
  replaceWith(...nodes: (Node | string)[]): void { throw new Error("Mixin: ChildNode not implemented.") }
  /* istanbul ignore next */
  remove(): void { throw new Error("Mixin: ChildNode not implemented.") }

  // MIXIN: Slotable
  /* istanbul ignore next */
  get assignedSlot(): HTMLSlotElement | null { throw new Error("Mixin: Slotable not implemented.") }

}