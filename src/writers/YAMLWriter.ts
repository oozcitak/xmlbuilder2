import {
  YAMLWriterOptions, ObjectWriterOptions, XMLSerializedAsObject,
  XMLSerializedAsObjectArray
} from "../interfaces"
import { ObjectWriter } from "./ObjectWriter"
import {
  applyDefaults, isArray, isObject, forEachObject, forEachArray, isEmpty
} from "@oozcitak/util"
import { Node } from "@oozcitak/dom/lib/dom/interfaces"
import { BaseWriter } from "./BaseWriter"

/**
 * Serializes XML nodes into a YAML string.
 */
export class YAMLWriter extends BaseWriter<YAMLWriterOptions, string> {

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - node to serialize
   * @param writerOptions - serialization options
   */
  serialize(node: Node, writerOptions?: YAMLWriterOptions): string {
    // provide default options
    const options = applyDefaults(writerOptions, {
      wellFormed: false,
      noDoubleEncoding: false,
      indent: '  ',
      newline: '\n',
      offset: 0,
      group: false,
      verbose: false
    }) as Required<YAMLWriterOptions>

    if (options.indent.length < 2) {
      throw new Error("YAML indententation string must be at least two characters long.")
    }
    if (options.offset < 0) {
      throw new Error("YAML offset should be zero or a positive number.")
    }

    // convert to object
    const objectWriterOptions: ObjectWriterOptions = applyDefaults(options, {
      format: "object",
      wellFormed: false,
      noDoubleEncoding: false,
    })
    const objectWriter = new ObjectWriter(this._builderOptions)
    const val = objectWriter.serialize(node, objectWriterOptions)

    let markup = this._beginLine(options, 0) + '---' + this._endLine(options) +
      this._convertObject(val, options, 0)

    // remove trailing newline
    /* istanbul ignore else */
    if (markup.slice(-options.newline.length) === options.newline) {
      markup = markup.slice(0, -options.newline.length)
    }

    return markup
  }

  /**
   * Produces an XML serialization of the given object.
   * 
   * @param obj - object to serialize
   * @param options - serialization options
   * @param level - depth of the XML tree
   * @param indentLeaf - indents leaf nodes
   */
  private _convertObject(obj: XMLSerializedAsObject | XMLSerializedAsObjectArray,
    options: Required<YAMLWriterOptions>, level: number, suppressIndent: boolean = false): string {

    let markup = ''

    if (isArray(obj)) {
      for (const val of obj) {
        markup += this._beginLine(options, level, true)
        if (!isObject(val)) {
          markup += this._val(val) + this._endLine(options)
        } else if (isEmpty(val)) {
          markup += '""' + this._endLine(options)          
        } else {
          markup += this._convertObject(val, options, level, true)
        }
      }
    } else /* if (isObject(obj)) */ {
      forEachObject(obj, (key, val) => {
        if (suppressIndent) {
          markup += this._key(key)
          suppressIndent = false
        } else {
          markup += this._beginLine(options, level) + this._key(key)
        }
        if (!isObject(val)) {
          markup += ' ' + this._val(val) + this._endLine(options)
        } else if (isEmpty(val)) {
          markup += ' ""' + this._endLine(options)
        } else {
          markup += this._endLine(options) +
            this._convertObject(val, options, level + 1)
        }
      }, this)
    }
    return markup
  }


  /**
   * Produces characters to be prepended to a line of string in pretty-print
   * mode.
   * 
   * @param options - serialization options
   * @param level - current depth of the XML tree
   * @param isArray - whether this line is an array item
   */
  private _beginLine(options: Required<YAMLWriterOptions>, level: number, isArray: boolean = false): string {
    const indentLevel = options.offset + level + 1
    const chars = new Array(indentLevel).join(options.indent)
    if (isArray) {
      return chars.substr(0, chars.length - 2) + '-' + chars.substr(-1, 1)
    } else {
      return chars
    }
  }

  /**
   * Produces characters to be appended to a line of string in pretty-print
   * mode.
   * 
   * @param options - serialization options
   */
  private _endLine(options: Required<YAMLWriterOptions>): string {
    return options.newline
  }

  /**
   * Produces a YAML key string delimited with double quotes.
   */
  private _key(key: string): string {
    return "\"" + key + "\":"
  }

  /**
   * Produces a YAML value string delimited with double quotes.
   */
  private _val(val: string): string {
    return JSON.stringify(val)
  }

}