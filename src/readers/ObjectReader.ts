import { XMLBuilder, ExpandObject, XMLBuilderOptions } from "../interfaces"
import {
  isArray, isString, isFunction, forEachArray, isSet, isMap, isObject,
  forEachObject, isEmpty
} from "@oozcitak/util"
import { XMLBuilderImpl } from "../builder/XMLBuilderImpl"

/**
 * Parses XML nodes from objects and arrays.
 * ES6 maps and sets are laso suupoted.
 */
export class ObjectReader {

  /**
   * Parses the given document represenatation.
   * 
   * @param node - node receive parsed XML nodes
   * @param obj - object to parse
   */
  parse(node: XMLBuilder, obj: ExpandObject): XMLBuilder {

    const options = (node as any)._options as XMLBuilderOptions

    let lastChild: XMLBuilder | null = null

    if (isFunction(obj)) {
      // evaluate if function
      lastChild = node.ele(obj.apply(this))
    } else if (isArray(obj) || isSet(obj)) {
      forEachArray(obj, item => lastChild = node.ele(item), this)
    } else /* if (isMap(obj) || isObject(obj)) */ {
      // expand if object
      forEachObject(obj, (key, val) => {
        if (isFunction(val)) {
          // evaluate if function
          val = val.apply(this)
        }

        if (!options.ignoreConverters && key.indexOf(options.convert.att) === 0) {
          // assign attributes
          if (key === options.convert.att) {
            lastChild = node.att(val)
          } else {
            lastChild = node.att(key.substr(options.convert.att.length), val)
          }
        } else if (!options.ignoreConverters && key.indexOf(options.convert.text) === 0) {
          // text node
          if (isMap(val) || isObject(val)) {
            // if the key is #text expand child nodes under this node to support mixed content
            lastChild = node.ele(val)
          } else {
            lastChild = node.txt(val)
          }
        } else if (!options.ignoreConverters && key.indexOf(options.convert.cdata) === 0) {
          // cdata node
          if (isArray(val) || isSet(val)) {
            forEachArray(val, item => lastChild = node.dat(item), this)
          } else {
            lastChild = node.dat(val)
          }
        } else if (!options.ignoreConverters && key.indexOf(options.convert.comment) === 0) {
          // comment node
          if (isArray(val) || isSet(val)) {
            forEachArray(val, item => lastChild = node.com(item), this)
          } else {
            lastChild = node.com(val)
          }
        } else if (!options.ignoreConverters && key.indexOf(options.convert.ins) === 0) {
          // processing instruction
          if (isString(val)) {
            const insIndex = val.indexOf(' ')
            const insTarget = (insIndex === -1 ? val : val.substr(0, insIndex))
            const insValue = (insIndex === -1 ? '' : val.substr(insIndex + 1))
            lastChild = node.ins(insTarget, insValue)
          } else {
            lastChild = node.ins(val)
          }
        } else if ((isArray(val) || isSet(val)) && isEmpty(val)) {
          // skip empty arrays
          lastChild = this._dummy(node)
        } else if ((isMap(val) || isObject(val)) && isEmpty(val)) {
          // empty objects produce one node
          lastChild = node.ele(key)
        } else if (!options.keepNullNodes && (val == null)) {
          // skip null and undefined nodes
          lastChild = this._dummy(node)
        } else if (isArray(val) || isSet(val)) {
          // expand list by creating child nodes
          forEachArray(val, item => {
            const childNode: { [key: string]: any } = {}
            childNode[key] = item
            lastChild = node.ele(childNode)
          }, this)
        } else if (isMap(val) || isObject(val)) {
          // create a parent node
          lastChild = node.ele(key)

          // expand child nodes under parent
          lastChild.ele(val)
        } else if (val != null && val !== '') {
          // leaf element node with a single text node
          lastChild = node.ele(key)
          lastChild.txt(val)
        } else {
          // leaf element node
          lastChild = node.ele(key)
        }
      }, this)
    }

    if (lastChild === null) {
      throw new Error("Could not create any elements with: " + obj.toString() + ". " + (node as any)._debugInfo())
    }

    return lastChild
  }

  /**
   * Creates a dummy element node without adding it to the list of child nodes.
   * 
   * Dummy nodes are special nodes representing a node with a `null` value. 
   * Dummy nodes are created while recursively building the XML tree. Simply
   * skipping `null` values doesn't work because that would break the recursive
   * chain.
   * 
   * @returns the new dummy element node
   */
  private _dummy(node: XMLBuilder): XMLBuilder {
    return new XMLBuilderImpl((node as any)._doc.createElement('dummy_node'))
  }
}
