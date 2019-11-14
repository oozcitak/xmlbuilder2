import { dom } from '@oozcitak/dom'
import { applyMixin } from '@oozcitak/util'
import { XMLBuilderImpl } from './XMLBuilderImpl'
import { XMLBuilderNodeImpl } from './XMLBuilderNodeImpl'

// Apply XMLBuilder mixin
applyMixin(dom.Node, XMLBuilderNodeImpl, "remove")
applyMixin(dom.Element, XMLBuilderNodeImpl, "remove")
applyMixin(dom.Attr, XMLBuilderNodeImpl, "remove")

applyMixin(dom.CharacterData, XMLBuilderNodeImpl, "remove")
applyMixin(dom.CDATASection, XMLBuilderNodeImpl, "remove")
applyMixin(dom.Comment, XMLBuilderNodeImpl, "remove")
applyMixin(dom.Text, XMLBuilderNodeImpl, "remove")
applyMixin(dom.ProcessingInstruction, XMLBuilderNodeImpl, "remove")

applyMixin(dom.DocumentType, XMLBuilderNodeImpl, "remove")
applyMixin(dom.DocumentFragment, XMLBuilderNodeImpl, "remove")
applyMixin(dom.Document, XMLBuilderNodeImpl, "remove")
applyMixin(dom.XMLDocument, XMLBuilderNodeImpl, "remove")

export { XMLBuilderImpl, XMLBuilderNodeImpl }

export function isRawNode(node: any): boolean {
  return XMLBuilderNodeImpl._FromNode(node)._isRawNode === true
}