import { Node } from "../dom/interfaces"

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
   * Whether child nodes inherit their parent namespace
   */
  inheritNS?: boolean
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
   * When prepended to a JS object key, converts the key-value pair 
   * to an attribute. Defaults to `"@"`.
   */
  convertAttKey?: string
  /** 
   * When prepended to a JS object key, converts the key-value pair 
   * to a processing instruction node. Defaults to `"?"`.
   */
  convertPIKey?: string
  /** 
   * When prepended to a JS object key, converts its value to a text node. 
   * Defaults to `"#text"`.
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
   * node. Defaults to `"#cdata"`.
   */
  convertCDataKey?: string
  /** 
   * When prepended to a JS object key, converts its value to a 
   * comment node. Defaults to `"#comment"`.
   */
  convertCommentKey?: string
}

/**
 * Defines the options passed to the XML writer.
 */
export interface WriterOptions {
  /**
   * Whether to pretty-print the XML tree
   */
  prettyPrint?: boolean
  /**
   * Indentation level
   */
  level?: number
  /**
   * Indentation string for pretty printing. Defaults to two space characters.
   */
  indent?: string
  /**
   * Newline string for pretty printing. Defaults to `"\n"`.
   */
  newline?: string
  /**
   * Maximum column width. Defaults to `80`.
   */
  width?: number
  /**
   * Whether to output closing tags for empty element nodes
   */
  allowEmptyTags?: boolean
  /**
   * Whether to suppress pretty-printing for text nodes
   */
  dontPrettyPrintTextNodes?: boolean
  /**
   * Whether to insert a space character before closing slash character
   */
  spaceBeforeSlash?: boolean
  /**
   * Prevents existing html entities from being re-encoded
   */
  noDoubleEncoding: boolean
}

/**
 * Defines the state of the XML writer.
 */
export enum WriterState {
  /**
   * Writer state is unknown.
   */
  None = 0,
  /**
   * Writer is at an opening tag, e.g. `<node>`.
   */
  OpenTag = 1,
  /**
   * Writer is inside an element.
   */
  InsideTag = 2,
  /**
   * Writer is at a closing tag, e.g. `</node>`.
   */
  CloseTag = 3
}

/**
 * Defines the functions used for serializing XML nodes.
 */
export interface XMLWriter<T> {
  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   * @param state - current writer state
   * @param user - user variables passed to serializer functions
   * 
   * @returns serialization of the given node
   */
  serialize(node: Node, options: WriterOptions, state: WriterState, user: {}): T

  /**
   * Escapes special characters in text. 
   * 
   * @param val - the text value to escape
   * 
   * Following characters are escaped by default:
   * 
   * Char | Escaped
   * ---- | -------
   * `&`  | `&amp;`
   * `<`  | `&lt;`
   * `>`  | `&gt;`
   * `\r` | `&#xD;`
   */
  textEscape(val: string): string

  /**
   * Escapes special characters in attribute values.
   * 
   * @param val - the attribute value to escape
   * 
   * Following characters are escaped by default:
   * 
   * Char | Escaped
   * ---- | -------
   * `&`  | `&amp;`
   * `<`  | `&lt;`
   * `>`  | `&gt;`
   * `"`  | `&quot;`
   * `\t` | `&#x9;`
   * `\n` | `&#xA;`
   * `\r` | `&#xD;`
   */
  attEscape(val: string): string
}

/**
 * Represents the type of a variable that can be expanded by the `ele` function 
 * into nodes.
 */
export type ExpandObject = { [key: string]: any } | any[] | ((...args: any) => any)

/**
 * Represents the type of a variable that is a JS object defining
 * attributes.
 */
export type AttributesObject = {
  /**
   * Default namespace
   */
  xmlns?: string | null,
  /**
   * Attribute key/value pairs
   */
  [key: string]: any
}

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
  create(name: string | ExpandObject, attributes?: AttributesObject | string,
    text?: AttributesObject | string): XMLBuilder

  /**
   * Creates and returns a new document fragment.
   * 
   * @returns document fragment node
   */
  fragment(): XMLBuilder

  /**
   * Creates an XML document by parsing the given document representation.
   * 
   * @param document - a string containing an XML document or a JS object 
   * representing nodes to insert
   * 
   * @returns document element node
   */
  parse(document: string | ExpandObject): XMLBuilder

}

/**
 * Represents a mixin that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export interface XMLBuilder {

  /**
   * Gets or sets builder options.
   */
  options: XMLBuilderOptions

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
  ele(name: string, attributes?: AttributesObject | string,
    text?: AttributesObject | string): XMLBuilder

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
  ele(name: string | ExpandObject, attributes?: AttributesObject | string,
    text?: AttributesObject | string): XMLBuilder

  /**
   * Removes this node from the XML document.
   * 
   * @returns parent element node
   */
  remove(): XMLBuilder

  /**
   * Creates or updates an element attribute.
   * 
   * @param name - attribute name or a JS object with element attributes and 
   * values
   * @param value - attribute value
   * 
   * @returns current element node
   */
  att(name: AttributesObject | string, value?: string): XMLBuilder

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
   * Imports a node as a child node of this node. The nodes' descendants and
   * attributes will also be imported. 
   * 
   * @param node - the node to import
   * 
   * _Note:_ The node will be cloned before being imported and this clone will
   * be inserted into the document; not the original node.
   * 
   * _Note:_ If the imported node is a document, its document element node will
   * be imported. If the imported node is a document fragment its child nodes
   * will be imported.
   * 
   * @returns current element node
   */
  import(node: XMLBuilder): XMLBuilder

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

  /**
   * Returns the first child node.
   */
  first(): XMLBuilder

  /**
   * Returns the last child node.
   */
  last(): XMLBuilder
}
