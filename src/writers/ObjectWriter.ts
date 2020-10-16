import {
  ObjectWriterOptions, XMLSerializedAsObject, XMLSerializedAsObjectArray,
  XMLBuilderOptions
} from "../interfaces"
import { applyDefaults, isArray, isString } from "@oozcitak/util"
import { Node, NodeType } from "@oozcitak/dom/lib/dom/interfaces"
import { BaseWriter } from "./BaseWriter"

/**
 * Serializes XML nodes into objects and arrays.
 */
export class ObjectWriter extends BaseWriter<ObjectWriterOptions, XMLSerializedAsObject> {

  private _currentList!: NodeList
  private _currentIndex!: number
  private _listRegister!: NodeList[]
  protected _contentNodeKeys: { [key: string]: undefined }

  /**
   * Initializes a new instance of `ObjectWriter`.
   * 
   * @param builderOptions - XML builder options
   * @param writerOptions - serialization options
   */
  constructor(builderOptions: XMLBuilderOptions, writerOptions: ObjectWriterOptions) {
    super(builderOptions)
    this._writerOptions = applyDefaults(writerOptions, {
      format: "object",
      wellFormed: false,
      noDoubleEncoding: false,
      group: false,
      verbose: false
    }) as Required<ObjectWriterOptions>

    this._contentNodeKeys = {
      [builderOptions.convert.text]: undefined,
      [builderOptions.convert.cdata]: undefined,
      [builderOptions.convert.comment]: undefined,
      [builderOptions.convert.ins]: undefined
    }
  }

  /** @inheritdoc */
  serialize(node: Node): XMLSerializedAsObject {
    /**
     * Document is serialized in two passes. First pass serializes DOM nodes
     * into lists of node values grouped under node types while preserving
     * insertion order. Seconds pass compacts these node lists.
     * 
     * For example:
     * 
     * <root>
     *   <node att1="val1" att2="val2">
     *     node text
     *     <childNode/>
     *     more text
     *   </node>
     *   <node att="val">
     *     text line1
     *     text line2
     *   </node>
     * </root>
     * 
     * First pass serializes the document into node lists:
     * 
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
     * 
     * Second pass processes node lists. Above becomes:
     * 
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

    this._currentList = []
    this._currentIndex = 0
    this._listRegister = [this._currentList]

    this._serializeDOMNode(node)
    return this._process(this._currentList as any) as any
  }

  /** @inheritdoc */
  _appendMarkup(markup: XMLSerializedAsObject | undefined): void {
    if (markup === undefined) {
      return
    }

    const key = Object.keys(markup)[0]
    if (key === this._builderOptions.convert.att) {
      // attributes create an object of attribute key/values
      // markup should be { @: { name1: value1, name2: value2, ... } }
      if (this._currentList.length === 0) {
        this._currentList.push(markup as any)
      } else {
        const lastItem = this._currentList[this._currentList.length - 1]
        if (key in lastItem) {
          // lastItem[@] === { name1: value1, name2: value2, ... }
          Object.assign(lastItem[key], markup[key])
        } else {
          this._currentList.push(markup as any)
        }
      }
    } else {
      // content nodes create an object with object key/array of object values
      // markup should be { "$": value }, { "#": value }, ...
      if (this._currentList.length === 0) {
        this._currentList.push(markup as any)
      } else {
        const lastItem = this._currentList[this._currentList.length - 1]
        if (key in lastItem) {
          const arrayOrValue = lastItem[key]
          if (isArray(arrayOrValue)) {
            arrayOrValue.push(markup[key] as any)
          } else {
            lastItem[key] = [lastItem[key], markup[key] as any]
          }
        } else {
          this._currentList.push(markup as any)
        }
      }

      // an element node { [element name]: [list of child nodes] }
      if (!(key in this._contentNodeKeys)) {
        const childItems = markup[key]
        this._currentIndex++
        if (this._listRegister.length > this._currentIndex) {
          this._listRegister[this._currentIndex] = childItems as any
        } else {
          this._listRegister.push(childItems as any)
        }
        this._currentList = childItems as any
      }
    }
  }

  private _process(items: NodeList): string | XMLSerializedAsObject | XMLSerializedAsObjectArray {
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
        case this._builderOptions.convert.att:
          continue
        case this._builderOptions.convert.text:
          textCount++
          break
        case this._builderOptions.convert.comment:
          commentCount++
          break
        case this._builderOptions.convert.ins:
          instructionCount++
          break
        case this._builderOptions.convert.cdata:
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

    if (textCount === 1 && items.length === 1 && isString((items[0] as TextNode)[this._builderOptions.convert.text])) {
      // special case of an element node with a single text node
      return (items[0] as TextNode)[this._builderOptions.convert.text]
    } else if (hasNonUniqueNames) {
      const obj: XMLSerializedAsObject | XMLSerializedAsObjectArray = {}
      // process attributes first
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const key = Object.keys(item)[0]
        if (key === this._builderOptions.convert.att) {
          const attrs = (item as AttrNode)[this._builderOptions.convert.att]
          const attrKeys = Object.keys(attrs)
          if (attrKeys.length === 1) {
            obj[defAttrKey + attrKeys[0]] = attrs[attrKeys[0]]
          } else {
            obj[defAttrKey] = (item as AttrNode)[this._builderOptions.convert.att]
          }
        }
      }
      // list contains element nodes with non-unique names
      // return an array with mixed content notation
      const result: XMLSerializedAsObject | XMLSerializedAsObjectArray = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const key = Object.keys(item)[0]
        switch (key) {
          case this._builderOptions.convert.att:
            // attributes were processed above
            break
          case this._builderOptions.convert.text:
            result.push({ [defTextKey]: (item as TextNode)[this._builderOptions.convert.text] })
            break
          case this._builderOptions.convert.comment:
            result.push({ [defCommentKey]: (item as TextNode)[this._builderOptions.convert.comment] })
            break
          case this._builderOptions.convert.ins:
            result.push({ [defInstructionKey]: (item as TextNode)[this._builderOptions.convert.ins] })
            break
          case this._builderOptions.convert.comment:
            result.push({ [defCdataKey]: (item as TextNode)[this._builderOptions.convert.cdata] })
            break
          default:
            // element node
            const ele = item as ElementNode
            if (ele[key].length !== 0 && isArray(ele[key][0])) {
              // group of element nodes
              const eleGroup: XMLSerializedAsObjectArray = []
              const listOfLists = ele[key] as NodeList[]
              for (let i = 0; i < listOfLists.length; i++) {
                eleGroup.push(this._process(listOfLists[i]) as any)
              }
              result.push({ [key]: eleGroup })
            } else {
              // single element node
              if (this._writerOptions.verbose) {
                result.push({ [key]: [this._process(ele[key] as NodeList) as any] })
              } else {
                result.push({ [key]: this._process(ele[key] as NodeList) })
              }
            }
            break
        }
      }
      obj[defTextKey] = result
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
          case this._builderOptions.convert.att:
            const attrs = (item as AttrNode)[this._builderOptions.convert.att]
            const attrKeys = Object.keys(attrs)
            if (!this._writerOptions.group || attrKeys.length === 1) {
              for (const attrName in attrs) {
                obj[defAttrKey + attrName] = attrs[attrName]
              }
            } else {
              obj[defAttrKey] = attrs
            }
            break
          case this._builderOptions.convert.text:
            textId = this._processSpecItem((item as TextNode)[this._builderOptions.convert.text],
              obj as any, defTextKey,
              textCount, textId)
            break
          case this._builderOptions.convert.comment:
            commentId = this._processSpecItem((item as TextNode)[this._builderOptions.convert.comment],
              obj as any, defCommentKey,
              commentCount, commentId)
            break
          case this._builderOptions.convert.ins:
            instructionId = this._processSpecItem((item as TextNode)[this._builderOptions.convert.ins],
              obj as any, defInstructionKey,
              instructionCount, instructionId)
            break
          case this._builderOptions.convert.cdata:
            cdataId = this._processSpecItem((item as TextNode)[this._builderOptions.convert.cdata],
              obj as any, defCdataKey,
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
                eleGroup.push(this._process(listOfLists[i]) as any)
              }
              obj[key] = eleGroup
            } else {
              // single element node
              if (this._writerOptions.verbose) {
                obj[key] = [this._process(ele[key] as NodeList) as any]
              } else {
                obj[key] = this._process(ele[key] as NodeList)
              }
            }
            break
        }
      }
      return obj
    }
  }

  private _processSpecItem(item: string | string[],
    obj: { [key: string]: string | string[] }, defKey: string,
    count: number, id: number): number {
    if (!this._writerOptions.group && isArray(item) && count + item.length > 2) {
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
  beginElement(name: string): XMLSerializedAsObject | undefined {
    return { [name]: [] }
  }

  /** @inheritdoc */
  endElement(name: string): XMLSerializedAsObject | undefined {
    this._currentList = this._listRegister[--this._currentIndex]
    return undefined
  }

  /** @inheritdoc */
  attribute(name: string, value: string): XMLSerializedAsObject | undefined {
    return { [this._builderOptions.convert.att]: { [name]: value } }
  }

  /** @inheritdoc */
  comment(data: string): XMLSerializedAsObject | undefined {
    return { [this._builderOptions.convert.comment]: data }
  }

  /** @inheritdoc */
  text(data: string): XMLSerializedAsObject | undefined {
    return { [this._builderOptions.convert.text]: data }
  }

  /** @inheritdoc */
  instruction(target: string, data: string): XMLSerializedAsObject | undefined {
    return { [this._builderOptions.convert.ins]: (data === "" ? target : target + " " + data) }
  }

  /** @inheritdoc */
  cdata(data: string): XMLSerializedAsObject | undefined {
    return { [this._builderOptions.convert.cdata]: data }
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

// Represents a object of attribute node
type AttrNode = { [key: string]: { [key: string]: string } }
// Represents a text, comment, PI o CData node, or an array of those
type TextNode = { [key: string]: string | string[] }
// Represents an element node or an array of element nodes with the same name
type ElementNode = { [key: string]: NodeList | NodeList[] }
// Represents an array of child nodes
type NodeList = (ElementNode | AttrNode | TextNode)[]
