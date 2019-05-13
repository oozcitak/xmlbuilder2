import { _applyMixin } from '../util'
import { XMLBuilder } from './XMLBuilder'
import { Element, XMLDocument } from '../dom'
import { XMLBuilderOptions } from "./interfaces"

// Apply mixins
_applyMixin(XMLDocument, XMLBuilder)
_applyMixin(Element, XMLBuilder)

 
/**
 * Configures options for XML builder.
 * 
 * @param options - builder options
 * 
 * @returns builder with the given options applied
 */
export function withOptions(options?: XMLBuilderOptions): XMLBuilder {
  return new XMLBuilder(options)  
}

/**
 * Creates a new XML document.
 * 
 * @param name - name of the root node
 * 
 * @returns root element node
 */
export function create(name?: string): XMLBuilder {
  return withOptions().create(name)
}