import { DOMImplementation } from '../src/dom/index'
import dedent from "dedent"
import { Attr as AttrImpl } from '../src/dom/index'
import { CDATASection as CDATASectionImpl } from '../src/dom/index'
import { CharacterData as CharacterDataImpl } from '../src/dom/index'
import { Comment as CommentImpl } from '../src/dom/index'
import { DocumentFragment as DocumentFragmentImpl } from '../src/dom/index'
import { Document as DocumentImpl } from '../src/dom/index'
import { DocumentType as DocumentTypeImpl } from '../src/dom/index'
import { DOMException as DOMExceptionImpl } from '../src/dom/index'
import { DOMImplementation as DOMImplementationImpl } from '../src/dom/index'
import { DOMTokenList as DOMTokenListImpl } from '../src/dom/index'
import { Element as ElementImpl } from '../src/dom/index'
import { HTMLCollection as HTMLCollectionImpl } from '../src/dom/index'
import { NamedNodeMap as NamedNodeMapImpl } from '../src/dom/index'
import { NodeFilter as NodeFilterImpl } from '../src/dom/index'
import { Node as NodeImpl } from '../src/dom/index'
import { NodeList as NodeListImpl } from '../src/dom/index'
import { ProcessingInstruction as ProcessingInstructionImpl } from '../src/dom/index'
import { ShadowRoot as ShadowRootImpl } from '../src/dom/index'
import { Text as TextImpl } from '../src/dom/index'
import { XMLDocument as XMLDocumentImpl } from '../src/dom/index'

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
  static dom: DOMImplementation = DOMImplementation.Instance

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
        for (let attr of node.attributes) {
          str += ` ${attr.name}="${attr.value}"`
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
        str = `${indent}? ${node.target} ${node.data}\n`
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
    for (let child of node.childNodes) {
      str += TestHelpers.printTree(child, level + 1)
    }

    // remove last newline
    if (removeLastNewline)
      str = str.slice(0, -1)

    return str
  }
}