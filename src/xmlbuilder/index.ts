import { applyMixin } from '../util'
import { 
  CDATASection, Comment, DocumentFragment, Document, 
  DocumentType, Element, ProcessingInstruction, Text, CharacterData, 
  Node, XMLDocument
} from '../dom'
import { XMLBuilderNodeImpl } from './XMLBuilderNodeImpl'
import { XMLBuilderDocumentImpl } from './XMLBuilderDocumentImpl'

// Apply XMLBuilder mixin
applyMixin(Node, XMLBuilderNodeImpl, "remove")
applyMixin(Element, XMLBuilderNodeImpl, "remove")

applyMixin(CharacterData, XMLBuilderNodeImpl, "remove")
applyMixin(CDATASection, XMLBuilderNodeImpl, "remove")
applyMixin(Comment, XMLBuilderNodeImpl, "remove")
applyMixin(Text, XMLBuilderNodeImpl, "remove")
applyMixin(ProcessingInstruction, XMLBuilderNodeImpl, "remove")

applyMixin(DocumentType, XMLBuilderNodeImpl, "remove")
applyMixin(DocumentFragment, XMLBuilderNodeImpl, "remove")
applyMixin(Document, XMLBuilderDocumentImpl, "remove")
applyMixin(XMLDocument, XMLBuilderDocumentImpl, "remove")

export { XMLBuilderImpl as XMLBuilder } from './XMLBuilderImpl'