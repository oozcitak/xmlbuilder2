import dedent from "dedent"
import { XMLSerializer } from "@oozcitak/dom/lib/serializer"
import { Node } from "@oozcitak/dom/lib/dom/interfaces"
import { isObject, isArray, isMap, forEachObject, objectLength, forEachArray } from "@oozcitak/util"
import { builder, create, fragment, convert, createStream } from "../src"
import { XMLBuilderStream, StreamWriterOptions } from "../src/interfaces"

export default class TestHelpers {
  static builder = builder
  static create = create
  static fragment = fragment
  static convert = convert

  static serialize(node: Node): string {
    const s = new XMLSerializer()
    return s.serializeToString(node)
  }

  static createStream(options?: Partial<StreamWriterOptions>): XMLBuilderStream {
    options = options || {}
    options.data = (function (this: XMLBuilderStream, chunk) {
      (this as any).streamResult += chunk
    })
    options.end = (() => { })
    options.error = (function (this: XMLBuilderStream, err) {
      str.streamError = err
    })
    const str = createStream(options as Required<StreamWriterOptions>) as any
    str.streamError = undefined
    str.streamResult = ""
    return str
  }

  static expectStreamResult(str: XMLBuilderStream, result: string, done: any) {
    expect((str as any).streamResult).toBe(result)
    done()
  }

  static expectStreamError(str: XMLBuilderStream, testFunc: () => any, done: any) {
    testFunc()
    expect((str as any).streamError).not.toBe(undefined)
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
