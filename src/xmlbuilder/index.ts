import { applyMixin } from '../util'
import { 
  CDATASectionImpl, CommentImpl, DocumentFragmentImpl, DocumentImpl, 
  DocumentTypeImpl, ElementImpl, ProcessingInstructionImpl, TextImpl,
  CharacterDataImpl, NodeImpl, XMLDocumentImpl
} from '../dom'
import { XMLBuilderNodeImpl } from './XMLBuilderNodeImpl'
import { XMLBuilderDocumentImpl } from './XMLBuilderDocumentImpl'

// Apply XMLBuilder mixin
applyMixin(NodeImpl, XMLBuilderNodeImpl, "remove")
applyMixin(ElementImpl, XMLBuilderNodeImpl, "remove")

applyMixin(CharacterDataImpl, XMLBuilderNodeImpl, "remove")
applyMixin(CDATASectionImpl, XMLBuilderNodeImpl, "remove")
applyMixin(CommentImpl, XMLBuilderNodeImpl, "remove")
applyMixin(TextImpl, XMLBuilderNodeImpl, "remove")
applyMixin(ProcessingInstructionImpl, XMLBuilderNodeImpl, "remove")

applyMixin(DocumentTypeImpl, XMLBuilderNodeImpl, "remove")
applyMixin(DocumentFragmentImpl, XMLBuilderNodeImpl, "remove")
applyMixin(DocumentImpl, XMLBuilderDocumentImpl, "remove")
applyMixin(XMLDocumentImpl, XMLBuilderDocumentImpl, "remove")

export { XMLBuilderImpl } from './XMLBuilderImpl'