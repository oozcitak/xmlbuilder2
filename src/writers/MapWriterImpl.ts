import {
  XMLSerializedValue, MapWriterOptions, XMLBuilderOptions, ObjectWriterOptions
} from "../interfaces"
import { applyDefaults, isArray, isObject, isMap, isPlainObject } from "@oozcitak/util"
import { Node } from "@oozcitak/dom/lib/dom/interfaces"
import { ObjectWriterImpl } from "./ObjectWriterImpl"

type AttrNode = { "@": { [key: string]: string } }
type TextNode = { "#": string | string[] }
type CommentNode = { "!": string | string[] }
type InstructionNode = { "?": string | string[] }
type CDATANode = { "$": string | string[] }
type NodeList = (ElementNode | AttrNode | TextNode | CommentNode |
  InstructionNode | CDATANode)[]
type ElementNode = { [key: string]: NodeList | NodeList[] }

/**
 * Serializes XML nodes into ES6 maps and arrays.
 */
export class MapWriterImpl {

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
  serialize(node: Node, writerOptions?: MapWriterOptions): XMLSerializedValue {
    const options: MapWriterOptions = applyDefaults(writerOptions, {
      format: "map",
      wellFormed: false,
      group: true
    })

    // convert to object
    const objectWriterOptions: ObjectWriterOptions = applyDefaults(options, {
      format: "object",
      wellFormed: false
    })
    const objectWriter = new ObjectWriterImpl(this._builderOptions)
    const val = objectWriter.serialize(node, objectWriterOptions)

    // recursively convert object into Map
    return this._convertObject(val)
  }

  _convertObject(obj: XMLSerializedValue): XMLSerializedValue {
    if (isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        obj[i] = this._convertObject(obj[i])
      }
      return obj
    } else if (isObject(obj)) {
      const map = new Map()
      for (const key in obj) {
        map.set(key, this._convertObject((obj as any)[key]))
      }
      return map
    } else {
      return obj
    }
  }

}
