import {
  JSONWriterOptions, XMLBuilderOptions, XMLSerializedValue, ObjectWriterOptions
} from "../builder/interfaces"
import { ObjectWriterImpl } from "./ObjectWriterImpl"
import {
  applyDefaults, isArray, isObject, isMap, objectLength, forEachObject,
  forEachArray
} from "@oozcitak/util"
import { Node } from "@oozcitak/dom/lib/dom/interfaces"

/**
 * Serializes XML nodes into a JSON string.
 */
export class JSONWriterImpl {

  private _builderOptions: XMLBuilderOptions

  /**
   * Initializes a new instance of `JSONWriterImpl`.
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
  serialize(node: Node, writerOptions?: JSONWriterOptions): string {
    // provide default options
    const options = applyDefaults(writerOptions, {
      wellFormed: false,
      prettyPrint: false,
      indent: '  ',
      newline: '\n',
      offset: 0,
      group: true
    }) as Required<JSONWriterOptions>

    // convert to object
    const objectWriterOptions: ObjectWriterOptions = applyDefaults(options, {
      format: "object"
    })
    const objectWriter = new ObjectWriterImpl(this._builderOptions)
    const val = objectWriter.serialize(node, objectWriterOptions)

    // recursively convert object into JSON string
    return this._beginLine(options, 0) + this._convertObject(val, options)
  }

  /**
   * Produces an XML serialization of the given object.
   * 
   * @param obj - object to serialize
   * @param options - serialization options
   * @param level - depth of the XML tree
   */
  private _convertObject(obj: XMLSerializedValue,
    options: Required<JSONWriterOptions>, level: number = 0): string {

    let markup = ''
    const isLeaf = this._isLeafNode(obj)

    if (isArray(obj)) {
      markup += '['
      const len = obj.length
      let i = 0
      for (const val of obj) {
        markup += this._endLine(options, level + 1) + 
          this._beginLine(options, level + 1) +
          this._convertObject(val, options, level + 1)
        if (i < len - 1) { markup += ',' }
        i++
      }
      markup += this._endLine(options, level) + this._beginLine(options, level)
      markup += ']'
    } else if (isObject(obj)) {
      markup += '{'
      const len = objectLength(obj)
      let i = 0
      forEachObject(obj, (key, val) => {
        if (isLeaf && options.prettyPrint) {
          markup += ' '
        } else {
          markup += this._endLine(options, level + 1) + this._beginLine(options, level + 1)
        }
        markup += '"' + key + '":'
        if (options.prettyPrint) { markup += ' ' }
        markup += this._convertObject(val, options, level + 1)
        if (i < len - 1) { markup += ',' }
        i++
      }, this)
      if (isLeaf && options.prettyPrint) {
        markup += ' '
      } else {
        markup += this._endLine(options, level) + this._beginLine(options, level)
      }
      markup += '}'
    } else {
      markup += '"' + obj + '"'
    }
    return markup
  }


  /**
   * Produces characters to be prepended to a line of string in pretty-print
   * mode.
   * 
   * @param options - serialization options
   * @param level - current depth of the XML tree
   */
  private _beginLine(options: Required<JSONWriterOptions>, level: number): string {
    if (!options.prettyPrint) {
      return ''
    } else {
      const indentLevel = options.offset + level + 1
      if (indentLevel > 0) {
        return new Array(indentLevel).join(options.indent)
      }
    }

    return ''
  }

  /**
   * Produces characters to be appended to a line of string in pretty-print
   * mode.
   * 
   * @param options - serialization options
   * @param level - current depth of the XML tree
   */
  private _endLine(options: Required<JSONWriterOptions>, level: number): string {
    if (!options.prettyPrint) {
      return ''
    } else {
      return options.newline
    }
  }

  /**
   * Determines if an object is a leaf node.
   * 
   * @param obj 
   */
  private _isLeafNode(obj: any): boolean {
    return this._descendantCount(obj) <= 1
  }

  /**
   * Counts the number of descendants of the given object.
   * 
   * @param obj 
   * @param count 
   */
  private _descendantCount(obj: any, count: number = 0): number {
    if (isArray(obj)) {
      forEachArray(obj, val => count += this._descendantCount(val, count), this)
    } else if (isObject(obj)) {
      forEachObject(obj, (key, val) => count += this._descendantCount(val, count), this)
    } else {
      count++
    }
    return count
  }
}