import { _applyMixin } from '../util'
import { Node } from '../dom'
import { XMLBuilderImpl } from './XMLBuilderImpl'
import { XMLBuilderEntryPointImpl } from './XMLBuilderEntryPointImpl'
import {
  XMLBuilderOptions, XMLBuilderEntryPoint, XMLBuilder, 
  ExpandObject, AttributesOrText
} from './interfaces'

// Apply XMLBuilder mixin
_applyMixin(Node, XMLBuilderImpl)

/**
 * Sets builder options.
 * 
 * @param options - builder options
 */
export function withOptions(options: XMLBuilderOptions): XMLBuilderEntryPoint {
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
export function create(name?: string | ExpandObject, attributes?: AttributesOrText,
  text?: AttributesOrText): XMLBuilder {
  return new XMLBuilderEntryPointImpl().create(name, attributes, text)
}

/**
 * Creates and returns a new document fragment.
 * 
 * @returns document fragment node
 */
export function fragment(): XMLBuilder {
  return new XMLBuilderEntryPointImpl().fragment()
}

/**
 * Creates an XML document by parsing the given document representation.
 * 
 * @param document - a string containing an XML document or a JS object 
 * representing nodes to insert
 * 
 * @returns document element node
 */
export function parse(document: string | ExpandObject): XMLBuilder {
  return new XMLBuilderEntryPointImpl().parse(document)
}