import { Node } from "./Node"
import { Document } from "./Document"
import { Text } from "./Text"

/**
 * Represents a document fragment in the XML tree.
 */
export class DocumentFragment extends Node {

  protected _nodeType: number = Node.DocumentFragment
  protected _nodeName: string = '#document-fragment'

  /**
   * Initializes a new instance of `DocumentFragment`.
   *
   * @param ownerDocument - the owner document
   */
  public constructor (ownerDocument: Document | null) 
  {
    super(ownerDocument)
  }

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
      
    let clonedSelf = new DocumentFragment(document)
    clonedSelf._parentNode = null

    // clone child nodes
    for(let child of this.childNodes) {
      let clonedChild = child.cloneNode(document, deep)
      clonedSelf.appendChild(clonedChild)
    }

    return clonedSelf
  }
}
