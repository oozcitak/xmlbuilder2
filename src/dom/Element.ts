import { Node } from "./Node"
import { Document } from "./Document"
import { Text } from "./Text"
import { NamedNodeMap } from "./NamedNodeMap"
import { Attr } from "./Attr";

/**
 * Represents an element node.
 */
export class Element extends Node {

  protected _namespaceURI: string | null
  protected _prefix: string | null
  protected _localName: string
  protected _attributes: NamedNodeMap = new NamedNodeMap()
  
  /**
   * Initializes a new instance of `Element`.
   *
   * @param ownerDocument - the owner document
   * @param namespaceURI - the namespace URI
   * @param prefix - the namespace prefix
   * @param localName - the local name of the element
   */
  public constructor (ownerDocument: Document | null = null, 
    namespaceURI: string | null, prefix: string | null, localName: string) 
  {
    super(ownerDocument)

    this._namespaceURI = namespaceURI
    this._prefix = prefix
    this._localName = localName
  }
  
  /** 
   * Returns the type of node. 
   */
  get nodeType(): number { return Node.Element }

  /** 
   * Returns a string appropriate for the type of node. 
   */
  get nodeName(): string { return this.tagName }

  /** 
   * Gets the namespace URI.
   */
  get namespaceURI(): string | null { return this._namespaceURI }
    
  /** 
   * Gets the namespace prefix.
   */
  get prefix(): string | null { return this._prefix }

  /** 
   * Gets the local name.
   */
  get localName(): string { return this._localName }

  /** 
   * If namespace prefix is not `null`, returns the concatenation of
   * namespace prefix, `":"`, and local name. Otherwise it returns the
   * local name.
   */
  get tagName(): string {
    return (this._prefix ? 
      this._prefix + ':' + this.localName : 
      this.localName)
  }

  /** 
   * Returns a {@link NamedNodeMap} of attributes.
   */
  get attributes(): NamedNodeMap { return this._attributes }

  /** 
   * Returns the concatenation of data of all the {@link CharacterData}
   * node descendants in tree order. When set, replaces the text 
   * contents of the node with the given value. 
   */
  get textContent(): string | null {
    let str = ''
    for (let child of this._childNodeList) {
      let childContent = child.textContent
      if (childContent) str += childContent
    }
    return str
  }
  set textContent(value: string | null) {
    let node: Node | null = null
    if (value)
      node = new Text(this.ownerDocument, value)

    if(node && this.ownerDocument)
      this.ownerDocument.adoptNode(node)
    
    this.childNodes.length = 0
    
    if (node)
      node.appendChild(node)
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
      
    let clonedSelf = new Element(document, 
      this.namespaceURI, this.prefix, this.localName)
    clonedSelf._parentNode = null

    // clone attributes
    for(let att of this.attributes) {
      let clonedAtt = new Attr(clonedSelf, 
        att.namespaceURI, att.prefix, att.localName, att.value)
      clonedSelf.attributes.setNamedItem(clonedAtt)
    }

    // clone child nodes
    for(let child of this.childNodes) {
      let clonedChild = child.cloneNode(document, deep)
      clonedSelf.appendChild(clonedChild)
    }

    return clonedSelf
  }


  /**
   * Determines if the given node is equal to this one.
   * 
   * @param node - the node to compare with
   */
  isEqualNode(node?: Node | null): boolean {
    if (!super.isEqualNode(node))
      return false

    let other = <Element>node
    if(!other || this.namespaceURI !== other.namespaceURI || 
      this.prefix !== other.prefix ||
      this.localName !== other.localName ||
      this.attributes.length !== other.attributes.length) {
      return false
    } else {
      for (let i = 0; i < this.attributes.length; i++) {
        let att1 = this.attributes[i]
        let att2 = other.attributes[i]
        if (att1.namespaceURI !== att2.namespaceURI ||
          att1.localName !== att2.localName ||
          att1.value !== att2.value) {
          return false
        }
      }
      
      return true
    }
  }
}