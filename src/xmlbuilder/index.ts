import { applyMixin } from '../util'
import { 
  CDATASection, Comment, DocumentFragment, Document, 
  DocumentType, Element, ProcessingInstruction, Text, CharacterData, 
  Node, XMLDocument
} from '../dom'
import { XMLBuilderNodeImpl } from './XMLBuilderNodeImpl'
import { XMLBuilderEntryPointImpl } from './XMLBuilderEntryPointImpl'
import {
  XMLBuilderEntryPoint, XMLBuilderNode, ExpandObject, AttributesObject, 
  XMLBuilderOptionsAsParams
} from './interfaces'
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

/**
 * Sets builder options.
 * 
 * @param options - builder options
 */
export function withOptions(options: XMLBuilderOptionsAsParams): XMLBuilderEntryPoint {
  return new XMLBuilderEntryPointImpl(options)
}

/**
 * Creates a new XML document and returns the document element node for
 * chain building the document tree.
 * 
 * @param name - element name
 * @param attributes - a JS object with element attributes
 * @param text - contents of a text child node
 * 
 * @remarks `attributes` and `text` parameters are optional and 
 * interchangeable.
 * @remarks if `name` is omitted an XML document without a document element will
 * be created and returned.
 * 
 * @returns document element node or document itself
 */
export function create(name?: string | ExpandObject, 
  attributes?: AttributesObject | string,
  text?: AttributesObject | string): XMLBuilderNode {
  return new XMLBuilderEntryPointImpl().create(name, attributes, text)
}

/**
 * Creates and returns a new document fragment.
 * 
 * @returns document fragment node
 */
export function fragment(): XMLBuilderNode {
  return new XMLBuilderEntryPointImpl().fragment()
}

/**
 * Creates an XML document by parsing the given document representation.
 * 
 * @param document - a string containing an XML document
 * 
 * @returns document element node
 */
export function parse(document: string): XMLBuilderNode {
  return new XMLBuilderEntryPointImpl().parse(document)
}