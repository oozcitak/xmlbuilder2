import {
  ObjectWriterOptions, XMLSerializedAsObject, XMLSerializedAsObjectArray,
  XMLBuilderOptions
} from "../interfaces"
import { applyDefaults, isArray, isString } from "@oozcitak/util"
import { Node, NodeType, Element } from "@oozcitak/dom/lib/dom/interfaces"
import { BaseWriter } from "./BaseWriter"

/**
 * Serializes XML nodes into objects and arrays.
 */
export class ObjectWriter extends BaseWriter<ObjectWriterOptions, XMLSerializedAsObject | XMLSerializedAsObjectArray> {

  private _result!: XMLSerializedAsObject
  private _nodeStatRegister: NodeStats[] = []
  private _resultRegister: string[] = []

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
  }

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - node to serialize
   */
  serialize(node: Node): XMLSerializedAsObject | XMLSerializedAsObjectArray {
    this._result = {}
    this.serializeNode(node, this._writerOptions.wellFormed, this._writerOptions.noDoubleEncoding)
    return this._result
  }

  /** @inheritdoc */
  beginElement(name: string) {
    // determine if there are non-unique element names
    // and non-consecutive nodes
    const namesSeen: { [key: string]: boolean } = {}
    let lastNodeType: NodeType | undefined
    const nodeStats: NodeStats = { '@': 1, '#': 1, '!': 1, '?': 1, '$': 1 }
    if ((this.currentNode as Element).attributes.length > 1) {
      nodeStats[NodeType.Attribute] = true
    }
    for (const childNode of this.currentNode.childNodes) {
      const nodeType = childNode.nodeType
      if (!nodeStats[NodeType.Element] && nodeType === NodeType.Element) {
        const name = childNode.nodeName
        if (namesSeen[name]) {
          nodeStats[NodeType.Element] = true
        } else {
          namesSeen[name] = true
        }
      }

      if (nodeType !== lastNodeType) {
        if (nodeStats[nodeType] === undefined) {
          // first time seeing this node type
          nodeStats[nodeType] = false
        } else if (nodeStats[nodeType] === false) {
          // second time seeing this node type
          // mark as non-consecutive node
          nodeStats[nodeType] = true
        }
      }
    }

    const result = this._resultRegister[this._resultRegister.length - 1]
    if (nodeStats[NodeType.Element]) {
      // non-unique element names
      this._resultRegister.push(name)
      const key = this._resultRegister.join('.')
      this._result[key] = {}
    } else {
      // unique element names
      this._resultRegister.push(name)
      const key = this._resultRegister.join('.')
      this._result[key] = {}
    }
    this._nodeStatRegister.push(nodeStats)
  }

  /** @inheritdoc */
  endElement() {
    this._resultRegister.pop()
    this._nodeStatRegister.pop()
  }

  /** @inheritdoc */
  attribute(name: string, value: string) {
    const resultKey = this._resultRegister.join('.')
    const obj = this._result[resultKey] as XMLSerializedAsObject
    const stat = this._nodeStatRegister[this._nodeStatRegister.length - 1]

    if (stat[NodeType.Element]) {
      // non-unique element names
      if (!stat[NodeType.Attribute]) {
        // single attribute
        obj[this._builderOptions.convert.att + name] = value
      } else {
        // multiple attributes
        const attObj = obj[this._builderOptions.convert.att] as XMLSerializedAsObject | undefined
        if (attObj) {
          attObj[name] = value
        } else {
          obj[this._builderOptions.convert.att] = { [name]: value }
        }
      }
    } else {
      // unique element names
      if (!this._writerOptions.group || !stat[NodeType.Attribute]) {
        // single attribute
        obj[this._builderOptions.convert.att + name] = value
      } else {
        // multiple attributes
        const attObj = obj[this._builderOptions.convert.att] as XMLSerializedAsObject | undefined
        if (attObj) {
          attObj[name] = value
        } else {
          obj[this._builderOptions.convert.att] = { [name]: value }
        }
      }
    }
  }
  
  private _pushContentNode(key: string, id: '@' | '#' | '!' | '?' | '$', data: string) {
    const resultKey = this._resultRegister.join('.')
    const obj = this._result[resultKey] as XMLSerializedAsObject
    const stat = this._nodeStatRegister[this._nodeStatRegister.length - 1]

    if (stat[NodeType.Element]) {
      // non-unique element names
      const contentObj = obj[this._builderOptions.convert.text] as XMLSerializedAsObjectArray | undefined
      if (contentObj) {
        const lastContentObj = contentObj[contentObj.length - 1] as XMLSerializedAsObject
        if (key in lastContentObj) {
          const val = lastContentObj[key]
          if (isString(val)) {
            lastContentObj[key] = [val, data]
          } else {
            (lastContentObj[key] as XMLSerializedAsObjectArray).push(data)
          }
        } else {
          lastContentObj[key] = data
        }
      } else {
        obj[this._builderOptions.convert.text] = [{ [key]: data }]
      }
    } else {
      // unique element names
      let nodeId = stat[id]
      const keys = Object.keys(obj)
      const lastKey = keys[keys.length - 1]
      if (lastKey.startsWith(key)) {
        const val = obj[lastKey]
        if (isString(val)) {
          obj[lastKey] = [val, data]
        } else {
          (obj[lastKey] as XMLSerializedAsObjectArray).push(data)
        }
      } else {
        obj[key + nodeId.toString()] = data
      }
      stat[id]++
    }
  }

  /** @inheritdoc */
  comment(data: string) {
    this._pushContentNode(this._builderOptions.convert.comment, '!', data)
  }

  /** @inheritdoc */
  text(data: string) {
    this._pushContentNode(this._builderOptions.convert.text, '#', data)
  }

  /** @inheritdoc */
  instruction(target: string, data: string) {
    const value = (data === "" ? target : target + " " + data)
    this._pushContentNode(this._builderOptions.convert.ins, '?', value)
  }

  /** @inheritdoc */
  cdata(data: string) {
    this._pushContentNode(this._builderOptions.convert.cdata, '$', data)
  }

}

type NodeStats = {
  // has non-unique element names
  [NodeType.Element]?: boolean
  // has multiple attributes
  [NodeType.Attribute]?: boolean
  // has non-consecutive text nodes
  [NodeType.Text]?: boolean
  // has non-consecutive comment nodes
  [NodeType.Comment]?: boolean
  // has non-consecutive instruction nodes
  [NodeType.ProcessingInstruction]?: boolean
  // has non-consecutive cdata nodes
  [NodeType.CData]?: boolean
  // attribute id
  '@': number
  // text id
  '#': number
  // comment id
  '!': number
  // instruction id
  '?': number
  // cdata id
  '$': number
  // unused
  [NodeType.EntityReference]?: boolean
  [NodeType.Entity]?: boolean
  [NodeType.Document]?: boolean
  [NodeType.DocumentType]?: boolean
  [NodeType.DocumentFragment]?: boolean
  [NodeType.Notation]?: boolean
}
