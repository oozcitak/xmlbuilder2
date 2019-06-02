/**
 * Defines the options used while creating an XML document.
 */
export interface XMLBuilderOptions {
  /**
   * A version number string, e.g. `"1.0"`
   */
  version?: "1.0" | "1.1"
  /**
   * Encoding declaration, e.g. `"UTF-8"`
   */
  encoding?: string
  /**
   * Standalone document declaration: `true` or `false`
   */
  standalone?: boolean
  /**
   * Public identifier of the DTD
   */
  pubID?: string
  /**
   * System identifier of the DTD
   */
  sysID?: string
  /**
   * Whether XML declaration and doctype will be included
   */
  headless?: boolean
  /**
   * Whether nodes with `null` values will be kept or ignored
   */
  keepNullNodes?: boolean
  /**
   * Whether attributes with `null` values will be kept or ignored
   */
  keepNullAttributes?: boolean
  /** 
   * Whether decorator strings will be ignored when converting JS 
   * objects
   */
  ignoreDecorators?: boolean
  /** 
   * Whether array items are created as separate nodes when passed 
   * as an object value
   */
  separateArrayItems?: boolean
  /**
   * Whether existing html entities are encoded
   */
  noDoubleEncoding?: boolean
  /**
   * A set of functions to use for converting values to strings
   */
  stringify?: XMLStringifier
}

/**
 * Defines the functions used for converting values to strings.
 */
export interface XMLStringifier {
  /**
   * Converts an element or attribute name to string
   */
  name?: (v: any) => string
  /**
   * Converts the contents of a text node to string
   */
  text?: (v: any) => string
  /**
   * Converts the contents of a CDATA node to string
   */
  cdata?: (v: any) => string
  /**
   * Converts the contents of a comment node to string
   */
  comment?: (v: any) => string
  /**
   * Converts the contents of a raw text node to string
   */
  raw?: (v: any) => string
  /**
   * Converts attribute value to string
   */
  attValue?: (v: any) => string
  /**
   * Converts processing instruction target to string
   */
  insTarget?: (v: any) => string
  /**
   * Converts processing instruction value to string
   */
  insValue?: (v: any) => string
  /**
   * Converts XML version to string
   */
  xmlVersion?: (v: any) => string
  /**
   * Converts XML encoding to string
   */
  xmlEncoding?: (v: any) => string
  /**
   * Converts standalone document declaration to string
   */
  xmlStandalone?: (v: any) => string
  /**
   * Converts DocType public identifier to string
   */
  dtdPubID?: (v: any) => string
  /**
   * Converts DocType system identifier to string
   */
  dtdSysID?: (v: any) => string
  /**
   * Converts `!ELEMENT` node content inside Doctype to string
   */
  dtdElementValue?: (v: any) => string
  /**
   * Converts `!ATTLIST` node type inside DocType to string
   */
  dtdAttType?: (v: any) => string
  /**
   * Converts `!ATTLIST` node default value inside DocType to string
   */
  dtdAttDefault?: (v: any) => string
  /**
   * Converts `!ENTITY` node content inside Doctype to string
   */
  dtdEntityValue?: (v: any) => string
  /**
   * Converts `!NOTATION` node content inside Doctype to string
   */
  dtdNData?: (v: any) => string
  /** 
   * When prepended to a JS object key, converts the key-value pair 
   * to an attribute. 
   */
  convertAttKey?: string
  /** 
   * When prepended to a JS object key, converts the key-value pair 
   * to a processing instruction node. 
   */
  convertPIKey?: string
  /** 
   * When prepended to a JS object key, converts its value to a text node. 
   * 
   * _Note:_ Since JS objects cannot contain duplicate keys, multiple text 
   * nodes can be created by adding some unique text after each object 
   * key. For example: 
   * 
   * @example
   * 
   * const textNodes = { '#text1': 'some text', '#text2': 'more text' }
   */
  convertTextKey?: string
  /** 
   * When prepended to a JS object key, converts its value to a CDATA 
   * node. 
   */
  convertCDataKey?: string
  /** 
   * When prepended to a JS object key, converts its value to a 
   * comment node.
   */
  convertCommentKey?: string
  /** 
   * When prepended to a JS object key, converts its value to a raw 
   * text node. 
   */
  convertRawKey?: string
  /**
   * Escapes special characters in text.
   */
  textEscape?: (v: string) => string
  /**
   * Escapes special characters in attribute values.
   */
  attEscape?: (v: string) => string

  /**
   * Index signature
   */
  [key: string]: undefined | string | ((v: any) => string) | 
    ((v: string) => string) | XMLBuilderOptions
}

/**
 * Represents the type of a variable that can be expanded by `element` function 
 * into nodes.
 */
export type ExpandObject = { [key: string]: any } | any[] | ((...args: any) => any)

/**
 * Represents the type of a variable that can either be a JS object defining
 * attributes or the contents of a text node.
 */
export type AttributesOrText = {
  /**
   * Default namespace
   */
  xmlns?: string | null, 
  /**
   * Attribute key/value pairs
   */
  [key: string]: any } | string

/**
 * Represents a mixin that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */

/**
 * Serves as an entry point to builder functions.
 */
export interface XMLBuilderEntryPoint {

  /**
   * Creates a new XML document without a document element and returns it.
   * 
   * @returns the XML document node
   */
  create(): XMLBuilder

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
   * 
   * @returns document element node
   */
  create(name: string | ExpandObject, attributes?: AttributesOrText,
    text?: AttributesOrText): XMLBuilder
  
  /**
   * Creates an XML document by parsing the given document representation.
   * 
   * @param document - a string containing an XML document or a JS object 
   * representing nodes to insert
   * @param options - builder options
   * 
   * @returns document element node
   */
  parse(document: string | ExpandObject): XMLBuilder

}

export interface XMLBuilder {

  /**
   * Gets the parent node.
   */
  readonly parent: XMLBuilder

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param name - element name
   * @param attributes - a JS object with element attributes
   * @param text - contents of a text child node
   * 
   * @remarks `attributes` and `text` parameters are optional and 
   * interchangeable.
   * 
   * @returns the new element node
   */
  ele(name: string, attributes?: AttributesOrText,
    text?: AttributesOrText): XMLBuilder

  /**
   * Creates new element nodes from the given JS object and appends it to the
   * list of child nodes.
   * 
   * @param obj - a JS object representing nodes to insert
   * 
   * @returns the last top level element node created
   */
  ele(obj: ExpandObject): XMLBuilder

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param name - element name or a JS object representing nodes to insert
   * @param attributes - a JS object with element attributes
   * @param text - contents of a text child node
   * 
   * @returns the last top level element node created
   */
  ele(name: string | ExpandObject, attributes?: AttributesOrText,
    text?: AttributesOrText): XMLBuilder

  /**
   * Removes this node from the XML document.
   * 
   * @returns parent element node
   */
  removeEle(): XMLBuilder

  /**
   * Creates or updates an element attribute.
   * 
   * @param name - attribute name or a JS object with element attributes and 
   * values
   * @param value - attribute value
   * 
   * @returns current element node
   */
  att(name: AttributesOrText, value?: string): XMLBuilder

  /**
   * Removes an attribute or a list of attributes.
   * 
   * @param name - attribute name or an array with attribute names
   * 
   * @returns current element node
   */
  removeAtt(name: string | string[]): XMLBuilder

  /**
   * Removes an attribute or a list of attributes.
   * 
   * @param namespace - namespace of the attribute to remove
   * @param name - attribute name or an array with attribute names
   * 
   * @returns current element node
   */
  removeAtt(namespace: string, name: string | string[]): XMLBuilder

  /**
   * Creates a new text node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  txt(content: string): XMLBuilder

  /**
   * Creates a new comment node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  com(content: string): XMLBuilder

  /**
   * Creates a new CDATA node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  dat(content: string): XMLBuilder

  /**
   * Creates a new processing instruction node and appends it to the list of 
   * child nodes.
   * 
   * @param target - instruction target
   * @param content - node content
   * 
   * @returns current element node
   */
  ins(target: string, content?: string): XMLBuilder

  /**
   * Creates a new raw text node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  raw(content: string): XMLBuilder

  /**
   * Returns the document node.
   */
  doc(): XMLBuilder

  /**
   * Returns the root element node.
   */
  root(): XMLBuilder

  /**
   * Returns the parent node.
   */
  up(): XMLBuilder

  /**
   * Returns the previous sibling node.
   */
  prev(): XMLBuilder

  /**
   * Returns the next sibling node.
   */
  next(): XMLBuilder

}
