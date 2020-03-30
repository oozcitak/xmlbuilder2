import {
  XMLBuilderCreateOptions, ExpandObject, XMLBuilder, WriterOptions,
  XMLBuilderOptions, DefaultBuilderOptions, DocumentWithSettings,
  XMLBuilderOptionKeys, XMLBuilderCB, XMLWriterOptions,
  JSONWriterOptions, ObjectWriterOptions, XMLSerializedAsObject,
  XMLSerializedAsObjectArray, MapWriterOptions, XMLSerializedAsMap,
  XMLSerializedAsMapArray, XMLBuilderCBCreateOptions, XMLSerializedValue
} from './interfaces'
import { isPlainObject, applyDefaults, isObject } from '@oozcitak/util'
import { Node, Document } from '@oozcitak/dom/lib/dom/interfaces'
import { Guard } from '@oozcitak/dom/lib/util'
import { XMLBuilderImpl } from './builder'
import { createDocument, createParser, throwIfParserError, sanitizeInput } from './builder/dom'
import { isArray } from 'util'
import { XMLBuilderCBImpl } from './builder'

/**
 * Wraps a DOM node for use with XML builder with default options.
 * 
 * @param node - DOM node
 * 
 * @returns an XML builder
 */
export function builder(node: Node): XMLBuilder

/**
 * Wraps an array of DOM nodes for use with XML builder with default options.
 * 
 * @param nodes - an array of DOM nodes
 * 
 * @returns an array of XML builders
 */
export function builder(nodes: Node[]): XMLBuilder[]

/**
 * Wraps a DOM node for use with XML builder with the given options.
 * 
 * @param options - builder options
 * @param node - DOM node
 * 
 * @returns an XML builder
 */
export function builder(options: XMLBuilderCreateOptions, node: Node): XMLBuilder

/**
 * Wraps an array of DOM nodes for use with XML builder with the given options.
 * 
 * @param options - builder options
 * @param nodes - an array of DOM nodes
 * 
 * @returns an array of XML builders
 */
export function builder(options: XMLBuilderCreateOptions, nodes: Node[]): XMLBuilder[]

/** @inheritdoc */
export function builder(p1: XMLBuilderCreateOptions | Node | Node[],
  p2?: Node | Node[]): XMLBuilder | XMLBuilder[] {

  const options = formatBuilderOptions(isXMLBuilderCreateOptions(p1) ? p1 : DefaultBuilderOptions)
  const nodes = Guard.isNode(p1) || isArray(p1) ? p1 : p2
  if (nodes === undefined) {
    throw new Error("Invalid arguments.")
  }

  if (isArray(nodes)) {
    const builders: XMLBuilder[] = []
    for (let i = 0; i < nodes.length; i++) {
      const builder = new XMLBuilderImpl(nodes[i])
      builder.set(options)
      builders.push(builder)
    }
    return builders
  } else {
    const builder = new XMLBuilderImpl(nodes)
    builder.set(options)
    return builder
  }
}

/**
 * Creates an XML document without any child nodes.
 * 
 * @returns document node
 */
export function create(): XMLBuilder

/**
 * Creates an XML document without any child nodes with the given options.
 * 
 * @param options - builder options
 * 
 * @returns document node
 */
export function create(options: XMLBuilderCreateOptions): XMLBuilder

/**
 * Creates an XML document by parsing the given `contents`.
 * 
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document node
 */
export function create(contents: string | ExpandObject): XMLBuilder

/**
 * Creates an XML document.
 * 
 * @param options - builder options
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document node
 */
export function create(options: XMLBuilderCreateOptions,
  contents: string | ExpandObject): XMLBuilder

/** @inheritdoc */
export function create(p1?: XMLBuilderCreateOptions | string | ExpandObject,
  p2?: string | ExpandObject): XMLBuilder {

  const options = formatBuilderOptions(p1 === undefined || isXMLBuilderCreateOptions(p1) ?
    p1 : DefaultBuilderOptions)
  const contents: string | ExpandObject | undefined =
    isXMLBuilderCreateOptions(p1) ? p2 : p1

  let builder: XMLBuilder

  if (contents === undefined) {
    // empty document
    const doc = createDocument()
    builder = new XMLBuilderImpl(doc)
    setOptions(doc, options)
  } else if (isObject(contents)) {
    // JS object
    const doc = createDocument()
    builder = new XMLBuilderImpl(doc)
    setOptions(doc, options)
    builder.ele(contents)
  } else if (/^\s*</.test(contents)) {
    // XML document
    const domParser = createParser()
    const doc = domParser.parseFromString(
      sanitizeInput(contents, options.invalidCharReplacement), "text/xml")
    throwIfParserError(doc)
    builder = new XMLBuilderImpl(doc)
    setOptions(doc, options)
  } else {
    // JSON
    const doc = createDocument()
    builder = new XMLBuilderImpl(doc)
    setOptions(doc, options)
    const obj = JSON.parse(contents) as ExpandObject
    builder.ele(obj)
  }

  return builder
}

/**
 * Creates a new document fragment without any child nodes.
 * 
 * @returns document fragment node
 */
export function fragment(): XMLBuilder

/**
 * Creates a new document fragment with the given options.
 * 
 * @param options - builder options
 * 
 * @returns document fragment node
 */
export function fragment(options: XMLBuilderCreateOptions): XMLBuilder

/**
 * Creates a new document fragment by parsing the given `contents`.
 * 
 * @param contents - a string containing an XML fragment in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document fragment node
 */
export function fragment(contents: string | ExpandObject): XMLBuilder

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
  contents: string | ExpandObject): XMLBuilder

/** @inheritdoc */
export function fragment(p1?: XMLBuilderCreateOptions | string | ExpandObject,
  p2?: string | ExpandObject): XMLBuilder {

  const options = formatBuilderOptions(p1 === undefined || isXMLBuilderCreateOptions(p1) ?
    p1 : DefaultBuilderOptions)
  const contents: string | ExpandObject | undefined =
    isXMLBuilderCreateOptions(p1) ? p2 : p1

  let builder: XMLBuilder

  if (contents === undefined) {
    // empty fragment
    const doc = createDocument()
    setOptions(doc, options)
    builder = new XMLBuilderImpl(doc.createDocumentFragment())
  } else if (isObject(contents)) {
    // JS object
    const doc = createDocument()
    setOptions(doc, options)
    builder = new XMLBuilderImpl(doc.createDocumentFragment())
    builder.ele(contents)
  } else if (/^\s*</.test(contents)) {
    // XML document
    const domParser = createParser()
    const doc = domParser.parseFromString("<TEMP_ROOT>" + 
      sanitizeInput(contents, options.invalidCharReplacement) + "</TEMP_ROOT>", "text/xml")
    throwIfParserError(doc)
    setOptions(doc, options)
    /* istanbul ignore next */
    if (doc.documentElement === null) {
      throw new Error("Document element is null.")
    }
    const frag = doc.createDocumentFragment()
    for (const child of doc.documentElement.childNodes) {
      const newChild = doc.importNode(child, true)
      frag.appendChild(newChild)
    }
    builder = new XMLBuilderImpl(frag)
  } else {
    // JSON
    const doc = createDocument()
    setOptions(doc, options)
    builder = new XMLBuilderImpl(doc.createDocumentFragment())
    const obj = JSON.parse(contents) as ExpandObject
    builder.ele(obj)
  }

  return builder
}

/**
 * Parses an XML document with the default options and converts it to an XML
 * document string with the default writer options.
 * 
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document node
 */
export function convert(contents: string | ExpandObject): string

/**
 * Parses an XML document with the given options and converts it to an XML
 * document string with the default writer options.
 * 
 * @param builderOptions - builder options
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * 
 * @returns document node
 */
export function convert(builderOptions: XMLBuilderCreateOptions,
  contents: string | ExpandObject): string

/**
 * Parses an XML document with the default options and converts it an XML 
 * document string.
 * 
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * @param convertOptions - convert options
 * 
 * @returns document node
 */
export function convert(contents: string | ExpandObject,
  convertOptions: XMLWriterOptions): string

/**
 * Parses an XML document with the default options and converts it a JSON string.
 * 
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * @param convertOptions - convert options
 * 
 * @returns document node
 */
export function convert(contents: string | ExpandObject,
  convertOptions: JSONWriterOptions): string

/**
 * Parses an XML document with the default options and converts it to its object
 * representation.
 * 
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * @param convertOptions - convert options
 * 
 * @returns document node
 */
export function convert(contents: string | ExpandObject,
  convertOptions: ObjectWriterOptions): XMLSerializedAsObject | XMLSerializedAsObjectArray

/**
 * Parses an XML document with the default options and converts it to its object
 * representation using ES6 maps.
 * 
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * @param convertOptions - convert options
 * 
 * @returns document node
 */
export function convert(contents: string | ExpandObject,
  convertOptions: MapWriterOptions): XMLSerializedAsMap | XMLSerializedAsMapArray

/**
 * Parses an XML document with the given options and converts it to an XML
 * document string.
 * 
 * @param builderOptions - builder options
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * @param convertOptions - convert options
 * 
 * @returns document node
 */
export function convert(builderOptions: XMLBuilderCreateOptions,
  contents: string | ExpandObject, convertOptions: XMLWriterOptions): string

/**
 * Parses an XML document with the given options and converts it to a JSON
 * string.
 * 
 * @param builderOptions - builder options
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * @param convertOptions - convert options
 * 
 * @returns document node
 */
export function convert(builderOptions: XMLBuilderCreateOptions,
  contents: string | ExpandObject, convertOptions: JSONWriterOptions): string

/**
 * Parses an XML document with the given options and converts it to its object
 * representation.
 * 
 * @param builderOptions - builder options
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * @param convertOptions - convert options
 * 
 * @returns document node
 */
export function convert(builderOptions: XMLBuilderCreateOptions,
  contents: string | ExpandObject, convertOptions: ObjectWriterOptions): XMLSerializedAsObject | XMLSerializedAsObjectArray

/**
 * Parses an XML document with the given options and converts it to its object
 * representation using ES6 maps.
 * 
 * @param builderOptions - builder options
 * @param contents - a string containing an XML document in either XML or JSON
 * format or a JS object representing nodes to insert
 * @param convertOptions - convert options
 * 
 * @returns document node
 */
export function convert(builderOptions: XMLBuilderCreateOptions,
  contents: string | ExpandObject, convertOptions: MapWriterOptions): XMLSerializedAsMap | XMLSerializedAsMapArray

/** @inheritdoc */
export function convert(p1: XMLBuilderCreateOptions | string | ExpandObject,
  p2?: string | ExpandObject | WriterOptions, p3?: WriterOptions): XMLSerializedValue {

  let builderOptions: XMLBuilderCreateOptions
  let contents: string | ExpandObject
  let convertOptions: WriterOptions | undefined
  if (isXMLBuilderCreateOptions(p1) && p2 !== undefined) {
    builderOptions = p1
    contents = p2
    convertOptions = p3
  } else {
    builderOptions = DefaultBuilderOptions
    contents = p1
    convertOptions = p2 as WriterOptions || undefined
  }

  return create(builderOptions, contents).end(convertOptions as any)
}

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

function isXMLBuilderCreateOptions(obj: any): obj is XMLBuilderCreateOptions {
  if (!isPlainObject(obj)) return false

  for (const key in obj) {
    /* istanbul ignore else */
    if (obj.hasOwnProperty(key)) {
      if (!XMLBuilderOptionKeys.has(key)) return false
    }
  }
  return true
}

function formatBuilderOptions(createOptions: XMLBuilderCreateOptions = {}) {
  const options = applyDefaults(createOptions, DefaultBuilderOptions) as XMLBuilderOptions

  if (options.convert.att.length === 0 ||
    options.convert.ins.length === 0 ||
    options.convert.text.length === 0 ||
    options.convert.cdata.length === 0 ||
    options.convert.comment.length === 0) {
    throw new Error("JS object converter strings cannot be zero length.")
  }

  return options
}

function setOptions(doc: Document, options: XMLBuilderOptions): void {
  const docWithSettings = doc as DocumentWithSettings
  docWithSettings._xmlBuilderOptions = options
}
