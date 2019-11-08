import { dom } from '@oozcitak/dom'
import { applyMixin } from '@oozcitak/util'
import { XMLBuilderNodeImpl } from './XMLBuilderNodeImpl'
import { XMLBuilderDocumentImpl } from './XMLBuilderDocumentImpl'

// Apply XMLBuilder mixin
applyMixin(dom.Node, XMLBuilderNodeImpl, "remove")
applyMixin(dom.Element, XMLBuilderNodeImpl, "remove")

applyMixin(dom.CharacterData, XMLBuilderNodeImpl, "remove")
applyMixin(dom.CDATASection, XMLBuilderNodeImpl, "remove")
applyMixin(dom.Comment, XMLBuilderNodeImpl, "remove")
applyMixin(dom.Text, XMLBuilderNodeImpl, "remove")
applyMixin(dom.ProcessingInstruction, XMLBuilderNodeImpl, "remove")

applyMixin(dom.DocumentType, XMLBuilderNodeImpl, "remove")
applyMixin(dom.DocumentFragment, XMLBuilderNodeImpl, "remove")
applyMixin(dom.Document, XMLBuilderDocumentImpl, "remove")
applyMixin(dom.XMLDocument, XMLBuilderDocumentImpl, "remove")

export { XMLBuilderImpl } from './XMLBuilderImpl'
