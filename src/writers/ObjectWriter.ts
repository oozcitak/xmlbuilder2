import {
  ObjectWriterOptions, XMLSerializedAsObject, XMLSerializedAsObjectArray
} from "../interfaces"
import { applyDefaults, isArray, isString } from "@oozcitak/util"
import { Node, NodeType } from "@oozcitak/dom/lib/dom/interfaces"
import { BaseWriter } from "./BaseWriter"

/**
 * Serializes XML nodes into objects and arrays.
 */
export class ObjectWriter extends BaseWriter<ObjectWriterOptions, XMLSerializedAsObject | XMLSerializedAsObjectArray> {

  private _currentList!: NodeList
  private _currentIndex!: number
  private _listRegister!: NodeList[]

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - node to serialize
   * @param writerOptions - serialization options
   */
  serialize(node: Node, writerOptions?: ObjectWriterOptions): XMLSerializedAsObject | XMLSerializedAsObjectArray {
    const options = applyDefaults(writerOptions, {
      format: "object",
      wellFormed: false,
      noDoubleEncoding: false,
      group: false
    }) as Required<ObjectWriterOptions>

    this._currentList = []
    this._currentIndex = 0
    this._listRegister = [this._currentList]

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
    this.serializeNode(node, options.wellFormed, options.noDoubleEncoding)

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
    return this._process(this._currentList, options) as any
  }

  private _process(items: NodeList, options: Required<ObjectWriterOptions>): string | XMLSerializedAsObject | XMLSerializedAsObjectArray {
    if (items.length === 0) return {}

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
      const result: XMLSerializedAsObject | XMLSerializedAsObjectArray = []
      const obj: XMLSerializedAsObject | XMLSerializedAsObjectArray = { [defTextKey]: result }
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
              const eleGroup: XMLSerializedAsObjectArray = []
              const listOfLists = ele[key] as NodeList[]
              for (let i = 0; i < listOfLists.length; i++) {
                eleGroup.push(this._process(listOfLists[i], options) as any)
              }
              result.push({ [key]: eleGroup })
            } else {
              // single element node
              result.push({ [key]: this._process(ele[key] as NodeList, options) })
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
      const obj: XMLSerializedAsObject = {}
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const key = Object.keys(item)[0]
        switch (key) {
          case "@":
            const attrs = (item as AttrNode)["@"]
            const attrKeys = Object.keys(attrs)
            if (!options.group || attrKeys.length === 1) {
              for (const attrName in attrs) {
                obj[defAttrKey + attrName] = attrs[attrName]
              }
            } else {
              obj[defAttrKey] = attrs
            }
            break
          case "#":
            textId = this._processSpecItem((item as TextNode)["#"],
              obj as any, options.group, defTextKey,
              textCount, textId)
            break
          case "!":
            commentId = this._processSpecItem((item as CommentNode)["!"],
              obj as any, options.group, defCommentKey,
              commentCount, commentId)
            break
          case "?":
            instructionId = this._processSpecItem((item as InstructionNode)["?"],
              obj as any, options.group, defInstructionKey,
              instructionCount, instructionId)
            break
          case "$":
            cdataId = this._processSpecItem((item as CDATANode)["$"],
              obj as any, options.group, defCdataKey,
              cdataCount, cdataId)
            break
          default:
            // element node
            const ele = item as ElementNode
            if (ele[key].length !== 0 && isArray(ele[key][0])) {
              // group of element nodes
              const eleGroup: XMLSerializedAsObjectArray = []
              const listOfLists = ele[key] as NodeList[]
              for (let i = 0; i < listOfLists.length; i++) {
                eleGroup.push(this._process(listOfLists[i], options) as any)
              }
              obj[key] = eleGroup
            } else {
              // single element node
              obj[key] = this._process(ele[key] as NodeList, options)
            }
            break
        }
      }
      return obj
    }
  }

  private _processSpecItem(item: string | string[],
    obj: { [key: string]: string | string[] }, group: boolean, defKey: string,
    count: number, id: number): number {
    if (!group && isArray(item) && count + item.length > 2) {
      for (const subItem of item) {
        const key = defKey + (id++).toString()
        obj[key] = subItem
      }
    } else {
      const key = count > 1 ? defKey + (id++).toString() : defKey
      obj[key] = item
    }
    return id
  }

  /** @inheritdoc */
  beginElement(name: string) {
    const childItems: NodeList = []
    if (this._currentList.length === 0) {
      this._currentList.push({ [name]: childItems })
    } else {
      const lastItem = this._currentList[this._currentList.length - 1]
      if (this._isElementNode(lastItem, name)) {
        if (lastItem[name].length !== 0 && isArray(lastItem[name][0])) {
          const listOfLists = lastItem[name] as NodeList[]
          listOfLists.push(childItems)
        } else {
          lastItem[name] = [lastItem[name] as NodeList, childItems]
        }
      } else {
        this._currentList.push({ [name]: childItems })
      }
    }

    this._currentIndex++
    if (this._listRegister.length > this._currentIndex) {
      this._listRegister[this._currentIndex] = childItems
    } else {
      this._listRegister.push(childItems)
    }
    this._currentList = childItems
  }

  /** @inheritdoc */
  endElement() {
    this._currentList = this._listRegister[--this._currentIndex]
  }

  /** @inheritdoc */
  attribute(name: string, value: string) {
    if (this._currentList.length === 0) {
      this._currentList.push({ "@": { [name]: value } })
    } else {
      const lastItem = this._currentList[this._currentList.length - 1]
      /* istanbul ignore else */
      if (this._isAttrNode(lastItem)) {
        lastItem["@"][name] = value
      } else {
        this._currentList.push({ "@": { [name]: value } })
      }
    }
  }

  /** @inheritdoc */
  comment(data: string) {
    if (this._currentList.length === 0) {
      this._currentList.push({ "!": data })
    } else {
      const lastItem = this._currentList[this._currentList.length - 1]
      if (this._isCommentNode(lastItem)) {
        if (isArray(lastItem["!"])) {
          lastItem["!"].push(data)
        } else {
          lastItem["!"] = [lastItem["!"], data]
        }
      } else {
        this._currentList.push({ "!": data })
      }
    }
  }

  /** @inheritdoc */
  text(data: string) {
    if (this._currentList.length === 0) {
      this._currentList.push({ "#": data })
    } else {
      const lastItem = this._currentList[this._currentList.length - 1]
      if (this._isTextNode(lastItem)) {
        if (isArray(lastItem["#"])) {
          lastItem["#"].push(data)
        } else {
          lastItem["#"] = [lastItem["#"], data]
        }
      } else {
        this._currentList.push({ "#": data })
      }
    }
  }

  /** @inheritdoc */
  instruction(target: string, data: string) {
    const value = (data === "" ? target : target + " " + data)
    if (this._currentList.length === 0) {
      this._currentList.push({ "?": value })
    } else {
      const lastItem = this._currentList[this._currentList.length - 1]
      if (this._isInstructionNode(lastItem)) {
        if (isArray(lastItem["?"])) {
          lastItem["?"].push(value)
        } else {
          lastItem["?"] = [lastItem["?"], value]
        }
      } else {
        this._currentList.push({ "?": value })
      }
    }
  }

  /** @inheritdoc */
  cdata(data: string) {
    if (this._currentList.length === 0) {
      this._currentList.push({ "$": data })
    } else {
      const lastItem = this._currentList[this._currentList.length - 1]
      if (this._isCDATANode(lastItem)) {
        if (isArray(lastItem["$"])) {
          lastItem["$"].push(data)
        } else {
          lastItem["$"] = [lastItem["$"], data]
        }
      } else {
        this._currentList.push({ "$": data })
      }
    }
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

type AttrNode = { "@": { [key: string]: string } }
type TextNode = { "#": string | string[] }
type CommentNode = { "!": string | string[] }
type InstructionNode = { "?": string | string[] }
type CDATANode = { "$": string | string[] }
type NodeList = (ElementNode | AttrNode | TextNode | CommentNode |
  InstructionNode | CDATANode)[]
type ElementNode = { [key: string]: NodeList | NodeList[] }