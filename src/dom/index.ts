import { _applyMixin } from '../util'

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
import { ShadowRootImpl } from './ShadowRootImpl'
import { SlotableImpl } from './SlotableImpl'
import { TextImpl } from './TextImpl'
import { XMLDocumentImpl } from './XMLDocumentImpl'

// Apply mixins
// ChildNode
_applyMixin(ElementImpl, ChildNodeImpl)
_applyMixin(CharacterDataImpl, ChildNodeImpl)
_applyMixin(DocumentTypeImpl, ChildNodeImpl)
// DocumentOrShadowRoot
_applyMixin(DocumentImpl, DocumentOrShadowRootImpl)
_applyMixin(ShadowRootImpl, DocumentOrShadowRootImpl)
// NonDocumentTypeChildNode
_applyMixin(ElementImpl, NonDocumentTypeChildNodeImpl)
_applyMixin(CharacterDataImpl, NonDocumentTypeChildNodeImpl)
// NonElementParentNode
_applyMixin(DocumentImpl, NonElementParentNodeImpl)
_applyMixin(DocumentFragmentImpl, NonElementParentNodeImpl)
// ParentNode
_applyMixin(DocumentImpl, ParentNodeImpl)
_applyMixin(DocumentFragmentImpl, ParentNodeImpl)
_applyMixin(ElementImpl, ParentNodeImpl)
// Slotable
_applyMixin(TextImpl, SlotableImpl)
_applyMixin(ElementImpl, SlotableImpl)

// Export classes and drop `Impl`
export { AbstractRangeImpl as AbstractRange }
export { AttrImpl as Attr }
export { CDATASectionImpl as CDATASection }
export { CharacterDataImpl as CharacterData }
export { CommentImpl as Comment }
export { CustomEventImpl as CustomEvent }
export { DocumentFragmentImpl as DocumentFragment }
export { DocumentImpl as Document }
export { DocumentTypeImpl as DocumentType }
export { DOMException as DOMException }
export { DOMImplementationImpl as DOMImplementation }
export { DOMTokenListImpl as DOMTokenList }
export { ElementImpl as Element }
export { EventImpl as Event }
export { EventTargetImpl as EventTarget }
export { HTMLCollectionImpl as HTMLCollection }
export { NamedNodeMapImpl as NamedNodeMap }
export { NodeFilterImpl as NodeFilter }
export { NodeImpl as Node }
export { NodeListImpl as NodeList }
export { ProcessingInstructionImpl as ProcessingInstruction }
export { ShadowRootImpl as ShadowRoot }
export { TextImpl as Text }
export { XMLDocumentImpl as XMLDocument }
export { DOMImplementationInstance }
export { DOMParser, MimeType } from './parser'