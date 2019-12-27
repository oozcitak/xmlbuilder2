import { 
  XMLBuilderCreateOptions, ExpandObject, XMLBuilderNode, WriterOptions, 
  XMLSerializedValue 
} from './builder/interfaces'
import { XMLBuilderImpl } from './builder'
import { isPlainObject } from '@oozcitak/util'

/**
 * Creates an XML document without any child nodes.
 * 
 * @returns document node
 */
export function document(): XMLBuilderNode

/**
 * Creates an XML document without any child nodes with the given options.
 * 
 * @param options - builder options
 * 
 * @returns document node
 */
export function document(options: XMLBuilderCreateOptions): XMLBuilderNode

/**
 * Creates an XML document by parsing the given `contents`.
 * 
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document node
 */
export function document(contents: string | ExpandObject): XMLBuilderNode

/**
 * Creates an XML document.
 * 
 * @param options - builder options
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document node
 */
export function document(options: XMLBuilderCreateOptions,
  contents: string | ExpandObject): XMLBuilderNode

/** @inheritdoc */
export function document(p1?: XMLBuilderCreateOptions | string | ExpandObject, 
  p2?: string | ExpandObject): XMLBuilderNode {

  if (p1 === undefined || isXMLBuilderCreateOptions(p1)) {
    return new XMLBuilderImpl(p1).document(p2)
  } else {
    return new XMLBuilderImpl().document(p1)
  }
}

/**
 * Creates a new document fragment without any child nodes.
 * 
 * @returns document fragment node
 */
export function fragment(): XMLBuilderNode

/**
 * Creates a new document fragment with the given options.
 * 
 * @param options - builder options
 * 
 * @returns document fragment node
 */
export function fragment(options: XMLBuilderCreateOptions): XMLBuilderNode

/**
 * Creates a new document fragment by parsing the given `contents`.
 * 
 * @param contents - a string containing an XML fragment in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document fragment node
 */
export function fragment(contents: string | ExpandObject): XMLBuilderNode

/**
 * Creates a new document fragment.
 * 
 * @param options - builder options
 * @param contents - a string containing an XML fragment in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document fragment node
 */
export function fragment(options: XMLBuilderCreateOptions,
  contents: string | ExpandObject): XMLBuilderNode

/** @inheritdoc */
export function fragment(p1?: XMLBuilderCreateOptions | string | ExpandObject,
  p2?: string | ExpandObject): XMLBuilderNode {

  if (p1 === undefined || isXMLBuilderCreateOptions(p1)) {
    return new XMLBuilderImpl(p1).fragment(p2)
  } else {
    return new XMLBuilderImpl().fragment(p1)
  }
}

/**
 * Parses an XML document with the default options and converts it to the default
 * output format.
 * 
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document node
 */
export function convert(contents: string | ExpandObject): XMLSerializedValue

/**
 * Parses an XML document with the given options and converts it to the default
 * output format.
 * 
 * @param builderOptions - builder options
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document node
 */
export function convert(builderOptions: XMLBuilderCreateOptions, 
  contents: string | ExpandObject): XMLSerializedValue

/**
 * Parses an XML document with the default options and converts it to the given
 * format.
 * 
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * @param convertOptions - convert options
 * 
 * @returns document node
 */
export function convert(contents: string | ExpandObject,
  convertOptions: WriterOptions): XMLSerializedValue

/**
 * Parses an XML document with the given options and converts it to the given
 * format.
 * 
 * @param builderOptions - builder options
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * @param convertOptions - convert options
 * 
 * @returns document node
 */
export function convert(builderOptions: XMLBuilderCreateOptions, 
  contents: string | ExpandObject, convertOptions: WriterOptions): XMLSerializedValue

/** @inheritdoc */
export function convert(p1: XMLBuilderCreateOptions | string | ExpandObject, 
  p2?: string | ExpandObject | WriterOptions, p3?: WriterOptions): XMLSerializedValue {

  let builderOptions: XMLBuilderCreateOptions | undefined
  let contents: string | ExpandObject
  let convertOptions: WriterOptions | undefined
  if (isXMLBuilderCreateOptions(p1) && p2 !== undefined) {
    builderOptions = p1
    contents = p2
    convertOptions = p3
  } else {
    contents = p1
    convertOptions = p2 as WriterOptions | undefined
  }

  return new XMLBuilderImpl(builderOptions).document(contents).end(convertOptions)
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