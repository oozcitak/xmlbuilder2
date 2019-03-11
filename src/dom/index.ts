// Import implementation classes
import { AttrImpl } from './AttrImpl'
import { CDATASectionImpl } from './CDATASectionImpl'
import { CharacterDataImpl } from './CharacterDataImpl'
import { ChildNodeImpl } from './ChildNodeImpl'
import { CommentImpl } from './CommentImpl'
import { DocumentFragmentImpl } from './DocumentFragmentImpl'
import { DocumentImpl } from './DocumentImpl'
import { DocumentOrShadowRootImpl } from './DocumentOrShadowRootImpl'
import { DocumentTypeImpl } from './DocumentTypeImpl'
import { DOMException } from './DOMException'
import { DOMImplementationImpl } from './DOMImplementationImpl'
import { DOMTokenListImpl } from './DOMTokenListImpl'
import { ElementImpl } from './ElementImpl'
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
const applyMixin = function (derivedCtor: any, baseCtor: any): void {
  Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
    derivedCtor.prototype[name] = baseCtor.prototype[name]
  })
}
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

// Export classes and drop `Impl`
export { AttrImpl as Attr }
export { CDATASectionImpl as CDATASection }
export { CharacterDataImpl as CharacterData }
export { CommentImpl as Comment }
export { DocumentFragmentImpl as DocumentFragment }
export { DocumentImpl as Document }
export { DocumentTypeImpl as DocumentType }
export { DOMException as DOMException }
export { DOMImplementationImpl as DOMImplementation }
export { DOMTokenListImpl as DOMTokenList }
export { ElementImpl as Element }
export { HTMLCollectionImpl as HTMLCollection }
export { NamedNodeMapImpl as NamedNodeMap }
export { NodeFilterImpl as NodeFilter }
export { NodeImpl as Node }
export { NodeListImpl as NodeList }
export { ProcessingInstructionImpl as ProcessingInstruction }
export { ShadowRootImpl as ShadowRoot }
export { TextImpl as Text }
export { XMLDocumentImpl as XMLDocument }
