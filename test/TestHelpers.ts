import dedent from "dedent"

import { DOMImplementation } from '../src/dom'
import { Attr as AttrImpl } from '../src/dom'
import { CDATASection as CDATASectionImpl } from '../src/dom'
import { CharacterData as CharacterDataImpl } from '../src/dom'
import { Comment as CommentImpl } from '../src/dom'
import { DocumentFragment as DocumentFragmentImpl } from '../src/dom'
import { Document as DocumentImpl } from '../src/dom'
import { DocumentType as DocumentTypeImpl } from '../src/dom'
import { DOMException as DOMExceptionImpl } from '../src/dom'
import { DOMImplementation as DOMImplementationImpl } from '../src/dom'
import { DOMTokenList as DOMTokenListImpl } from '../src/dom'
import { Element as ElementImpl } from '../src/dom'
import { HTMLCollection as HTMLCollectionImpl } from '../src/dom'
import { NamedNodeMap as NamedNodeMapImpl } from '../src/dom'
import { NodeFilter as NodeFilterImpl } from '../src/dom'
import { Node as NodeImpl } from '../src/dom'
import { NodeList as NodeListImpl } from '../src/dom'
import { ProcessingInstruction as ProcessingInstructionImpl } from '../src/dom'
import { ShadowRoot as ShadowRootImpl } from '../src/dom'
import { Text as TextImpl } from '../src/dom'
import { XMLDocument as XMLDocumentImpl } from '../src/dom'
import { DOMImplementationInstance } from '../src/dom'
import { XMLSerializer } from '../src/dom/serializer'

import { create, parse } from '../src/xmlbuilder'

export default class TestHelpers {
  static Attr = AttrImpl
  static CDATASection = CDATASectionImpl
  static CharacterData = CharacterDataImpl
  static Comment = CommentImpl
  static DocumentFragment = DocumentFragmentImpl
  static Document = DocumentImpl
  static DocumentType = DocumentTypeImpl
  static DOMException = DOMExceptionImpl
  static DOMImplementation = DOMImplementationImpl
  static DOMTokenList = DOMTokenListImpl
  static Element = ElementImpl
  static HTMLCollection = HTMLCollectionImpl
  static NamedNodeMap = NamedNodeMapImpl
  static NodeFilter = NodeFilterImpl
  static Node = NodeImpl
  static NodeList = NodeListImpl
  static ProcessingInstruction = ProcessingInstructionImpl
  static ShadowRoot = ShadowRootImpl
  static Text = TextImpl
  static XMLDocument = XMLDocumentImpl

  /**
   * Returns the dom implemention.
   */
  static dom: DOMImplementation = DOMImplementationInstance

  /**
   * Creates an XML document.
   */
  static create = create
  static parse = parse
  static serialize(node: any): string {
    const serializer = new XMLSerializer()
    return serializer.serializeToString(node)
  }

  /**
   * De-indents template literals.
   */
  static t = dedent

  /**
   * Returns a string representation of the XML tree rooted at `node`.
   * 
   * @param node - the root node of the tree
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
        if(node.namespaceURI) {
          str += ` (ns:${node.namespaceURI})`
        }
        for (const attr of node.attributes) {
          str += ` ${attr.name}="${attr.value}"`
          if(attr.namespaceURI) {
            str += ` (ns:${attr.namespaceURI})`
          }
        }
        str += `\n`
        break
      case 3: // Text
        str = `${indent}# ${node.data}\n`
        break
      case 4: // CData
        str = `${indent}[ ${node.data}\n`
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
        if (node.publicId)
          str += ` PUBLIC ${node.publicId}`
        if (node.systemId)
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