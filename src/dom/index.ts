import { applyMixin } from '../util'

// Import implementation classes
import { AbstractRangeImpl } from './AbstractRangeImpl'
import { AttrImpl } from './AttrImpl'
import { CDATASectionImpl } from './CDATASectionImpl'
import { CharacterDataImpl } from './CharacterDataImpl'
import { ChildNodeImpl } from './ChildNodeImpl'
import { CommentImpl } from './CommentImpl'
import { CustomEventImpl } from './CustomEventImpl'
import { DocumentFragmentImpl } from './DocumentFragmentImpl'
import { DocumentImpl } from './DocumentImpl'
import { DocumentOrShadowRootImpl } from './DocumentOrShadowRootImpl'
import { DocumentTypeImpl } from './DocumentTypeImpl'
import { DOMException } from './DOMException'
import { DOMImplementationImpl, Instance as DOMImplementationInstance } from './DOMImplementationImpl'
import { DOMTokenListImpl } from './DOMTokenListImpl'
import { ElementImpl } from './ElementImpl'
import { EventImpl } from './EventImpl'
import { EventTargetImpl } from './EventTargetImpl'
import { HTMLCollectionImpl } from './HTMLCollectionImpl'
import { NamedNodeMapImpl } from './NamedNodeMapImpl'
import { NodeFilterImpl } from './NodeFilterImpl'
import { NodeImpl } from './NodeImpl'
import { NodeListImpl } from './NodeListImpl'
import { NonDocumentTypeChildNodeImpl } from './NonDocumentTypeChildNodeImpl'
import { NonElementParentNodeImpl } from './NonElementParentNodeImpl'
import { ParentNodeImpl } from './ParentNodeImpl'
import { ProcessingInstructionImpl } from './ProcessingInstructionImpl'
import { RangeImpl } from './RangeImpl'
import { ShadowRootImpl } from './ShadowRootImpl'
import { SlotableImpl } from './SlotableImpl'
import { StaticRangeImpl } from './StaticRangeImpl'
import { TextImpl } from './TextImpl'
import { XMLDocumentImpl } from './XMLDocumentImpl'

// Apply mixins
// ChildNode
applyMixin(ElementImpl, ChildNodeImpl)
applyMixin(CharacterDataImpl, ChildNodeImpl)
applyMixin(DocumentTypeImpl, ChildNodeImpl)
// DocumentOrShadowRoot
applyMixin(DocumentImpl, DocumentOrShadowRootImpl)
applyMixin(ShadowRootImpl, DocumentOrShadowRootImpl)
// NonDocumentTypeChildNode
applyMixin(ElementImpl, NonDocumentTypeChildNodeImpl)
applyMixin(CharacterDataImpl, NonDocumentTypeChildNodeImpl)
// NonElementParentNode
applyMixin(DocumentImpl, NonElementParentNodeImpl)
applyMixin(DocumentFragmentImpl, NonElementParentNodeImpl)
// ParentNode
applyMixin(DocumentImpl, ParentNodeImpl)
applyMixin(DocumentFragmentImpl, ParentNodeImpl)
applyMixin(ElementImpl, ParentNodeImpl)
// Slotable
applyMixin(TextImpl, SlotableImpl)
applyMixin(ElementImpl, SlotableImpl)

// Export classes
export { 
  AbstractRangeImpl, AttrImpl, CDATASectionImpl, CharacterDataImpl, 
  CommentImpl, CustomEventImpl, DocumentFragmentImpl, DocumentImpl, 
  DocumentTypeImpl, DOMException, DOMImplementationImpl, DOMTokenListImpl, 
  ElementImpl, EventImpl, EventTargetImpl, HTMLCollectionImpl, 
  NamedNodeMapImpl, NodeFilterImpl, NodeImpl, NodeListImpl, 
  ProcessingInstructionImpl, RangeImpl, ShadowRootImpl, 
  StaticRangeImpl, TextImpl, XMLDocumentImpl
}
export { DOMImplementationInstance }
export { DOMParser, MimeType } from './parser'