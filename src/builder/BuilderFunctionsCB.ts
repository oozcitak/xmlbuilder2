import { XMLBuilderCB, XMLBuilderCBCreateOptions } from '../interfaces'
import { XMLBuilderCBImpl } from '.'

/**
 * Creates an XML builder which serializes the document in chunks.
 * 
 * @param options - callback builder options
 * 
 * @returns callback builder
 */
export function createCB(options?: XMLBuilderCBCreateOptions): XMLBuilderCB {
  return new XMLBuilderCBImpl(options)
}

/**
 * Creates an XML builder which serializes the fragment in chunks.
 * 
 * @param options - callback builder options
 * 
 * @returns callback builder
 */
export function fragmentCB(options?: XMLBuilderCBCreateOptions): XMLBuilderCB {
  return new XMLBuilderCBImpl(options, true)
}
