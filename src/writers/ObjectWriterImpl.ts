import {
  XMLSerializedValue, ObjectWriterOptions, XMLBuilderOptions
} from "../builder/interfaces"
import { applyDefaults, isArray, isString } from "@oozcitak/util"
import { Node, NodeType } from "@oozcitak/dom/lib/dom/interfaces"
import { PreSerializer } from "./base/PreSerializer"

type AttrNode = { "@": { [key: string]: string } }
type TextNode = { "#": string | string[] }
type CommentNode = { "!": string | string[] }
type InstructionNode = { "?": string | string[] }
type CDATANode = { "$": string | string[] }
type NodeList = (ElementNode | AttrNode | TextNode | CommentNode |
  InstructionNode | CDATANode)[]
type ElementNode = { [key: string]: NodeList | NodeList[] }

/**
 * Serializes XML nodes into objects and arrays.
 */
export class ObjectWriterImpl {

  private _builderOptions: XMLBuilderOptions

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
    const options = applyDefaults(writerOptions, {
      format: "object",
      wellFormed: false
    }) as Required<ObjectWriterOptions> 

    let currentList: NodeList = []
    let currentIndex = 0
    let listRegister: NodeList[] = [currentList]

    const pre = new PreSerializer()

    pre.setCallbacks({
      beginElement: (name) => {
        const childItems = this._addElement(currentList, name)
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
    pre.serialize(node, options.wellFormed)
    
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
    let textCount = 0
    let commentCount = 0
    let instructionCount = 0
    let cdataCount = 0
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const key = Object.keys(item)[0]
      switch (key) {
        case "@":
          continue
        case "#":
          textCount++
          break
        case "!":
          commentCount++
          break
        case "?":
          instructionCount++
          break
        case "$":
          cdataCount++
          break
        default:
          if (namesSeen[key]) {
            hasNonUniqueNames = true
          } else {
            namesSeen[key] = true
          }
          break
      }
    }

    const defAttrKey = this._getAttrKey()
    const defTextKey = this._getNodeKey(NodeType.Text)
    const defCommentKey = this._getNodeKey(NodeType.Comment)
    const defInstructionKey = this._getNodeKey(NodeType.ProcessingInstruction)
    const defCdataKey = this._getNodeKey(NodeType.CData)

    if (textCount === 1 && items.length === 1 && isString((items[0] as TextNode)["#"])) {
      // special case of an element node with a single text node
      return (items[0] as TextNode)["#"]
    } else if (hasNonUniqueNames) {
      // list contains element nodes with non-unique names
      // return an array with mixed content notation
      const result: XMLSerializedValue = []
      const obj: XMLSerializedValue = { [defTextKey]: result }
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const key = Object.keys(item)[0]
        switch (key) {
          case "@":
            const attrs = (item as AttrNode)["@"]
            const attrKeys = Object.keys(attrs)
            if (attrKeys.length === 1) {
              result.push({ [defAttrKey + attrKeys[0]]: attrs[attrKeys[0]] })
            } else {
              result.push({ [defAttrKey]: (item as AttrNode)["@"] })
            }
            break
          case "#":
            result.push({ [defTextKey]: (item as TextNode)["#"] })
            break
          case "!":
            result.push({ [defCommentKey]: (item as CommentNode)["!"] })
            break
          case "?":
            result.push({ [defInstructionKey]: (item as InstructionNode)["?"] })
            break
          case "$":
            result.push({ [defCdataKey]: (item as CDATANode)["$"] })
            break
          default:
            // element node
            const ele = item as ElementNode
            if (ele[key].length !== 0 && isArray(ele[key][0])) {
              // group of element nodes
              const eleGroup: XMLSerializedValue = []
              const listOfLists = ele[key] as NodeList[]
              for (let i = 0; i < listOfLists.length; i++) {
                eleGroup.push(this._process(listOfLists[i]))
              }
              result.push({ [key]: eleGroup })
            } else {
              // single element node
              result.push({ [key]: this._process(ele[key] as NodeList) })
            }
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
              obj[defAttrKey + attrKeys[0]] = attrs[attrKeys[0]]
            } else {
              obj[defAttrKey] = (item as AttrNode)["@"]
            }
            break
          case "#":
            const textKey = textCount > 1 ? defTextKey + (textId++).toString() : defTextKey
            obj[textKey] = (item as TextNode)["#"]
            break
          case "!":
            const commentKey = commentCount > 1 ? defCommentKey + (commentId++).toString() : defCommentKey
            obj[commentKey] = (item as CommentNode)["!"]
            break
          case "?":
            const instructionKey = instructionCount > 1 ? defInstructionKey + (instructionId++).toString() : defInstructionKey
            obj[instructionKey] = (item as InstructionNode)["?"]
            break
          case "$":
            const cdataKey = cdataCount > 1 ? defCdataKey + (cdataId++).toString() : defCdataKey
            obj[cdataKey] = (item as CDATANode)["$"]
            break
          default:
            // element node
            const ele = item as ElementNode
            if (ele[key].length !== 0 && isArray(ele[key][0])) {
              // group of element nodes
              const eleGroup: XMLSerializedValue = []
              const listOfLists = ele[key] as NodeList[]
              for (let i = 0; i < listOfLists.length; i++) {
                eleGroup.push(this._process(listOfLists[i]))
              }
              obj[key] = eleGroup
            } else {
              // single element node
              obj[key] = this._process(ele[key] as NodeList)
            }
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
        /* istanbul ignore else */
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
          lastItem["#"] = [lastItem["#"], value]
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
          lastItem["!"] = [lastItem["!"], value]
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
          lastItem["?"] = [lastItem["?"], value]
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
          lastItem["$"] = [lastItem["$"], value]
        }
      } else {
        items.push({ "$": value })
      }
    }
  }

  private _addElement(items: NodeList, name: string): NodeList {
    const childItems: NodeList = []
    if (items.length === 0) {
      items.push({ [name]: childItems })
    } else {
      const lastItem = items[items.length - 1]
      if (this._isElementNode(lastItem, name)) {
        if (lastItem[name].length !== 0 && isArray(lastItem[name][0])) {
          const listOfLists = lastItem[name] as NodeList[]
          listOfLists.push(childItems)
        } else {
          lastItem[name] = [lastItem[name] as NodeList, childItems]
        }
      } else {
        items.push({ [name]: childItems })
      }
    }
    return childItems
  }

  private _isAttrNode(x: any): x is AttrNode {
    return "@" in x
  }

  private _isTextNode(x: any): x is TextNode {
    return "#" in x
  }

  private _isCommentNode(x: any): x is CommentNode {
    return "!" in x
  }

  private _isInstructionNode(x: any): x is InstructionNode {
    return "?" in x
  }

  private _isCDATANode(x: any): x is CDATANode {
    return "$" in x
  }

  private _isElementNode(x: any, name: string): x is ElementNode {
    return name in x
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
