import { XMLBuilder, ExpandObject } from "../interfaces"
import {
  isArray, isString, isFunction, forEachArray, isSet, isMap, isObject,
  forEachObject, isEmpty
} from "@oozcitak/util"
import { BaseReader } from "./BaseReader"

/**
 * Parses XML nodes from objects and arrays.
 * ES6 maps and sets are also supoorted.
 */
export class ObjectReader extends BaseReader<ExpandObject> {

  /**
   * Parses the given document representation.
   * 
   * @param node - node receive parsed XML nodes
   * @param obj - object to parse
   */
  _parse(node: XMLBuilder, obj: ExpandObject): XMLBuilder {

    const options = this._builderOptions

    let lastChild: XMLBuilder | null = null

    if (isFunction(obj)) {
      // evaluate if function
      lastChild = this.parse(node, obj.apply(this))
    } else if (isArray(obj) || isSet(obj)) {
      forEachArray(obj, item => lastChild = this.parse(node, item), this)
    } else if (isMap(obj) || isObject(obj)) {
      // expand if object
      forEachObject(obj, (key, val) => {
        if (isFunction(val)) {
          // evaluate if function
          val = val.apply(this)
        }

        if (!options.ignoreConverters && key.indexOf(options.convert.att) === 0) {
          // assign attributes
          if (key === options.convert.att) {
            if (isArray(val) || isSet(val)) {
              throw new Error("Invalid attribute: " + val.toString() + ". " + (node as any)._debugInfo())
            } else /* if (isMap(val) || isObject(val)) */ {
              forEachObject(val, (attrKey, attrVal) => {
                lastChild = this.attribute(node, undefined,
                  this.sanitize(attrKey), this._decodeAttributeValue(this.sanitize(attrVal as string))) || lastChild
              })
            }
          } else {
            lastChild = this.attribute(node, undefined,
              this.sanitize(key.substr(options.convert.att.length)),
              this._decodeAttributeValue(this.sanitize(val))) || lastChild
          }
        } else if (!options.ignoreConverters && key.indexOf(options.convert.text) === 0) {
          // text node
          if (isMap(val) || isObject(val)) {
            // if the key is #text expand child nodes under this node to support mixed content
            lastChild = this.parse(node, val)
          } else {
            lastChild = this.text(node, this._decodeText(this.sanitize(val))) || lastChild
          }
        } else if (!options.ignoreConverters && key.indexOf(options.convert.cdata) === 0) {
          // cdata node
          if (isArray(val) || isSet(val)) {
            forEachArray(val, item => lastChild = this.cdata(node, this.sanitize(item)) || lastChild, this)
          } else {
            lastChild = this.cdata(node, this.sanitize(val)) || lastChild
          }
        } else if (!options.ignoreConverters && key.indexOf(options.convert.comment) === 0) {
          // comment node
          if (isArray(val) || isSet(val)) {
            forEachArray(val, item => lastChild = this.comment(node, this.sanitize(item)) || lastChild, this)
          } else {
            lastChild = this.comment(node, this.sanitize(val)) || lastChild
          }
        } else if (!options.ignoreConverters && key.indexOf(options.convert.ins) === 0) {
          // processing instruction
          if (isString(val)) {
            const insIndex = val.indexOf(' ')
            const insTarget = (insIndex === -1 ? val : val.substr(0, insIndex))
            const insValue = (insIndex === -1 ? '' : val.substr(insIndex + 1))
            lastChild = this.instruction(node, this.sanitize(insTarget), this.sanitize(insValue)) || lastChild
          } else if (isArray(val) || isSet(val)) {
            forEachArray(val, item => {
              const insIndex = item.indexOf(' ')
              const insTarget = (insIndex === -1 ? item : item.substr(0, insIndex))
              const insValue = (insIndex === -1 ? '' : item.substr(insIndex + 1))
              lastChild = this.instruction(node, this.sanitize(insTarget), this.sanitize(insValue)) || lastChild
            }, this)
          } else /* if (isMap(target) || isObject(target)) */ {
            forEachObject(val, (insTarget, insValue) => lastChild = this.instruction(node,
              this.sanitize(insTarget),
              this.sanitize(insValue as string)) || lastChild, this)
          }
        } else if ((isArray(val) || isSet(val)) && isEmpty(val)) {
          // skip empty arrays
        } else if ((isMap(val) || isObject(val)) && isEmpty(val)) {
          // empty objects produce one node
          lastChild = this.element(node, undefined, this.sanitize(key)) || lastChild
        } else if (!options.keepNullNodes && (val == null)) {
          // skip null and undefined nodes
        } else if (isArray(val) || isSet(val)) {
          // expand list by creating child nodes
          forEachArray(val, item => {
            const childNode: { [key: string]: any } = {}
            childNode[key] = item
            lastChild = this.parse(node, childNode)
          }, this)
        } else if (isMap(val) || isObject(val)) {
          // create a parent node
          const parent = this.element(node, undefined, this.sanitize(key))
          if (parent) {
            lastChild = parent
            // expand child nodes under parent
            this.parse(parent, val)
          }
        } else if (val != null && val !== '') {
          // leaf element node with a single text node
          const parent = this.element(node, undefined, this.sanitize(key))
          if (parent) {
            lastChild = parent
            this.text(parent, this._decodeText(this.sanitize(val)))
          }
        } else {
          // leaf element node
          lastChild = this.element(node, undefined, this.sanitize(key)) || lastChild
        }
      }, this)
    } else if (!options.keepNullNodes && (obj == null)) {
      // skip null and undefined nodes
    } else {
      // text node
      lastChild = this.text(node, this._decodeText(this.sanitize(obj))) || lastChild
    }

    return lastChild || node
  }

}
