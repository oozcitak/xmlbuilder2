import {
  MapWriterOptions, ObjectWriterOptions, XMLSerializedAsMap, 
  XMLSerializedAsMapArray
} from "../interfaces"
import { applyDefaults, isArray, isObject } from "@oozcitak/util"
import { Node } from "@oozcitak/dom/lib/dom/interfaces"
import { ObjectWriter } from "./ObjectWriter"
import { BaseWriter } from "./BaseWriter"

/**
 * Serializes XML nodes into ES6 maps and arrays.
 */
export class MapWriter extends BaseWriter<MapWriterOptions, XMLSerializedAsMap | XMLSerializedAsMapArray> {

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - node to serialize
   * @param writerOptions - serialization options
   */
  serialize(node: Node, writerOptions?: MapWriterOptions): XMLSerializedAsMap | XMLSerializedAsMapArray {
    const options: MapWriterOptions = applyDefaults(writerOptions, {
      format: "map",
      wellFormed: false,
      group: false
    })

    // convert to object
    const objectWriterOptions: ObjectWriterOptions = applyDefaults(options, {
      format: "object",
      wellFormed: false
    })
    const objectWriter = new ObjectWriter(this._builderOptions)
    const val = objectWriter.serialize(node, objectWriterOptions)

    // recursively convert object into Map
    return this._convertObject(val)
  }

  /**
   * Recursively converts a JS object into an ES5 map.
   * 
   * @param obj - a JS object
   */
  _convertObject(obj: any): any {
    if (isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        obj[i] = this._convertObject(obj[i])
      }
      return obj as any
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
