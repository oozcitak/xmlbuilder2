import { NodeType } from "./NodeType";
import { DocumentPosition } from "./DocumentPosition";
import { DocumentFragment } from "./DocumentFragment";
import { Document } from "./Document";
import { Text } from "./Text";
import { NodeList } from "./NodeList";
import { Element } from "./Element";

/**
 * Represents a generic XML node.
 */
export abstract class Node {

  protected abstract _nodeType: NodeType
  protected abstract _nodeName: string

  protected _parentNode: Node | null = null
  protected _baseURI: string | null = null
  protected _ownerDocument: Document | null = null
  protected _childNodeList: NodeList = new NodeList()
  protected _prevSibling: Node | null = null
  protected _nextSibling: Node | null = null
  
  /**
   * Initializes a new instance of `Node`.
   *
   * @param parent - the parent node
   */
  protected constructor (ownerDocument: Document | null = null) 
  {
    this._ownerDocument = ownerDocument
  }
  
  /** 
   * Returns the type of node. 
   */
  get nodeType(): NodeType { return this._nodeType }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return this._nodeName }

  /** 
   * Returns the associated base URL. 
   */
  get baseURI(): string | null { return this._baseURI }

  /** 
   * Returns the parent document. 
   */
  get ownerDocument(): Document | null {
    return this._ownerDocument 
  }
  set ownerDocument(value: Document | null) { 
    this._ownerDocument = value
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
   * Returns a NodeList of child nodes. 
   */
  get childNodes(): NodeList { return this._childNodeList }

  /** 
   * Returns the first child node. 
   */
  get firstChild(): Node | null { 
    return this._childNodeList[0]
  }

  /** 
   * Returns the last child node. 
   */
  get lastChild(): Node | null { 
    return this._childNodeList[this._childNodeList.length - 1]
  }

  /** 
   * Returns the previous sibling node. 
   */
  get previousSibling(): Node | null { return this._prevSibling }

  /** 
   * Returns the next sibling node. 
   */
  get nextSibling(): Node | null { return this._nextSibling }

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
  get textContent(): string | null {
    if (this.nodeType === NodeType.Element ||
      this.nodeType === NodeType.DocumentFragment) {
        let str = ''
        for (let child of this._childNodeList) {
          if (child.textContent) str += child.textContent
        }
        return str
    }
    else
      return null
  }
  set textContent(value: string | null) {
    if (this.nodeType === NodeType.Element ||
        this.nodeType === NodeType.DocumentFragment) {
          this._childNodeList = new NodeList()
          if (value) {
            let node = new Text(this.ownerDocument, value)
            node.setParent(this)
            this._childNodeList.push(node)
          }
      }
  }

  /** Determines whether a node has any children. */
  hasChildNodes(): boolean { 
    return (this._childNodeList.length !== 0) 
  }

  /**
   * Puts all {@link Text} nodes in the full depth of the sub-tree
   * underneath this node into a "normal" form where only markup 
   * (e.g., tags, comments, processing instructions, CDATA sections,
   * and entity references) separates {@link Text} nodes, i.e., there
   * are no adjacent Text nodes.
   */
  normalize(): void {
    throw new Error("This DOM method is not implemented." + this.debugInfo())
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

    if(!document)
      document = this.ownerDocument
      
    let clonedSelf = Object.create(this)

    clonedSelf.ownerDocument = document

    // remove parent element
    clonedSelf._parentNode = null

    // clone attributes
    clonedSelf.attribs = {}
    for (let attName in this.attribs)
      clonedSelf.attribs[attName] = this.attribs[attName].cloneNode()

    // clone child nodes
    if (deep) {
      clonedSelf.children = []
      for (let child of this.childNodes) {
        let clonedChild = child.cloneNode(deep)
        clonedChild._parentNode = clonedSelf
        clonedSelf.children.push(clonedChild)
      }
    }

    return clonedSelf
  }

  /**
   * Determines if the given node is equal to this one.
   * 
   * @param node - the node to compare with
   */
  isEqualNode(node?: Node | null): boolean {
    throw new Error("This DOM method is not implemented." + this.debugInfo())
  }

  /**
   * Returns a bitmask indicating the position of a node relative to 
   * this node.
   */
  compareDocumentPosition(node: Node): DocumentPosition {
    throw new Error("This DOM method is not implemented." + this.debugInfo())
  }

  /**
   * Returns `true` if given node is an inclusive descendant of this
   * node, and `false` otherwise (including when other node is `null`).
   */
  contains(node: Node | null): boolean {
    throw new Error("This DOM method is not implemented." + this.debugInfo())
  }

  /**
   * Returns the prefix for a given namespace URI, if present, and 
   * `null` if not.
   */
  lookupPrefix(namespace: string | null): string | null {
    throw new Error("This DOM method is not implemented." + this.debugInfo())
  }

  /**
   * Returns the namespace URI for a given prefix if present, and `null`
   * if not.
   */
  lookupNamespaceURI(prefix: string | null): string | null {
    throw new Error("This DOM method is not implemented." + this.debugInfo())
  }

  /**
   * Returns `true` if the namespace is the default namespace on this
   * node or `false` if not.
   */
  isDefaultNamespace(namespace: string | null): boolean {
    throw new Error("This DOM method is not implemented." + this.debugInfo())
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
    if (newChild.nodeType === NodeType.DocumentFragment) {
      let lastInsertedNode = null

      for (let childNode of newChild.childNodes)
        lastInsertedNode = this.insertBefore(childNode, refChild)

      return lastInsertedNode
    }
    else if (refChild) {
        // remove newChild if it is already in the tree
        let index = this.childNodes.indexOf(newChild)
        if (index !== -1)
          this.childNodes.splice(index, 1)
        else
          newChild._parentNode = this

        // temporarily remove children starting *with* refChild
        index = this.childNodes.indexOf(refChild)
        let removed = this.childNodes.splice(index)
      
        // add the new child
        this.childNodes.push(newChild)
      
        // add back removed children after new child
        Array.prototype.push.apply(this.childNodes, removed)
    }
    else
      this.childNodes.push(newChild)

    return newChild
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
    if (newChild.nodeType === NodeType.DocumentFragment) {
      let lastInsertedNode = null

      for (let childNode of newChild.childNodes)
        lastInsertedNode = this.appendChild(childNode)

      return lastInsertedNode
    }
    else {
      // remove newChild if it is already in the tree
      let index = this.childNodes.indexOf(newChild)
      if (index !== -1)
        this.childNodes.splice(index, 1)
      else
        newChild._parentNode = this
  
      // add newChild
      this.childNodes.push(newChild)
  
      return newChild
    }
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
    // remove newChild if it is already in the tree
    let index = this.childNodes.indexOf(newChild)
    if (index !== -1)
      this.childNodes.splice(index, 1)
    else
      newChild._parentNode = this

    // find and replace oldChild
    index = this.childNodes.indexOf(oldChild)
    if (index !== -1)
      this.childNodes[index] = newChild

    return oldChild
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
    let index = this.childNodes.indexOf(oldChild)
    if (index !== -1)
      this.childNodes.splice(index, 1)

    return oldChild
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
      return `parent: <${ parentName }>`
    else if (!parentName)
      return `node: <${ name }>`
    else
      return `node: <${ name }>, parent: <${ parentName }>`
  }
}