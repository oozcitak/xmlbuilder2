import { 
  XMLBuilderCreateOptions, ExpandObject, XMLBuilderNode, WriterOptions, 
  XMLSerializedValue, XMLBuilderOptions, DefaultBuilderOptions, DocumentWithSettings
} from './builder/interfaces'
import { isPlainObject, applyDefaults, isObject } from '@oozcitak/util'
import { Node, Document } from '@oozcitak/dom/lib/dom/interfaces'
import { XMLBuilderNodeImpl } from './builder'
import { isNode, createDocument, createParser } from './builder/dom'
import { ValidatorImpl } from './validator'
import { isArray } from 'util'

/**
 * Wraps a DOM node for use with XML builder with default options.
 * 
 * @param node - DOM node
 * 
 * @returns an XML builder
 */
export function builder(node: Node): XMLBuilderNode

/**
 * Wraps an array of DOM nodes for use with XML builder with default options.
 * 
 * @param nodes - an array of DOM nodes
 * 
 * @returns an array of XML builders
 */
export function builder(nodes: Node[]): XMLBuilderNode[]

/**
 * Wraps a DOM node for use with XML builder with the given options.
 * 
 * @param options - builder options
 * @param node - DOM node
 * 
 * @returns an XML builder
 */
export function builder(options: XMLBuilderCreateOptions, node: Node): XMLBuilderNode
  
/**
 * Wraps an array of DOM nodes for use with XML builder with the given options.
 * 
 * @param options - builder options
 * @param nodes - an array of DOM nodes
 * 
 * @returns an array of XML builders
 */
export function builder(options: XMLBuilderCreateOptions, nodes: Node[]): XMLBuilderNode[]

/** @inheritdoc */
export function builder(p1: XMLBuilderCreateOptions | Node | Node[], 
  p2?: Node | Node[]): XMLBuilderNode | XMLBuilderNode[] {

  const options = getOptions(isXMLBuilderCreateOptions(p1) ? p1 : DefaultBuilderOptions)
  const nodes = isNode(p1) || isArray(p1) ? p1 : p2
  if (nodes === undefined) {
    throw new Error("Invalid arguments.")
  }

  if (isArray(nodes)) {
    const builders: XMLBuilderNode[] = []
    for (let i = 0; i < nodes.length; i++) {
      const builder = new XMLBuilderNodeImpl(nodes[i])
      builder.set(options)
      builders.push(builder)
    }
    return builders
  } else {
    const builder = new XMLBuilderNodeImpl(nodes)
    builder.set(options)
    return builder
  }
}

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

  const options = getOptions(p1 === undefined || isXMLBuilderCreateOptions(p1) ?
    p1 : DefaultBuilderOptions)
  const contents: string | ExpandObject | undefined = 
    isXMLBuilderCreateOptions(p1) ? p2 : p1

  let builder: XMLBuilderNode

  if (contents === undefined) {
    // empty document
    const doc = createDocument()
    builder = new XMLBuilderNodeImpl(doc)
    setOptions(doc, options)
  } else if (isObject(contents)) {
    // JS object
    const doc = createDocument()
    builder = new XMLBuilderNodeImpl(doc)
    setOptions(doc, options)
    builder.ele(contents)
  } else if (/^\s*</.test(contents)) {
    // XML document
    const domParser = createParser()
    const doc = domParser.parseFromString(contents, "text/xml")
    builder = new XMLBuilderNodeImpl(doc)
    setOptions(doc, options)
  } else {
    // JSON
    const doc = createDocument()
    builder = new XMLBuilderNodeImpl(doc)
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

  const options = getOptions(p1 === undefined || isXMLBuilderCreateOptions(p1) ?
    p1 : DefaultBuilderOptions)
  const contents: string | ExpandObject | undefined = 
    isXMLBuilderCreateOptions(p1) ? p2 : p1

  let builder: XMLBuilderNode

  if (contents === undefined) {
    // empty fragment
    const doc = createDocument()
    setOptions(doc, options)
    builder = new XMLBuilderNodeImpl(doc.createDocumentFragment())
  } else if (isObject(contents)) {
    // JS object
    const doc = createDocument()
    setOptions(doc, options)
    builder = new XMLBuilderNodeImpl(doc.createDocumentFragment())
    builder.ele(contents)
  } else if (/^\s*</.test(contents)) {
    // XML document
    const domParser = createParser()
    const doc = domParser.parseFromString("<TEMP_ROOT>" + contents + "</TEMP_ROOT>", "text/xml")
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
    builder = new XMLBuilderNodeImpl(frag)
  } else {
    // JSON
    const doc = createDocument()
    setOptions(doc, options)
    builder = new XMLBuilderNodeImpl(doc.createDocumentFragment())
    const obj = JSON.parse(contents) as ExpandObject
    builder.ele(obj)
  }

  return builder
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
    convertOptions = p2 as WriterOptions | undefined
  }

  return document(builderOptions, contents).end(convertOptions)
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

function getOptions(createOptions?: XMLBuilderCreateOptions) {
  const options: XMLBuilderOptions = applyDefaults(
    createOptions === undefined ? {} : createOptions,
    DefaultBuilderOptions)

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
  const validate = new ValidatorImpl(options.version || "1.0")
  const docWithSettings = doc as unknown as DocumentWithSettings
  docWithSettings._xmlBuilderValidator = validate
  docWithSettings._xmlBuilderOptions = options
}