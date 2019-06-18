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

  static printMap(map: any, level: number = 0): string {

    const indent = (indentLevel: number): string => '  '.repeat(indentLevel)

    let r = ''
    if (isMap(map)) {
      r += '{'
      const len = map.size
      let i = 0
      for (const [key, val] of map) {
        r += '\n' + indent(level + 1) + key + ': ' + TestHelpers.printMap(val, level + 1)
        if (i < len - 1) { r += ',' }
        i++
      }
      r += '\n' + indent(level) + '}'
    } else if (isArray(map)) {
      r += '['
      const len = map.length
      let i = 0      
      for (const val of map) {
        r += '\n' + indent(level + 1) + TestHelpers.printMap(val, level + 1)
        if (i < len - 1) { r += ',' }
        i++
      }
      r += '\n' + indent(level) + ']'
    } else if (isObject(map)) {
      r += '{'
      const len = map.size
      let i = 0
      for (const [key, val] of Object.entries(map)) {
        r += '\n' + indent(level + 1) + key + ': ' + TestHelpers.printMap(val, level + 1)
        if (i < len - 1) { r += ',' }
        i++
      }
      r += '\n' + indent(level) + '}'
    } else {
      r += map
    }
    return r
  }
}