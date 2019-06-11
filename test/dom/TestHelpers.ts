import TestHelpersRoot from "../TestHelpers"

import { DOMImplementation } from '../../src/dom'
import { Attr as AttrImpl } from '../../src/dom'
import { CDATASection as CDATASectionImpl } from '../../src/dom'
import { CharacterData as CharacterDataImpl } from '../../src/dom'
import { Comment as CommentImpl } from '../../src/dom'
import { DocumentFragment as DocumentFragmentImpl } from '../../src/dom'
import { Document as DocumentImpl } from '../../src/dom'
import { DocumentType as DocumentTypeImpl } from '../../src/dom'
import { DOMException as DOMExceptionImpl } from '../../src/dom'
import { DOMImplementation as DOMImplementationImpl } from '../../src/dom'
import { DOMTokenList as DOMTokenListImpl } from '../../src/dom'
import { Element as ElementImpl } from '../../src/dom'
import { HTMLCollection as HTMLCollectionImpl } from '../../src/dom'
import { NamedNodeMap as NamedNodeMapImpl } from '../../src/dom'
import { NodeFilter as NodeFilterImpl } from '../../src/dom'
import { Node as NodeImpl } from '../../src/dom'
import { NodeList as NodeListImpl } from '../../src/dom'
import { ProcessingInstruction as ProcessingInstructionImpl } from '../../src/dom'
import { ShadowRoot as ShadowRootImpl } from '../../src/dom'
import { Text as TextImpl } from '../../src/dom'
import { XMLDocument as XMLDocumentImpl } from '../../src/dom'
import { DOMImplementationInstance } from '../../src/dom'

import { DOMParser, MimeType } from '../../src/dom/parser'
import { XMLSerializer } from '../../src/dom/serializer'

export default class TestHelpers extends TestHelpersRoot {
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

  static DOMParser = DOMParser
  static MimeType = MimeType
  static XMLSerializer = XMLSerializer
  
  /**
   * Returns the dom implemention.
   */
  static dom: DOMImplementation = DOMImplementationInstance
}