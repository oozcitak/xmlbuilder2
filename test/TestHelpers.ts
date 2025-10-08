import { suite, test } from "node:test"
import { deepEqual, notDeepEqual, throws, doesNotThrow } from "node:assert"
import dedent from "dedent"
import { XMLSerializer } from "@oozcitak/dom/lib/serializer"
import { Node } from "@oozcitak/dom/lib/dom/interfaces"
import { isObject, isArray, isMap, forEachObject, objectLength, forEachArray } from "@oozcitak/util"
import { builder, create, fragment, convert, createCB, fragmentCB } from "../src"
import { XMLBuilderCB, XMLBuilderCBOptions, XMLBuilderCBCreateOptions } from "../src/interfaces"

export default class TestHelpers {
  suite = suite
  test = test

  deepEqual = deepEqual
  notDeepEqual = notDeepEqual
  throws = throws
  doesNotThrow = doesNotThrow

  static builder = builder
  static create = create
  static fragment = fragment
  static convert = convert

  static serialize(node: Node): string {
    const s = new XMLSerializer()
    return s.serializeToString(node)
  }

  static createCB(options?: XMLBuilderCBCreateOptions): XMLBuilderCB {
    options = options || {}
    options.data = options.data || (function (this: any, chunk: string) {
      if (this.result === undefined) this.result = ""
      this.result += chunk
    })
    options.end = options.end || (() => { })
    options.error = options.error || (function (this: any, err: Error) {
      this.error = err
    })
    const str = createCB(options as XMLBuilderCBOptions) as any
    str.error = "Did not throw"
    return str
  }

  static fragmentCB(options?: XMLBuilderCBCreateOptions): XMLBuilderCB {
    options = options || {}
    options.data = options.data || (function (this: XMLBuilderCB, chunk: string) {
      (this as any).result += chunk
    })
    options.end = options.end || (() => { })
    options.error = options.error || (function (this: XMLBuilderCB, err: Error) {
      str.error = err
    })
    const str = fragmentCB(options as XMLBuilderCBOptions) as any
    str.error = "Did not throw"
    str.result = ""
    return str
  }

  static expectCBResult(str: XMLBuilderCB, result: string, done: any) {
    deepEqual((str as any).result, result)
    done()
  }

  static getCBResult(str: XMLBuilderCB) {
    return (str as any).result
  }

  static expectCBError(str: XMLBuilderCB, testFunc: () => any, done: any) {
    testFunc()
    const test = (str as any).error instanceof Error
    deepEqual(test , true)
    done()
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

    if (isArray(map)) {
      r += '['
      const len = map.length
      let i = 0
      forEachArray(map, val => {
        r += (leaf ? ' ' : '\n' + TestHelpers.indent(level + 1)) + TestHelpers.printMap(val, level + 1)
        if (i < len - 1) { r += ',' }
        i++
      })
      r += (leaf ? ' ' : '\n' + TestHelpers.indent(level)) + ']'
    } else if (isMap(map) || isObject(map)) {
      r += isMap(map) ? 'M{' : '{'
      const len = objectLength(map)
      let i = 0
      forEachObject(map, (key, val) => {
        r += (leaf ? ' ' : '\n' + TestHelpers.indent(level + 1)) + key + ': ' + TestHelpers.printMap(val, level + 1)
        if (i < len - 1) { r += ',' }
        i++
      })
      r += (leaf ? ' ' : '\n' + TestHelpers.indent(level)) + '}'
    } else {
      r += map
    }
    return r
  }

  /**
   * De-indents template literals.
   */
  static t = dedent

  /**
   * Returns a string representation of the XML tree rooted at `node`.
   *
   * @param node - a DOM node
   * @param level - indentation level
   */
  static printTree(node: any, level?: number | undefined): string {
    const removeLastNewline = (level === undefined)
    level = level || 0
    const indent = '  '.repeat(level)
    let str = ''
    switch (node.nodeType) {
      case 1: // Element
        str = `${indent}${node.tagName}`
        if (node.namespaceURI) {
          str += ` (ns:${node.namespaceURI})`
        }
        for (const attr of node.attributes) {
          str += ` ${attr.name}="${attr.value}"`
          if (attr.namespaceURI) {
            str += ` (ns:${attr.namespaceURI})`
          }
        }
        str += `\n`
        break
      case 3: // Text
        str = `${indent}# ${node.data}\n`
        break
      case 4: // CData
        str = `${indent}$ ${node.data}\n`
        break
      case 7: // ProcessingInstruction
        if (node.data) {
          str = `${indent}? ${node.target} ${node.data}\n`
        } else {
          str = `${indent}? ${node.target}\n`
        }
        break
      case 8: // Comment
        str = `${indent}! ${node.data}\n`
        break
      case 9: // Document
      case 11: // DocumentFragment
        level = -1
        break
      case 10: // DocumentType
        str = `${indent}!DOCTYPE ${node.name}`
        if (node.publicId && node.systemId)
          str += ` PUBLIC ${node.publicId} ${node.systemId}`
        else if (node.publicId)
          str += ` PUBLIC ${node.publicId}`
        else if (node.systemId)
          str += ` SYSTEM ${node.systemId}`
        str += `\n`
        break
      default:
        throw new Error('Unknown node type')
    }
    for (const child of node.childNodes) {
      str += TestHelpers.printTree(child, level + 1)
    }

    // remove last newline
    if (removeLastNewline)
      str = str.slice(0, -1)

    return str
  }
}
