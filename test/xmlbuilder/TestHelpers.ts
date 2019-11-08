import TestHelpersRoot from "../TestHelpers"
import { serializer } from '@oozcitak/dom'
import { isObject, isArray, isMap } from '@oozcitak/util'
import { XMLBuilderImpl } from '../../src/xmlbuilder'
import { XMLBuilderCreateOptions } from "../../src/xmlbuilder/interfaces"

export default class TestHelpers extends TestHelpersRoot {
  static xml(options?: XMLBuilderCreateOptions): XMLBuilderImpl {
    return new XMLBuilderImpl(options) 
  }
  static serialize(node: any): string {
    const s = new serializer.XMLSerializer()
    return s.serializeToString(node)
  }

  private static indent(indentLevel: number): string { 
    return '  '.repeat(indentLevel) 
  }
  private static isLeafNode(obj: any): boolean {
    return this.descendantCount(obj) <= 1
  }
  private static descendantCount(obj: any, count?: number): number {
    count = count || 0
    if (isArray(obj)) {
      for (const val of obj) {
        count += this.descendantCount(val, count)
      }
    } else if (isMap(obj)) {
      for (const val of obj.values()) {
        count += this.descendantCount(val, count)
      }
    } else if (isObject(obj)) {
      for (const key of Object.keys(obj)) {
        const val = obj[key]
        count += this.descendantCount(val, count)
      }
    } else {
      count++
    }
    return count
  }

  static printMap(map: any, level: number = 0): string {

    let r = ''
    const leaf = TestHelpers.isLeafNode(map)

    if (isMap(map)) {
      r += '{'
      const len = map.size
      let i = 0
      for (const [key, val] of map) {
        r += (leaf ? ' ' : '\n' + TestHelpers.indent(level + 1)) + key + ': ' + TestHelpers.printMap(val, level + 1)
        if (i < len - 1) { r += ',' }
        i++
      }
      r += (leaf ? ' ' : '\n' + TestHelpers.indent(level)) + '}'
    } else if (isArray(map)) {
      r += '['
      const len = map.length
      let i = 0      
      for (const val of map) {
        r += (leaf ? ' ' : '\n' + TestHelpers.indent(level + 1)) + TestHelpers.printMap(val, level + 1)
        if (i < len - 1) { r += ',' }
        i++
      }
      r += (leaf ? ' ' : '\n' + TestHelpers.indent(level)) + ']'
    } else if (isObject(map)) {
      r += '{'
      const len = Object.keys(map).length
      let i = 0
      for (const [key, val] of Object.entries(map)) {
        r += (leaf ? ' ' : '\n' + TestHelpers.indent(level + 1)) + key + ': ' + TestHelpers.printMap(val, level + 1)
        if (i < len - 1) { r += ',' }
        i++
      }
      r += (leaf ? ' ' : '\n' + TestHelpers.indent(level)) + '}'
    } else {
      r += map
    }
    return r
  }
}