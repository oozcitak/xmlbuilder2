import { XMLBuilderCreateOptions, ExpandObject, XMLBuilderNode } from './builder/interfaces'
import { XMLBuilderImpl } from './builder'
import { isPlainObject } from '@oozcitak/util'

/**
 * Creates an XML document.
 * 
 * @param options - builder options
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document node
 */
export function document(options?: XMLBuilderCreateOptions | string | ExpandObject, 
  contents?: string | ExpandObject): XMLBuilderNode {

  if (options === undefined || isXMLBuilderCreateOptions(options)) {
    return new XMLBuilderImpl(options).document(contents)
  } else {
    return new XMLBuilderImpl().document(options)
  }
}

/**
 * Creates a new document fragment.
 * 
 * @param options - builder options
 * @param contents - a string containing an XML fragment in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document fragment node
 */
export function fragment(options?: XMLBuilderCreateOptions | string | ExpandObject,
  contents?: string | ExpandObject): XMLBuilderNode {

  if (options === undefined || isXMLBuilderCreateOptions(options)) {
    return new XMLBuilderImpl(options).fragment(contents)
  } else {
    return new XMLBuilderImpl().fragment(options)
  }
}

function isXMLBuilderCreateOptions(obj: any): obj is XMLBuilderCreateOptions {
  if (!isPlainObject(obj)) return false
  
  const keys = new Set(["version", "encoding", "standalone", "keepNullNodes",
    "keepNullAttributes", "ignoreConverters", "convert"])
  for (const key in obj) {
    /* istanbul ignore else */
    if (obj.hasOwnProperty(key)) {
      if (!keys.has(key)) return false
    }
  }
  return true
}