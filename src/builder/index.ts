import { applyMixin } from "@oozcitak/util"
import { XMLBuilderImpl } from "./XMLBuilderImpl"
import { XMLBuilderNodeImpl } from "./XMLBuilderNodeImpl"
import { 
  Node, Element, Attr, CharacterData, CDATASection, Comment, Text, 
  ProcessingInstruction, DocumentType, DocumentFragment, Document, 
  XMLDocument 
} from "@oozcitak/dom/lib/dom"

// Apply XMLBuilder mixin
applyMixin(Node, XMLBuilderNodeImpl, "remove")
applyMixin(Element, XMLBuilderNodeImpl, "remove")
applyMixin(Attr, XMLBuilderNodeImpl, "remove")

applyMixin(CharacterData, XMLBuilderNodeImpl, "remove")
applyMixin(CDATASection, XMLBuilderNodeImpl, "remove")
applyMixin(Comment, XMLBuilderNodeImpl, "remove")
applyMixin(Text, XMLBuilderNodeImpl, "remove")
applyMixin(ProcessingInstruction, XMLBuilderNodeImpl, "remove")

applyMixin(DocumentType, XMLBuilderNodeImpl, "remove")
applyMixin(DocumentFragment, XMLBuilderNodeImpl, "remove")
applyMixin(Document, XMLBuilderNodeImpl, "remove")
applyMixin(XMLDocument, XMLBuilderNodeImpl, "remove")

export { XMLBuilderImpl }
