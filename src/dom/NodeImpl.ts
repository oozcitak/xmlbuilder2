import {
  Node, NodeList, Element, Attr, Text, Document, NodeType,
  Position, GetRootNodeOptions, RegisteredObserver, TransientRegisteredObserver
} from './interfaces'
import { EventTargetImpl } from './EventTargetImpl'
import { NodeListImpl } from './NodeListImpl'
import { TreeMutation } from './util/TreeMutation'
import { TreeQuery } from './util/TreeQuery'
import { NodeInternal, DocumentInternal } from './interfacesInternal'

/**
 * Represents a generic XML node.
 */
export abstract class NodeImpl extends EventTargetImpl implements NodeInternal {

  static readonly ELEMENT_NODE: number = 1
  static readonly ATTRIBUTE_NODE: number = 2
  static readonly TEXT_NODE: number = 3
  static readonly CDATA_SECTION_NODE: number = 4
  static readonly ENTITY_REFERENCE_NODE: number = 5
  static readonly ENTITY_NODE: number = 6
  static readonly PROCESSING_INSTRUCTION_NODE: number = 7
  static readonly COMMENT_NODE: number = 8
  static readonly DOCUMENT_NODE: number = 9
  static readonly DOCUMENT_TYPE_NODE: number = 10
  static readonly DOCUMENT_FRAGMENT_NODE: number = 11
  static readonly NOTATION_NODE: number = 12

  static readonly DOCUMENT_POSITION_DISCONNECTED: number = 0x01
  static readonly DOCUMENT_POSITION_PRECEDING: number = 0x02
  static readonly DOCUMENT_POSITION_FOLLOWING: number = 0x04
  static readonly DOCUMENT_POSITION_CONTAINS: number = 0x08
  static readonly DOCUMENT_POSITION_CONTAINED_BY: number = 0x10
  static readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number = 0x20

  protected _baseURI = ''
  protected _childNodes: NodeList

  _nodeDocument: DocumentInternal
  _registeredObserverList:
    Array<RegisteredObserver | TransientRegisteredObserver> = []

  _parentNode: Node | null = null
  _firstChild: Node | null = null
  _lastChild: Node | null = null
  _previousSibling: Node | null = null
  _nextSibling: Node | null = null
  
  /**
   * Initializes a new instance of `Node`.
   *
   * @param ownerDocument - the owner document
   */
  protected constructor(ownerDocument: Document | null) {
    super()
    // TODO: Set document to global object's document
    this._nodeDocument = <DocumentInternal>(ownerDocument || null)
    this._childNodes = new NodeListImpl(this)
  }

  /** 
   * Returns the type of node. 
   */
  abstract get nodeType(): NodeType

  /** 
   * Returns a string appropriate for the type of node. 
   */
  abstract get nodeName(): string

  /**
   * Gets the absolute base URL of the node.
   */
  get baseURI(): string { return this._baseURI }

  /** 
   * Returns whether the node is rooted to a document node. 
   */
  get isConnected(): boolean {
    const root = this.getRootNode()
    return (root.nodeType === NodeType.Document)
  }

  /** 
   * Returns the parent document. 
   */
  get ownerDocument(): Document | null {
    if (this.nodeType === NodeType.Document)
      return null
    else
      return this._nodeDocument
  }

  /**
   * Returns the root node.
   * 
   * @param options - if options has `composed = true` this function
   * returns the node's shadow-including root, otherwise it returns
   * the node's root node.
   */
  getRootNode(options?: GetRootNodeOptions): Node {
    return TreeQuery.rootNode(this, !!options && options.composed)
  }

  /** 
   * Returns the parent node. 
   */
  get parentNode(): Node | null { return this._parentNode }

  /** 
   * Returns the parent element. 
   */
  get parentElement(): Element | null {
    if (this.parentNode && this.parentNode.nodeType === NodeType.Element)
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
  get childNodes(): NodeList { return this._childNodes }

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
      const nextNode = node.nextSibling
      if (node.nodeType === NodeType.Text) {
        const text = <Text>node
        if (text.length === 0) {
          this.removeChild(text)
        }
      }
      node = nextNode
    }
    // combine adjacent text nodes
    node = this.firstChild
    while (node) {
      const nextNode = node.nextSibling
      if (node.nodeType === NodeType.Text &&
        nextNode && nextNode.nodeType === NodeType.Text) {
        const text = <Text>node
        const nextText = <Text>nextNode
        text.appendData(nextText.data)
        this.removeChild(nextText)
      } else {
        node = nextNode
      }
    }
    // normalize child nodes
    for (const child of this.childNodes) {
      child.normalize()
    }
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
  abstract cloneNode(deep?: boolean): Node

  /**
   * Determines if the given node is equal to this one.
   * 
   * @param node - the node to compare with
   */
  isEqualNode(node: Node | null): boolean {
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
  isSameNode(node: Node | null): boolean {
    return (!!node && node === this)
  }

  /**
   * Returns a bitmask indicating the position of the given `node`
   * relative to this node.
   */
  compareDocumentPosition(node: Node): Position {
    if (node === this) return 0

    let node1: Node | null = node
    let node2: Node | null = this

    let attr1: Attr | null = null
    let attr2: Attr | null = null

    if (node1.nodeType === NodeType.Attribute) {
      attr1 = <Attr>node1
      node1 = attr1.ownerElement
    }

    if (node2.nodeType === NodeType.Attribute) {
      attr2 = <Attr>node2
      node2 = attr2.ownerElement

      if (attr1 && node1 && (node1 === node2)) {
        for (const attr of (<Element>node2).attributes) {
          if (attr.isEqualNode(attr1)) {
            return Position.ImplementationSpecific | Position.Preceding
          } else if (attr.isEqualNode(attr2)) {
            return Position.ImplementationSpecific | Position.Following
          }
        }
      }
    }

    // nodes are null
    if (node1 === null && node2 === null) {
      return Position.Disconnected | Position.ImplementationSpecific |
        Position.Preceding
    } else if (node1 === null) {
      return Position.Disconnected | Position.ImplementationSpecific |
        Position.Preceding
    } else if (node2 === null) {
      return Position.Disconnected | Position.ImplementationSpecific |
        Position.Following
    }

    if (node1.getRootNode() !== node2.getRootNode()) {
      // TODO: nodes are disconnected
      // return a random result but cache the value for consistency
      return Position.Disconnected | Position.ImplementationSpecific |
        Position.Preceding
    }

    if ((!attr1 && TreeQuery.isAncestorOf(node2, node1)) ||
      (attr2 && (node1 === node2))) {
      return Position.Contains | Position.Preceding
    }

    if ((!attr2 && TreeQuery.isDescendantOf(node2, node1)) ||
      (attr1 && (node1 === node2))) {
      return Position.ContainedBy | Position.Following
    }

    if (TreeQuery.isPreceding(node2, node1))
      return Position.Preceding

    return Position.Following
  }

  /**
   * Returns `true` if given node is an inclusive descendant of this
   * node, and `false` otherwise (including when other node is `null`).
   * 
   * @param node - the node to check
   */
  contains(node: Node | null): boolean {
    if (!node) return false
    return ((node === this) || TreeQuery.isDescendantOf(this, node))
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

    const defaultNamespace = this.lookupNamespaceURI(null)

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
  insertBefore(newChild: Node, refChild: Node | null): Node {
    return TreeMutation.preInsert(newChild, this, refChild)
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
  appendChild(newChild: Node): Node {
    return TreeMutation.appendNode(newChild, this)
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
    return TreeMutation.replaceNode(oldChild, newChild, this)
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
    return TreeMutation.preRemoveNode(oldChild, this)
  }

}
