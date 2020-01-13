import {
  XMLSerializedValue, ObjectWriterOptions, XMLBuilderOptions
} from "../builder/interfaces"
import { applyDefaults, isArray, isString, isObject } from "@oozcitak/util"
import {
  Node, NodeType
} from "@oozcitak/dom/lib/dom/interfaces"
import { PreSerializer } from "@oozcitak/dom/lib/serializer/PreSerializer"

class IntermediateContentNode {
  parent: IntermediateElementNode
  contentNode = true

  name: string
  contents: string

  constructor(parent: IntermediateElementNode, name: string, contents: string) {
    this.parent = parent
    this.name = name
    this.contents = contents
  }
}

class IntermediateElementNode {
  parent?: IntermediateElementNode
  contentNode = false

  name: string
  contents: (IntermediateContentNode | IntermediateElementNode)[] = []

  constructor(parent: IntermediateElementNode | undefined, name: string) {
    this.parent = parent
    this.name = name
  }

  appendContentNode(name: string, contents: string): void {
    this.contents.push(new IntermediateContentNode(this, name, contents))
  }

  appendElementNode(name: string): IntermediateElementNode {
    const newItem = new IntermediateElementNode(this, name)
    this.contents.push(newItem)
    return newItem
  }
}

function isContentNode(x: any): x is IntermediateContentNode { return x.contentNode }
function isElementNode(x: any): x is IntermediateElementNode { return !x.contentNode }

type IntermediateValue = {
  parent?: IntermediateValue,
  name: string,
  items: (string | IntermediateValue)[]
}

type AttrNode = { "@": { [key: string]: string } }
type TextNode = { "#": string | string[] }
type CommentNode = { "!": string | string[] }
type InstructionNode = { "?": string | string[] }
type CDATANode = { "$": string | string[] }
type NodeList = (ElementNode | AttrNode | TextNode | CommentNode |
  InstructionNode | CDATANode)[]
type ElementNode = { [key: string]: NodeList }

/**
 * Serializes XML nodes into objects and arrays.
 */
export class ObjectWriterImpl {

  private _builderOptions: XMLBuilderOptions
  private _pre!: PreSerializer

  /**
   * Initializes a new instance of `ObjectWriterImpl`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderOptions) {
    this._builderOptions = builderOptions
  }

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - node to serialize
   * @param writerOptions - serialization options
   */
  serialize(node: Node, writerOptions?: ObjectWriterOptions): XMLSerializedValue {
    const options: ObjectWriterOptions = applyDefaults(writerOptions, {
      format: "object"
    })

    let currentList: NodeList = []
    let currentIndex = 0
    let listRegister: NodeList[] = [currentList]

    this._pre = new PreSerializer(this._builderOptions.version, {
      beginElement: (name) => {
        const childItems: NodeList = []
        const childObj: ElementNode = { [name]: childItems }
        currentList.push(childObj)
        currentIndex++
        if (listRegister.length > currentIndex) {
          listRegister[currentIndex] = childItems
        } else {
          listRegister.push(childItems)
        }
        currentList = childItems
      },
      endElement: () => {
        currentList = listRegister[--currentIndex]
      },
      attribute: (name, value) => {
        this._addAttr(currentList, name, value)
      },
      comment: (data) => {
        this._addComment(currentList, data)
      },
      text: (data) => {
        this._addText(currentList, data)
      },
      instruction: (target, data) => {
        this._addInstruction(currentList, target + " " + data)
      },
      cdata: (data) => {
        this._addCDATA(currentList, data)
      }
    })

    /**
     * First pass, serialize nodes
     * This creates a list of nodes grouped under node types while preserving
     * insertion order. For example:
     * [
     *   root: [
     *     node: [
     *       { "@" : { "att1": "val1", "att2": "val2" }
     *       { "#": "node text" }
     *       { childNode: [] }
     *       { "#": "more text" }
     *     ],
     *     node: [
     *       { "@" : { "att": "val" }
     *       { "#": [ "text line1", "text line2" ] }
     *     ]
     *   ]
     * ]
     */
    this._pre.serialize(node, false)
    /**
     * Second pass, process node lists. Above example becomes:
     * {
     *   root: {
     *     node: [
     *       { 
     *         "@att1": "val1",
     *         "@att2": "val2",
     *         "#1": "node text",
     *         childNode: {},
     *         "#2": "more text"
     *       },
     *       {
     *         "@att": "val",
     *         "#": [ "text line1", "text line2" ]
     *       }
     *     ]
     *   }
     * }
     */
    return this._process(currentList)
  }

  private _process(items: NodeList): XMLSerializedValue {
    if (items.length === 0) return { }

    // determine if there are non-unique element names
    const namesSeen: { [key: string]: boolean } = {}
    let hasNonUniqueNames = false
    let uniqueNameCount = 0
    let attrCount = 0
    let textCount = 0
    let commentCount = 0
    let instructionCount = 0
    let cdataCount = 0
    let elementCount = 0
    let hasDataNodes = false
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const key = Object.keys(item)[0]
      switch (key) {
        case "@":
          attrCount++
          continue
        case "#":
          textCount++
          hasDataNodes = true
          break
        case "!":
          commentCount++
          hasDataNodes = true
          break
        case "?":
          instructionCount++
          hasDataNodes = true
          break
        case "$":
          cdataCount++
          hasDataNodes = true
          break
        default:
          if (namesSeen[key]) {
            hasNonUniqueNames = true
          } else {
            namesSeen[key] = true
            uniqueNameCount++
          }
          elementCount++
          break
      }
    }

    if (textCount === 1 && items.length === 1) {
      // special case of an element node with a single text node
      return (items[0] as TextNode)["#"]
    } else if (!hasDataNodes && uniqueNameCount === 1 && elementCount > 1) {
      // list of element nodes only which have the same name
      // return an array with list notation
      const obj: XMLSerializedValue = {}
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const key = Object.keys(item)[0]
        switch (key) {
          case "@":
            const attrs = (item as AttrNode)["@"]
            const attrKeys = Object.keys(attrs)
            if (attrKeys.length === 1) {
              obj[this._getAttrKey() + attrKeys[0]] = attrs[attrKeys[0]]
            } else {
              obj[this._getAttrKey()] = (item as AttrNode)["@"]
            }
            break
          default:
            // element node
            let childNodes: XMLSerializedValue[] = obj[key] as XMLSerializedValue[]
            if (childNodes === undefined) {
              childNodes = []
              obj[key] = childNodes
            }
            childNodes.push(this._process((item as ElementNode)[key]))
            break
        }
      }
      return obj
    } else if (hasNonUniqueNames) {
      // list contains element nodes with non-unique names
      // return an array with mixed content notation
      const result: XMLSerializedValue = []
      const obj: XMLSerializedValue = { "#": result }
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const key = Object.keys(item)[0]
        switch (key) {
          case "@":
            const attrs = (item as AttrNode)["@"]
            const attrKeys = Object.keys(attrs)
            if (attrKeys.length === 1) {
              result.push({ [this._getAttrKey() + attrKeys[0]]: attrs[attrKeys[0]] })
            } else {
              result.push({ [this._getAttrKey()]: (item as AttrNode)["@"] })
            }
            break
          case "#":
            const textKey = this._getNodeKey(NodeType.Text)
            result.push({ [textKey]: (item as TextNode)["#"] })
            break
          case "!":
            const commentKey = this._getNodeKey(NodeType.Comment)
            result.push({ [commentKey]: (item as CommentNode)["!"] })
            break
          case "?":
            const instructionKey = this._getNodeKey(NodeType.ProcessingInstruction)
            result.push({ [instructionKey]: (item as InstructionNode)["?"] })
            break
          case "$":
            const cdataKey = this._getNodeKey(NodeType.CData)
            result.push({ [cdataKey]: (item as CDATANode)["$"] })
            break
          default:
            // element node
            result.push({ [key]: this._process((item as ElementNode)[key]) })
            break
        }
      }
      return obj
    } else {
      // all element nodes have unique names
      // return an object while prefixing data node keys
      let textId: number = 1
      let commentId: number = 1
      let instructionId: number = 1
      let cdataId: number = 1
      const obj: XMLSerializedValue = {}
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const key = Object.keys(item)[0]
        switch (key) {
          case "@":
            const attrs = (item as AttrNode)["@"]
            const attrKeys = Object.keys(attrs)
            if (attrKeys.length === 1) {
              obj[this._getAttrKey() + attrKeys[0]] = attrs[attrKeys[0]]
            } else {
              obj[this._getAttrKey()] = (item as AttrNode)["@"]
            }
            break
          case "#":
            const textKey = textCount > 1 ? this._getNodeKey(NodeType.Text) + (textId++).toString() : this._getNodeKey(NodeType.Text)
            obj[textKey] = (item as TextNode)["#"]
            break
          case "!":
            const commentKey = commentCount > 1 ? this._getNodeKey(NodeType.Comment) + (commentId++).toString() : this._getNodeKey(NodeType.Comment)
            obj[commentKey] = (item as CommentNode)["!"]
            break
          case "?":
            const instructionKey = instructionCount > 1 ? this._getNodeKey(NodeType.ProcessingInstruction) + (instructionId++).toString() : this._getNodeKey(NodeType.ProcessingInstruction)
            obj[instructionKey] = (item as InstructionNode)["?"]
            break
          case "$":
            const cdataKey = cdataCount > 1 ? this._getNodeKey(NodeType.CData) + (cdataId++).toString() : this._getNodeKey(NodeType.CData)
            obj[cdataKey] = (item as CDATANode)["$"]
            break
          default:
            // element node
            obj[key] = this._process((item as ElementNode)[key])
            break
        }
      }
      return obj
    }
  }

  private _addAttr(items: NodeList, name: string, value: string): void {
    if (items.length === 0) {
      items.push({ "@": { [name]: value } })
    } else {
      const lastItem = items[items.length - 1]
      if (this._isAttrNode(lastItem)) {
        lastItem["@"][name] = value
      } else {
        items.push({ "@": { [name]: value } })
      }
    }
  }

  private _addText(items: NodeList, value: string): void {
    if (items.length === 0) {
      items.push({ "#": value })
    } else {
      const lastItem = items[items.length - 1]
      if (this._isTextNode(lastItem)) {
        if (isArray(lastItem["#"])) {
          lastItem["#"].push(value)
        } else {
          lastItem["#"] = value
        }
      } else {
        items.push({ "#": value })
      }
    }
  }

  private _addComment(items: NodeList, value: string): void {
    if (items.length === 0) {
      items.push({ "!": value })
    } else {
      const lastItem = items[items.length - 1]
      if (this._isCommentNode(lastItem)) {
        if (isArray(lastItem["!"])) {
          lastItem["!"].push(value)
        } else {
          lastItem["!"] = value
        }
      } else {
        items.push({ "!": value })
      }
    }
  }

  private _addInstruction(items: NodeList, value: string): void {
    if (items.length === 0) {
      items.push({ "?": value })
    } else {
      const lastItem = items[items.length - 1]
      if (this._isInstructionNode(lastItem)) {
        if (isArray(lastItem["?"])) {
          lastItem["?"].push(value)
        } else {
          lastItem["?"] = value
        }
      } else {
        items.push({ "?": value })
      }
    }
  }

  private _addCDATA(items: NodeList, value: string): void {
    if (items.length === 0) {
      items.push({ "$": value })
    } else {
      const lastItem = items[items.length - 1]
      if (this._isCDATANode(lastItem)) {
        if (isArray(lastItem["$"])) {
          lastItem["$"].push(value)
        } else {
          lastItem["$"] = value
        }
      } else {
        items.push({ "$": value })
      }
    }
  }

  private _isAttrNode(x: any): x is AttrNode {
    return x["@"] !== undefined
  }

  private _isTextNode(x: any): x is TextNode {
    return x["#"] !== undefined
  }
  private _isCommentNode(x: any): x is CommentNode {
    return x["!"] !== undefined
  }
  private _isInstructionNode(x: any): x is InstructionNode {
    return x["?"] !== undefined
  }
  private _isCDATANode(x: any): x is CDATANode {
    return x["$"] !== undefined
  }

  /**
   * Returns an object key for an attribute or namespace declaration.
   */
  private _getAttrKey(): string {
    return this._builderOptions.convert.att
  }

  /**
   * Returns an object key for the given node type.
   * 
   * @param nodeType - node type to get a key for
   */
  private _getNodeKey(nodeType: NodeType): string {
    switch (nodeType) {
      case NodeType.Comment:
        return this._builderOptions.convert.comment
      case NodeType.Text:
        return this._builderOptions.convert.text
      case NodeType.ProcessingInstruction:
        return this._builderOptions.convert.ins
      case NodeType.CData:
        return this._builderOptions.convert.cdata
      /* istanbul ignore next */
      default:
        throw new Error("Invalid node type.")
    }
  }

}
