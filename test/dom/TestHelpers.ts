import TestHelpersRoot from "../TestHelpers"

import { 
  DOMImplementationImpl, AttrImpl, CDATASectionImpl, CharacterDataImpl, 
  CommentImpl, DocumentFragmentImpl, DocumentImpl, DocumentTypeImpl, 
  DOMException, DOMTokenListImpl, ElementImpl, 
  HTMLCollectionImpl, NamedNodeMapImpl, NodeFilterImpl, NodeImpl, NodeListImpl, 
  ProcessingInstructionImpl, ShadowRootImpl, StaticRangeImpl, TextImpl, 
  XMLDocumentImpl, DOMImplementationInstance
} from '../../src/dom'
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
  static DOMException = DOMException
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
  static StaticRange = StaticRangeImpl
  static Text = TextImpl
  static XMLDocument = XMLDocumentImpl

  static DOMParser = DOMParser
  static MimeType = MimeType
  static XMLSerializer = XMLSerializer
  
  /**
   * Returns the dom implemention.
   */
  static dom: DOMImplementationImpl = DOMImplementationInstance
}