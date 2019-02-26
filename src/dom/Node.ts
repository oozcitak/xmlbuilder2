import { DocumentFragment } from './DocumentFragment'
import { Document } from './Document'
import { Text } from './Text'
import { NodeList } from './NodeList'
import { Element } from './Element'
import { Attr } from './Attr'
import { Utility } from './Utility'

/**
 * Represents a generic XML node.
 */
export abstract class Node {
  // node type
  static readonly Element = 1
  static readonly Attribute = 2
  static readonly Text = 3
  static readonly CData = 4
  static readonly EntityReference = 5 // historical
  static readonly Entity = 6 // historical
  static readonly ProcessingInstruction = 7
  static readonly Comment = 8
  static readonly Document = 9
  static readonly DocumentType = 10
  static readonly DocumentFragment = 11
  static readonly Notation = 12 // historical

  // document position
  static readonly Disconnected = 0x01
  static readonly Preceding = 0x02
  static readonly Following = 0x04
  static readonly Contains = 0x08
  static readonly ContainedBy = 0x10
  static readonly ImplementationSpecific = 0x20

  _parentNode: Node | null = null
  _firstChild: Node | null = null
  _lastChild: Node | null = null
  _previousSibling: Node | null = null
  _nextSibling: Node | null = null
  _ownerDocument: Document | null = null
  protected _childNodeList: NodeList

  baseURI: string | undefined

  /**
   * Initializes a new instance of `Node`.
   *
   * @param ownerDocument - the owner document
   */
  protected constructor(ownerDocument: Document | null = null) {
    this._ownerDocument = ownerDocument
    this._childNodeList = new NodeList(this)
  }

  /** 
   * Returns the type of node. 
   */
  abstract get nodeType(): number

  /** 
   * Returns a string appropriate for the type of node. 
   */
  abstract get nodeName(): string

  /** 
   * Returns whether the node is rooted to a document node. 
   */
  get isConnected(): boolean {
    let root = this.getRootNode()
    if (!root)
      return false
    else
      return (root.nodeType === Node.Document)
  }

  /** 
   * Returns the parent document. 
   */
  get ownerDocument(): Document | null {
    if (this.nodeType === Node.Document)
      return <Document><unknown>this
    else
      return this._ownerDocument
  }

  /**
   * Returns the root node.
   * 
   * @param options - if options has `composed = true` this function
   * returns the node's shadow-including root, otherwise it returns
   * the node's root node.
   */
  getRootNode(options: object = { composed: false }): Node | null {
    return Utility.Tree.rootNode(this)
  }

  /** 
   * Returns the parent node. 
   */
  get parentNode(): Node | null { return this._parentNode }

  /** 
   * Returns the parent element. 
   */
  get parentElement(): Element | null {
    if (this.parentNode && this.parentNode.nodeType === Node.Element)
      return <Element>this.parentNode
    else
      return null
  }

  /** 
   * Determines whether a node has any children.
   */
  hasChildNodes(): boolean {
    return (this.firstChild !== null)
  }

  /** 
   * Returns a {@link NodeList} of child nodes. 
   */
  get childNodes(): NodeList { return this._childNodeList }

  /** 
   * Returns the first child node. 
   */
  get firstChild(): Node | null {
    return this._firstChild
  }

  /** 
   * Returns the last child node. 
   */
  get lastChild(): Node | null {
    return this._lastChild
  }

  /** 
   * Returns the previous sibling node. 
   */
  get previousSibling(): Node | null {
    return this._previousSibling
  }

  /** 
   * Returns the next sibling node. 
   */
  get nextSibling(): Node | null {
    return this._nextSibling
  }

  /** 
   * Gets or sets the data associated with a {@link CharacterData} node.
   * For other node types returns `null`. 
   */
  get nodeValue(): string | null { return null }
  set nodeValue(value: string | null) { }

  /** 
   * Returns the concatenation of data of all the {@link CharacterData}
   * node descendants in tree order. When set, replaces the text 
   * contents of the node with the given value. 
   */
  get textContent(): string | null { return null }
  set textContent(value: string | null) { }

  /**
   * Puts all {@link Text} nodes in the full depth of the sub-tree
   * underneath this node into a "normal" form where only markup 
   * (e.g., tags, comments, processing instructions, CDATA sections,
   * and entity references) separates {@link Text} nodes, i.e., there
   * are no adjacent Text nodes.
   */
  normalize(): void {
    // remove empty text nodes
    let node = this.firstChild
    while (node) {
      let nextNode = node.nextSibling
      if (node.nodeType === Node.Text) {
        let text = <Text>node
        if (text.length === 0) {
          this.removeChild(text)
        }
      }
      node = nextNode
    }
    // combine adjacent text nodes
    node = this.firstChild
    while (node) {
      let nextNode = node.nextSibling
      if (node.nodeType === Node.Text &&
        nextNode && nextNode.nodeType === Node.Text) {
        let text = <Text>node
        let nextText = <Text>nextNode
        text.appendData(nextText.data)
        this.removeChild(nextText)
      } else {
        node = nextNode
      }
    }
    // normalize child nodes
    for (let child of this.childNodes) {
      child.normalize()
    }
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
  abstract cloneNode(document: Document | boolean | null,
    deep: boolean): Node

  /**
   * Determines if the given node is equal to this one.
   * 
   * @param node - the node to compare with
   */
  isEqualNode(node?: Node | null): boolean {
    if (!node || this.nodeType !== node.nodeType ||
      this.childNodes.length !== node.childNodes.length) {
      return false
    } else {
      let n1 = this.firstChild
      let n2 = node.firstChild
      while (n1 && n2) {
        if (!n1.isEqualNode(n2)) {
          return false
        }
        n1 = n1.nextSibling
        n2 = n2.nextSibling
      }

      return true
    }
  }

  /**
   * Determines if the given node is reference equal to this one.
   * 
   * @param node - the node to compare with
   */
  isSameNode(node?: Node | null): boolean {
    return (node === this)
  }

  /**
   * Returns a bitmask indicating the position of the given `node`
   * relative to this node.
   */
  compareDocumentPosition(node: Node): number {
    if (node === this) return 0

    let node1: Node | null = node
    let node2: Node | null = this

    let attr1: Attr | null = null
    let attr2: Attr | null = null

    if (node1.nodeType === Node.Attribute) {
      attr1 = <Attr>node1
      node1 = attr1.ownerElement
    }

    if (node2.nodeType === Node.Attribute) {
      attr2 = <Attr>node2
      node2 = attr2.ownerElement

      if (attr1 && node1 && (node1 === node2)) {
        for (let attr of (<Element>node2).attributes) {
          if (attr.isEqualNode(attr1)) {
            return Node.ImplementationSpecific | Node.Preceding
          } else if (attr.isEqualNode(attr2)) {
            return Node.ImplementationSpecific | Node.Following
          }
        }
      }
    }

    if (!node1 || !node2 || (node1.getRootNode != node2.getRootNode)) {
      return Node.Disconnected | Node.ImplementationSpecific |
        Node.Preceding
      // TODO: return preceding or following consistently
      // Use a cached Math.random() value
    }

    if ((!attr1 && Utility.Tree.isAncestorOf(node2, node1)) ||
      (attr2 && (node1 === node2))) {
      return Node.Contains | Node.Preceding
    }

    if ((!attr2 && Utility.Tree.isDescendantOf(node2, node1)) ||
      (attr1 && (node1 === node2))) {
      return Node.ContainedBy | Node.Following
    }

    if (Utility.Tree.isPreceding(node2, node1))
      return Node.Preceding

    return Node.Following
  }

  /**
   * Returns `true` if given node is an inclusive descendant of this
   * node, and `false` otherwise (including when other node is `null`).
   * 
   * @param node - the node to check
   */
  contains(node: Node | null): boolean {
    if (!node) return false
    return ((node === this) || Utility.Tree.isDescendantOf(this, node))
  }

  /**
   * Returns the prefix for a given namespace URI, if present, and 
   * `null` if not.
   * 
   * @param namespace - the namespace to search
   */
  lookupPrefix(namespace: string | null): string | null {
    if (!namespace) return null

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

    if (this.parentElement)
      return this.parentElement.lookupNamespaceURI(prefix)

    return null
  }

  /**
   * Returns `true` if the namespace is the default namespace on this
   * node or `false` if not.
   * 
   * @param namespace - the namespace to check
   */
  isDefaultNamespace(namespace: string | null): boolean {
    if (!namespace) namespace = null

    let defaultNamespace = this.lookupNamespaceURI(null)

    return defaultNamespace === namespace
  }

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
    refChild: Node | null): Node | null {
    return Utility.Tree.Mutation.preInsert(newChild, this, refChild)
  }

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
  appendChild(newChild: Node): Node | null {
    return Utility.Tree.Mutation.appendNode(newChild, this)
  }

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
  replaceChild(newChild: Node, oldChild: Node): Node {
    return Utility.Tree.Mutation.replaceNode(newChild, oldChild, this)
  }

  /**
  * Removes the child node indicated by `oldChild` from the list of
  * children, and returns it.
  *
  * @param oldChild - the node being removed from the list
  * 
  * @returns the removed child node
  */
  removeChild(oldChild: Node): Node {
    return Utility.Tree.Mutation.preRemoveNode(oldChild, this)
  }

  /**
   * Returns the debug string for this node
   *
   * @param name - optional node name
   */
  debugInfo(name?: string): string {
    name = name || this.nodeName
    let parentName = this.parentNode ? this.parentNode.nodeName : ''

    if (!name && !parentName)
      return ''
    else if (!name)
      return `parent: <${parentName}>`
    else if (!parentName)
      return `node: <${name}>`
    else
      return `node: <${name}>, parent: <${parentName}>`
  }
}