import { _applyMixin } from '../util'

// Import implementation classes
import { XMLBuilderOptions, XMLBuilder } from './interfaces'
import { XMLBuilderEntryPointImpl } from './XMLBuilderEntryPointImpl'
import { XMLBuilderImpl } from './XMLBuilderImpl'
import { XMLDocumentImpl } from '../dom/XMLDocumentImpl'
import { ElementImpl } from '../dom/ElementImpl'

// Apply mixins
// XMLBuilder
_applyMixin(XMLDocumentImpl, XMLBuilderImpl)
_applyMixin(ElementImpl, XMLBuilderImpl)

/**
 * Configures options for XML builder.
 * 
 * @param options - builder options
 * 
 * @returns builder with the given options applied
 */
export function withOptions(options?: XMLBuilderOptions): XMLBuilderEntryPointImpl {
  return new XMLBuilderEntryPointImpl(options)
}

/**
 * Creates an empty XML document.
 * 
 * @returns document node
 */
export function create(): XMLBuilder

/**
 * Creates a new XML document with an element node.
 * 
 * @param name - document element name
 * 
 * @returns root element node
 */
export function create(name: string): XMLBuilder

/**
 * Creates a new XML document with an element node.
 * 
 * @param namespace - document element namespace
 * @param qualifiedName - document element qualified name
 * 
 * @returns root element node
 */
export function create(namespace: string, qualifiedName: string): XMLBuilder

/**
 * Creates a new XML document.
 * 
 * @param namespace - document element namespace
 * @param qualifiedName - document element qualified name
 * 
 * @returns root element node or document node
 */
export function create(namespace?: string, qualifiedName?: string): XMLBuilder {
  const builder = new XMLBuilderEntryPointImpl()
  return builder.create(namespace, qualifiedName)
}
