import { NodeType } from "./NodeType";
import { Node } from "./Node";
import { CharacterData } from "./CharacterData";

/**
 * Represents a text node.
 */
export class Text extends CharacterData {

  protected _nodeType: NodeType = NodeType.Text
  protected _nodeName: string = '#text'

  /**
   * Initializes a new instance of `Text`.
   *
   * @param parent - the parent node
   */
  protected constructor (parent: Node | null, data: string = '') 
  {
    super(parent)
    this.data = data
  }
    
  /** 
   * Returns the combined data of all direct text node siblings.
   */
  get wholeText(): string 
  {
    let prev = this.previousSibling
    let prevText = ''
    if(prev && prev.nodeType === NodeType.Text)
      prevText = (<Text>prev).wholeText

    let next = this.nextSibling
    let nextText = ''
    if(next && next.nodeType === NodeType.Text)
      nextText = (<Text>next).wholeText
  
    return prevText + this.data + nextText
  }

  /**
   * Splits data at the given offset and returns the remainder as a text
   * node.
   * 
   * @param offset - the offset at which to split nodes.
   */
  splitText(offset: number): Text {
    let newData = this.data.slice(offset)
    this.data = this.data.slice(0, offset)

    let newNode = new Text(this.parentNode, newData)

    if (this.parentNode)
      this.parentNode.insertBefore(newNode, this)

    return newNode
  }
}