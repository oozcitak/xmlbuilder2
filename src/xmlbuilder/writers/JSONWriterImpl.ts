import {
  WriterOptions, XMLBuilderOptions, XMLSerializedValue
} from "../interfaces"
import { Node } from "../../dom/interfaces"
import {
  applyDefaults, isString, isMap, isArray, forEachObject,
  forEachArray, isObject, objectLength
} from "../../util"
import { MapWriterImpl } from "./MapWriterImpl"

/**
 * Represents JSON writer options.
 */
interface JSONWriterOptions {
  prettyPrint: boolean
  indent: string
  newline: string
  offset: number
  noDoubleEncoding: boolean
}

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
  serialize(node: Node, writerOptions?: WriterOptions): string {
    // provide default options
    const options: JSONWriterOptions = applyDefaults(writerOptions, {
      prettyPrint: false,
      indent: '  ',
      newline: '\n',
      offset: 0,
      noDoubleEncoding: false
    })

    const mapWriter = new MapWriterImpl(this._builderOptions)
    const obj = mapWriter.serialize(node, writerOptions)

    return this._beginLine(options, 0) + this._serializeObject(obj, options)
  }

  /**
   * Produces an XML serialization of the given object.
   * 
   * @param obj - object to serialize
   * @param options - serialization options
   */
  private _serializeObject(obj: XMLSerializedValue,
    options: JSONWriterOptions, level: number = 0): string {

    let markup = ''
    const isLeaf = this._isLeafNode(obj)

    if (isArray(obj)) {
      markup += '['
      const len = obj.length
      let i = 0
      for (const val of obj) {
        markup += this._endLine(options, level + 1) + 
          this._beginLine(options, level + 1) +
          this._serializeObject(val, options, level + 1)
        if (i < len - 1) { markup += ',' }
        i++
      }
      markup += this._endLine(options, level) + this._beginLine(options, level)
      markup += ']'
    } else if (isMap(obj) || isObject(obj)) {
      markup += '{'
      const len = objectLength(obj)
      let i = 0
      for (const [key, val] of forEachObject(obj)) {
        if (isLeaf && options.prettyPrint) {
          markup += ' '
        } else {
          markup += this._endLine(options, level + 1) + this._beginLine(options, level + 1)
        }
        markup += '"' + key + '":'
        if (options.prettyPrint) { markup += ' ' }
        markup += this._serializeObject(val, options, level + 1)
        if (i < len - 1) { markup += ',' }
        i++
      }
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
  private _beginLine(options: JSONWriterOptions, level: number): string {
    if (!options.prettyPrint) {
      return ''
    } else if (options.prettyPrint) {
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
  private _endLine(options: JSONWriterOptions, level: number): string {
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
  private _descendantCount(obj: any, count?: number): number {
    count = count || 0
    if (isArray(obj)) {
      for (const val of forEachArray(obj)) {
        count += this._descendantCount(val, count)
      }
    } else if (isMap(obj) || isObject(obj)) {
      for (const [, val] of forEachObject(obj)) {
        count += this._descendantCount(val, count)
      }
    } else {
      count++
    }
    return count
  }
}