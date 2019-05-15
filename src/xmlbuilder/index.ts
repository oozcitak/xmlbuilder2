import { _applyMixin } from '../util'

// Import implementation classes
import {
  XMLBuilderOptions, XMLBuilderDocument, XMLBuilderElement
} from './interfaces'
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
export function create(): XMLBuilderDocument

/**
 * Creates a new XML document with an element node.
 * 
 * @param name - document element name
 * 
 * @returns root element node
 */
export function create(name: string): XMLBuilderElement

/**
 * Creates a new XML document with an element node.
 * 
 * @param namespace - document element namespace
 * @param qualifiedName - document element qualified name
 * 
 * @returns root element node
 */
export function create(namespace: string, qualifiedName: string): XMLBuilderElement

/**
 * Creates a new XML document.
 * 
 * @param namespace - document element namespace
 * @param qualifiedName - document element qualified name
 * 
 * @returns root element node or document node
 */
export function create(namespace?: string, qualifiedName?: string): XMLBuilderDocument | XMLBuilderElement {
  const builder = new XMLBuilderEntryPointImpl()
  if (namespace && qualifiedName) {
    return builder.create(namespace, qualifiedName)
  } else if (namespace) {
    return builder.create(namespace)
  } else {
    return builder.create()
  }
}
