import { Node, Attr } from "../dom/interfaces"

/**
 * Defines the options used while creating an XML document. Default values will
 * be provided for optional parameters.
 */
export interface BuilderOptionsParams {
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
   * Whether converter strings will be ignored when converting JS 
   * objects to nodes
   */
  ignoreConverters?: boolean
  /** 
   * Defines string keys used while converting JS objects to nodes.
   */
  convert?: ConvertOptions
  /**
   * Contains functions that validate character data in XML nodes.
   */
  validate?: ValidateOptions
}

/**
 * Defines the options used while creating an XML document.
 */
export interface BuilderOptions {
  /**
   * A version number string, e.g. `"1.0"`
   */
  version: "1.0" | "1.1"
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
  inheritNS: boolean
  /**
   * Whether nodes with `null` values will be kept or ignored
   */
  keepNullNodes: boolean
  /**
   * Whether attributes with `null` values will be kept or ignored
   */
  keepNullAttributes: boolean
  /** 
   * Whether converter strings will be ignored when converting JS 
   * objects to nodes
   */
  ignoreConverters: boolean
  /** 
   * Defines string keys used while converting JS objects to nodes.
   */
  convert: ConvertOptions
  /**
   * Contains functions that validate character data in XML nodes.
   */
  validate: ValidateOptions
}

/**
 * Defines string keys used while converting JS objects to nodes. Default values
 * will be provided for optional parameters.
 */
export interface ConvertOptionsParams {
  /** 
   * When prepended to a JS object key, converts the key-value pair 
   * to an attribute. Defaults to `"@"`.
   */
  att?: string
  /** 
   * When prepended to a JS object key, converts the key-value pair 
   * to a processing instruction node. Defaults to `"?"`.
   */
  ins?: string
  /** 
   * When prepended to a JS object key, converts its value to a text node. 
   * Defaults to `"#"`.
   * 
   * _Note:_ Since JS objects cannot contain duplicate keys, multiple text 
   * nodes can be created by adding some unique text after each object 
   * key. For example: 
   * 
   * @example
   * 
   * const textNodes = { '#text1': 'some text', '#text2': 'more text' }
   */
  text?: string
  /** 
   * When prepended to a JS object key, converts its value to a CDATA 
   * node. Defaults to `"$"`.
   */
  cdata?: string
  /** 
   * When prepended to a JS object key, converts its value to a 
   * comment node. Defaults to `"!"`.
   */
  comment?: string
}

/**
 * Defines string keys used while converting JS objects to nodes.
 */
export interface ConvertOptions {
  /** 
   * When prepended to a JS object key, converts the key-value pair 
   * to an attribute. Defaults to `"@"`.
   */
  att: string
  /** 
   * When prepended to a JS object key, converts the key-value pair 
   * to a processing instruction node. Defaults to `"?"`.
   */
  ins: string
  /** 
   * When prepended to a JS object key, converts its value to a text node. 
   * Defaults to `"#"`.
   * 
   * _Note:_ Since JS objects cannot contain duplicate keys, multiple text 
   * nodes can be created by adding some unique text after each object 
   * key. For example: 
   * 
   * @example
   * 
   * const textNodes = { '#text1': 'some text', '#text2': 'more text' }
   */
  text: string
  /** 
   * When prepended to a JS object key, converts its value to a CDATA 
   * node. Defaults to `"$"`.
   */
  cdata: string
  /** 
   * When prepended to a JS object key, converts its value to a 
   * comment node. Defaults to `"!"`.
   */
  comment: string
}

type ValidatorFunction = (val: string, debugInfo?: string) => string

/**
 * Contains functions that validate character data in XML nodes.
 */
export interface ValidateOptions {

  /**
   * Validates a public identifier.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  pubID?: ValidatorFunction

  /**
   * Validates a system identifier.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  sysID?: ValidatorFunction

  /**
   * Validates element and attribute names.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  name?: ValidatorFunction

  /**
   * Validates text node contents.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  text?: ValidatorFunction

  /**
   * Validates CDATA node contents.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  cdata?: ValidatorFunction

  /**
   * Validates comment node contents.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  comment?: ValidatorFunction

  /**
   * Validates attribute values.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  attValue?: ValidatorFunction

  /**
   * Validates processing instruction node target.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  insTarget?: ValidatorFunction

  /**
   * Validates processing instruction node value.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  insValue?: ValidatorFunction

  /**
   * Validates namespace declaration.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  namespace?: ValidatorFunction
}

/**
 * Validates character data in XML nodes.
 */
export interface Validator {

  /**
   * Validates a public identifier.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  pubID: ValidatorFunction

  /**
   * Validates a system identifier.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  sysID: ValidatorFunction

  /**
   * Validates element and attribute names.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  name: ValidatorFunction

  /**
   * Validates text node contents.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  text: ValidatorFunction

  /**
   * Validates CDATA node contents.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  cdata: ValidatorFunction

  /**
   * Validates comment node contents.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  comment: ValidatorFunction

  /**
   * Validates attribute values.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  attValue: ValidatorFunction

  /**
   * Validates processing instruction node target.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  insTarget: ValidatorFunction

  /**
   * Validates processing instruction node value.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  insValue: ValidatorFunction

  /**
   * Validates namespace declaration.
   * 
   * @param val - value to validate
   * @param debugInfo - optional debug information
   */
  namespace: ValidatorFunction
}

/**
 * Represents an attribute ready to be serialized.
 */
export interface PreSerializedAttr {
  attr: Attr
  name: string
  value: string
}

/**
 * Represents a namespace declaration ready to be serialized.
 */
export interface PreSerializedNS {
  name: string
  value: string
}

/**
 * Represents a node ready to be serialized.
 */
export interface PreSerializedNode<T extends Node> {
  node: T
  level: number
  name?: string
  attributes: PreSerializedAttr[]
  children: PreSerializedNode<Node>[]
  namespaces: PreSerializedNS[]
}

/**
 * Defines the options passed to the writer.
 */
export interface WriterOptions {
  /**
   * Output format. Defaults to `"text"`.
   * - `"text"` - Serializes the document as a string in XML format.
   * - `"map"` - Serializes the document as an object using `Map`s and 
   * `Array`s. Note that this is the preferred format since a `Map` preserves
   * insertion order of nodes as opposed to `Object`.
   * - `"object"` - Serializes the document as an object using `Object`s and
   * `Array`s.
   * - `"json"` - Serializes the document tree as a JSON string.
   */
  format?: "text" | "map" | "object" | "json"
  /**
   * Suppresses the XML declaration from the output.
   */
  headless?: boolean
  /**
   * Pretty-prints the XML tree.
   */
  prettyPrint?: boolean
  /**
   * Determines the indentation string for pretty printing. Defaults to two
   * space characters.
   */
  indent?: string
  /**
   * Determines the newline string for pretty printing. Defaults to `"\n"`.
   */
  newline?: string
  /**
   * Defines a fixed number of indentations to add to every line. Defaults to 
   * `0`.
   */
  offset?: number
  /**
   * Determines the maximum column width. Defaults to `80`.
   */
  width?: number
  /**
   * Produces closing tags for empty element nodes. Defaults to `false`. With
   * this option set to `true`, closing tags will be produced for element nodes
   * without child nodes, e.g.
   * ```xml
   * <node></node>
   * ```
   * Otherwise, empty element nodes will be self-closed, e.g.
   * ```xml
   * <node/>
   * ````
   */
  allowEmptyTags?: boolean
  /**
   * Suppresses pretty-printing for text nodes. Defaults to `false`. With this 
   * option set to `true`, a text node will stay on the same line with its 
   * containing element node, e.g.
   * ```xml
   * <node>some text</node>
   * ```
   * Otherwise, it will be printed on a new line. e.g.
   * ```xml
   * <node>
   *   some text
   * </node>
   * ```
   */
  dontPrettyPrintTextNodes?: boolean
  /**
   * Inserts a space character before the slash character of self-closing tags. 
   * Defaults to `false`. With this options set to `true`, a space character 
   * will be inserted before the slash character of self-closing tags, e.g.
   * ```xml
   * <node />
   * ```
   */
  spaceBeforeSlash?: boolean
  /**
   * Prevents existing html entities from being re-encoded.
   */
  noDoubleEncoding?: boolean
}

/**
 * Defines a recursive type that can represent objects, arrays and maps of
 * serialized nodes.
 */
export type XMLSerializedValue = string | XMLSerializedMap | XMLSerializedArray | XMLSerializedObject
type XMLSerializedObject = { [key: string]: XMLSerializedValue }
interface XMLSerializedMap extends Map<string, XMLSerializedValue> { }
interface XMLSerializedArray extends Array<XMLSerializedValue> { }

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
  options: BuilderOptions

  /**
   * Gets or sets the character validator.
   */
  validate: Validator

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
   * Creates a new DocType node and inserts it into the document. If the 
   * document already contains a DocType node it will be replaced by the new
   * node. Otherwise it will be inserted before the document element node.
   * 
   * @param pubID - public identifier
   * @param sysID - system identifier
   * 
   * @returns current element node
   */
  dtd(pubID?: string, sysID?: string): XMLBuilder

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

  /**
   * Converts the node into its string representation.
   * 
   * @param options - serialization options
   */
  toString(writerOptions?: WriterOptions): string

  /**
   * Converts the node into its object representation.
   * 
   * @param options - serialization options
   */
  toObject(writerOptions?: WriterOptions): XMLSerializedValue

  /**
   * Converts the entire XML document into its string or object representation.
   * 
   * @param options - serialization options
   */
  end(writerOptions?: WriterOptions): XMLSerializedValue
}
