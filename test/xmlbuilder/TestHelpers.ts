import TestHelpersRoot from "../TestHelpers"
import { XMLSerializer } from '../../src/dom/serializer'
import { withOptions, create, parse, fragment } from '../../src/xmlbuilder'
import { isMap, isArray, isObject, isEmpty } from "../../src/util"

export default class TestHelpers extends TestHelpersRoot {
  static withOptions = withOptions
  static create = create
  static fragment = fragment
  static parse = parse
  static serialize(node: any): string {
    const serializer = new XMLSerializer()
    return serializer.serializeToString(node)
  }

  static printMap(map: any, level: number = 1): string {

    const indent = (indentLevel: number): string => new Array(indentLevel).join('  ')

    let r = ''
    if (isMap(map)) {
      r += '{\n'
      const len = map.size
      let i = 0
      for (const [key, val] of map) {
        r += indent(level + 1) + key + ': ' + TestHelpers.printMap(val, level + 1)
        if (i < len - 1) { r += ',\n' }
        i++
      }
      r += indent(level) + '}'
    } else if (isArray(map)) {
      r += '[\n'
      for (const val of map) {
        r += indent(level + 1) + TestHelpers.printMap(val, level + 1) + '\n'
      }
      r += indent(level) + ']\n'
    } else if (isObject(map)) {
      r += '{\n'
      for (const [key, val] of Object.entries(map)) {
        r += indent(level + 1) + key + ': ' + TestHelpers.printMap(val, level + 1) + '\n'
      }
      r += indent(level) + '}\n'
    } else {
      r += map
    }
    return r
  }
}