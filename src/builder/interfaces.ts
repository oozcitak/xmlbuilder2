import { 
  Node, Document, DocumentType, DocumentFragment, Attr, Text, CDATASection, 
  Comment, ProcessingInstruction, Element 
} from "@oozcitak/dom/lib/dom/interfaces"

/**
 * Represents a document with XML builder settins applied.
 */
export interface DocumentWithSettings {
  _xmlBuilderValidator: Validator
  _xmlBuilderOptions: XMLBuilderOptions
}

/**
 * Defines the options used while creating an XML document.
 */
export interface XMLBuilderCreateOptions {
  /**
   * A version number string, e.g. `"1.0"`. Defaults to `"1.0"`.
   */
  version?: "1.0" | "1.1"
  /**
   * Encoding declaration, e.g. `"UTF-8"`. No default.
   */
  encoding?: string
  /**
   * Standalone document declaration: `true` or `false`. No default.
   */
  standalone?: boolean
  /**
   * Whether nodes with `null` values will be kept or ignored. Defaults to 
   * `false`.
   */
  keepNullNodes?: boolean
  /**
   * Whether attributes with `null` values will be kept or ignored. Defaults to 
   * `false`.
   */
  keepNullAttributes?: boolean
  /** 
   * Whether converter strings will be ignored when converting JS 
   * objects to nodes. Defaults to `false`.
   */
  ignoreConverters?: boolean
  /** 
   * Defines string keys used while converting JS objects to nodes.
   */
  convert?: Partial<ConvertOptions>
}

/**
 * Defines the options used while creating an XML document.
 */
export interface XMLBuilderOptions {
  /**
   * A version number string, e.g. `"1.0"`
   */
  version: "1.0" | "1.1"
  /**
   * Encoding declaration, e.g. `"UTF-8"`
   */
  encoding: string | undefined
  /**
   * Standalone document declaration: `true` or `false`
   */
  standalone: boolean | undefined
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
}

/**
 * Defines the identifier strings of the DocType node.
 */
export interface DTDOptions {
  /**
   * Public identifier of the DTD
   */
  pubID?: string
  /**
   * System identifier of the DTD
   */
  sysID?: string
}

/**
 * Defines string keys used while converting JS objects to nodes.
 */
export interface ConvertOptions {
  /** 
   * When prepended to a JS object key, converts its key-value pair 
   * to an attribute. Defaults to `"@"`. Multiple attributes can also be grouped
   * under the attribute key. For example:
   * ```js
   * obj1 = { pilot: { '@callsign': 'Maverick', '@rank': 'Lieutenant' } }
   * obj2 = { pilot: { '@': { 'callsign': 'Maverick', 'rank': 'Lieutenant' } } }
   * ```
   * both become:
   * ```xml
   * <pilot callsign="Maverick" rank="Lieutenant"/>
   * ````
   */
  att: string
  /** 
   * When prepended to a JS object key, converts its value to a processing
   * instruction node. Defaults to `"?"`. Instruction target and value should
   * be separated with a single space character. For example:
   * ```js
   * obj = { 
   *   '?': 'background classified ref="NAM#123456"',
   *   pilot: 'Pete Mitchell'
   * }
   * ```
   * becomes:
   * ```xml
   * <?background classified ref="NAM#123456"?>
   * <pilot>Pete Mitchell</pilot>
   * ````
   */
  ins: string
  /** 
   * When prepended to a JS object key, converts its value to a text node. 
   * Defaults to `"#"`. For example:
   * ```js
   * obj = { monologue: {
   *   '#': 'Talk to me Goose!',
   * } }
   * ```
   * becomes:
   * ```xml
   * <monologue>Talk to me Goose!</monologue>
   * ````
   * 
   * _Note:_ Since JS objects cannot contain duplicate keys, multiple text 
   * nodes can be created by adding some unique text after each object 
   * key. For example: 
   * ```js
   * obj = { monologue: {
   *   '#1': 'Talk to me Goose!',
   *   '#2': 'Talk to me...'
   * } }
   * ```
   * becomes:
   * ```xml
   * <monologue>Talk to me Goose!Talk to me...</monologue>
   * ````
   * 
   * _Note:_ `"#"` also allows mixed content. Example:
   * ```js
   * obj = { monologue: {
   *   '#1': 'Talk to me Goose!',
   *   'cut': 'dog tag shot',
   *   '#2': 'Talk to me...'
   * } }
   * ```
   * becomes:
   * ```xml
   * <monologue>
   *   Talk to me Goose!
   *   <cut>dog tag shot</cut>
   *   Talk to me...
   * </monologue>
   * ````
   */
  text: string
  /** 
   * When prepended to a JS object key, converts its value to a CDATA 
   * node. Defaults to `"$"`. For example:
   * ```js
   * obj = { 
   *   '$': '<a href="https://topgun.fandom.com/wiki/MiG-28"/>',
   *   aircraft: 'MiG-28'
   * }
   * ```
   * becomes:
   * ```xml
   * <![CDATA[<a href="https://topgun.fandom.com/wiki/MiG-28"/>]]>
   * <aircraft>MiG-28</aircraft>
   * ````
   */
  cdata: string
  /** 
   * When prepended to a JS object key, converts its value to a 
   * comment node. Defaults to `"!"`. For example:
   * ```js
   * obj = {
   *   '!': 'Fictional; MiGs use odd numbers for fighters.',
   *   aircraft: 'MiG-28'
   * }
   * ```
   * becomes:
   * ```xml
   * <!--Fictional; MiGs use odd numbers for fighters.-->
   * <aircraft>MiG-28</aircraft>
   * ````
   */
  comment: string
}

/**
 * Defines default values for builder options.
 */
export const DefaultBuilderOptions: Partial<XMLBuilderOptions> = {
  version: "1.0",
  keepNullNodes: false,
  keepNullAttributes: false,
  ignoreConverters: false,
  convert: {
    att: "@",
    ins: "?",
    text: "#",
    cdata: "$",
    comment: "!"
  }
}

/**
 * Defines a function that validates character data in XML nodes. 
 */
type ValidatorFunction = (val: string, debugInfo?: string) => string

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
 * Defines the options passed to the writer.
 */
type BaseWriterOptions  = {
  /**
   * Output format. Defaults to `"xml"`.
   * - `"xml"` - Serializes the document as a string in XML format.
   * - `"map"` - Serializes the document as an object using `Map`s and 
   * `Array`s.
   * - `"object"` - Serializes the document as an object using `Object`s and
   * `Array`s.
   * - `"json"` - Serializes the document as a JSON string.
   */
  format?: "xml" | "map" | "object" | "json"
}

/**
 * Defines the options passed to the map writer.
 */
export type MapWriterOptions = BaseWriterOptions & {
  /** @inheritdoc */
  format?: "map"
}

/**
 * Defines the options passed to the object writer.
 */
export type ObjectWriterOptions = BaseWriterOptions & {
  /** @inheritdoc */
  format?: "object"
}

/**
 * Defines the options passed to the object writer.
 */
export type StringWriterOptions = BaseWriterOptions & {
  /** @inheritdoc */
  format?: "xml"
  /**
   * Suppresses the XML declaration from the output. Defaults to `false`.
   */
  headless?: boolean
  /**
   * Pretty-prints the XML tree. Defaults to `false`.
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
   * ```
   */
  allowEmptyTags?: boolean
  /**
   * Indents contents of text-only element nodes. Defaults to `false` which 
   * keeps a text node on the same line with its containing element node, e.g.
   * ```xml
   * <node>some text</node>
   * ```
   * Otherwise, it will be printed on a new line. e.g.
   * ```xml
   * <node>
   *   some text
   * </node>
   * ```
   * _Note:_ Element nodes with mixed content are always indented regardless
   * of this setting.
   */
  indentTextOnlyNodes?: boolean
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
   * Prevents existing html entities from being re-encoded. Defaults to `false`.
   */
  noDoubleEncoding?: boolean
}

/**
 * Defines the options passed to the JSON writer.
 */
export type JSONWriterOptions = BaseWriterOptions & {
  /** @inheritdoc */
  format?: "json"  
  /**
   * Pretty-prints the XML tree. Defaults to `false`.
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
}

/**
 * Defines the options passed to the writer.
 */
export type WriterOptions = StringWriterOptions | ObjectWriterOptions | 
  JSONWriterOptions | MapWriterOptions

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
export type ExpandObject = { [key: string]: any } | Map<string, any> |
  any[] | ((...args: any) => any)

/**
 * Represents the type of a variable that is a JS object defining
 * attributes.
 */
export type AttributesObject = Map<string, any> | {
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
 * Represents the type of a variable that is a JS object defining
 * processing instructions.
 */
export type PIObject = Map<string, string> | string[] | {
  /**
   * Processing instruction target/data pairs
   */
  [key: string]: string
}

/**
 * Serves as an entry point to builder functions.
 */
export interface XMLBuilder {

  /**
   * Creates and returns a new document fragment.
   * 
   * @returns document fragment node
   */
  fragment(): XMLBuilderNode

  /**
   * Creates and returns a new document fragment.
   * 
   * @param contents - a string containing an XML fragment in either XML or JSON
   * format or a JS object representing nodes to insert
   * 
   * @returns document fragment node
   */
  fragment(contents: string | ExpandObject): XMLBuilderNode

  /**
   * Creates an XML document.
   * 
   * @returns document node
   */
  document(): XMLBuilderNode

  /**
   * Creates an XML document by parsing the given document representation.
   * 
   * @param contents - a string containing an XML document in either XML or JSON
   * format or a JS object representing nodes to insert
   * 
   * @returns document node
   */
  document(contents: string | ExpandObject): XMLBuilderNode

}

/**
 * Represents a mixin that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export interface XMLBuilderNode {
  
  /**
   * Returns the underlying DOM node.
   */
  readonly as: CastAsNode

  /**
   * Sets builder options.
   * 
   * @param - builder options
   * 
   * @returns current element node
   */
  set(builderOptions: Partial<XMLBuilderOptions>): XMLBuilderNode

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param namespace - element namespace
   * @param name - element name
   * @param attributes - a JS object with element attributes
   * 
   * @returns the new element node
   */
  ele(namespace: string, name: string,
    attributes?: AttributesObject): XMLBuilderNode

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param name - element name
   * @param attributes - a JS object with element attributes
   * 
   * @returns the new element node
   */
  ele(name: string, attributes?: AttributesObject): XMLBuilderNode

  /**
   * Creates new element nodes from the given JS object and appends it to the
   * list of child nodes.
   * 
   * @param obj - a JS object representing nodes to insert
   * 
   * @returns the last top level element node created
   */
  ele(obj: ExpandObject): XMLBuilderNode

  /**
   * Removes this node from the XML document.
   * 
   * @returns parent element node
   */
  remove(): XMLBuilderNode

  /**
   * Creates or updates an element attribute.
   * 
   * @param namespace - namespace of the attribute
   * @param name - attribute name
   * @param value - attribute value
   * 
   * @returns current element node
   */
  att(namespace: string, name: string, value: string): XMLBuilderNode

  /**
   * Creates or updates an element attribute.
   * 
   * @param name - attribute name
   * @param value - attribute value
   * 
   * @returns current element node
   */
  att(name: string, value: string): XMLBuilderNode

  /**
   * Creates or updates an element attribute.
   * 
   * @param obj - a JS object containing element attributes and values
   * 
   * @returns current element node
   */
  att(obj: AttributesObject): XMLBuilderNode

  /**
   * Removes an attribute
   * 
   * @param name - attribute name
   * 
   * @returns current element node
   */
  removeAtt(name: string): XMLBuilderNode

  /**
   * Removes a list of attributes.
   * 
   * @param names - an array with attribute names
   * 
   * @returns current element node
   */
  removeAtt(names: string[]): XMLBuilderNode

  /**
   * Removes an attribute
   * 
   * @param namespace - namespace of the attribute to remove
   * @param name - attribute name
   * 
   * @returns current element node
   */
  removeAtt(namespace: string, name: string): XMLBuilderNode

  /**
   * Removes a list of attributes.
   * 
   * @param namespace - namespace of the attributes to remove
   * @param names - an array with attribute names
   * 
   * @returns current element node
   */
  removeAtt(namespace: string, names: string[]): XMLBuilderNode

  /**
   * Creates a new text node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  txt(content: string): XMLBuilderNode

  /**
   * Creates a new comment node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  com(content: string): XMLBuilderNode

  /**
   * Creates a new CDATA node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  dat(content: string): XMLBuilderNode

  /**
   * Creates a new processing instruction node and appends it to the list of 
   * child nodes.
   * 
   * @param target - instruction target
   * @param content - node content
   * 
   * @returns current element node
   */
  ins(target: string, content?: string): XMLBuilderNode

  /**
   * Creates new processing instruction nodes by expanding the given object and
   * appends them to the list of child nodes.
   * 
   * @param contents - a JS object containing processing instruction targets 
   * and values or an array of strings
   * 
   * @returns current element node
   */
  ins(target: PIObject): XMLBuilderNode

  /**
   * Updates XML declaration.
   * 
   * @param options - declaration options
   * 
   * @returns current element node
   */
  dec(options: { version: "1.0" | "1.1", encoding?: string, standalone?: boolean }): XMLBuilderNode

  /**
   * Creates a new DocType node and inserts it into the document. If the 
   * document already contains a DocType node it will be replaced by the new
   * node. Otherwise it will be inserted before the document element node.
   * 
   * @param options - DocType identifiers
   * 
   * @returns current element node
   */
  dtd(options?: DTDOptions): XMLBuilderNode

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
  import(node: XMLBuilderNode): XMLBuilderNode

  /**
   * Returns the document node.
   */
  doc(): XMLBuilderNode

  /**
   * Returns the root element node.
   */
  root(): XMLBuilderNode

  /**
   * Returns the parent node.
   */
  up(): XMLBuilderNode

  /**
   * Returns the previous sibling node.
   */
  prev(): XMLBuilderNode

  /**
   * Returns the next sibling node.
   */
  next(): XMLBuilderNode

  /**
   * Returns the first child node.
   */
  first(): XMLBuilderNode

  /**
   * Returns the last child node.
   */
  last(): XMLBuilderNode

  /**
   * Traverses through the child nodes of an element node.
   * 
   * @param callback - a callback function to apply to each node
   * @param thisArg - value to use as this when executing callback
   */
  forEachChild(callback: (node: XMLBuilderNode) => void, thisArg?: any): XMLBuilderNode

  /**
   * Traverses through the attributes of an element node.
   * 
   * @param callback - a callback function to apply to each attribute
   * @param thisArg - value to use as this when executing callback
   */
  forEachAttribute(callback: (node: XMLBuilderNode) => void, thisArg?: any): XMLBuilderNode

  /**
   * Converts the node into its string representation.
   * 
   * @param options - serialization options
   */
  toString(writerOptions?: JSONWriterOptions | StringWriterOptions): string

  /**
   * Converts the node into its object representation.
   * 
   * @param options - serialization options
   */
  toObject(writerOptions?: MapWriterOptions | ObjectWriterOptions): XMLSerializedValue

  /**
   * Converts the entire XML document into its string or object representation.
   * 
   * @param options - serialization options
   */
  end(writerOptions?: WriterOptions): XMLSerializedValue
}

/**
 * Returns underlying DOM nodes.
 */
export interface CastAsNode {
  /**
   * Casts to `any` to call methods without a TypeScript definition.
   */  
  readonly any: any

  /**
   * Returns the underlying DOM node.
   */  
  readonly node: Node

  /**
   * Returns the underlying DOM document node.
   */
  readonly document: Document

  /**
   * Returns the underlying DOM document type node.
   */
  readonly documentType: DocumentType

  /**
   * Returns the underlying DOM document fragment node.
   */
  readonly documentFragment: DocumentFragment

  /**
   * Returns the underlying DOM attr node.
   */
  readonly attr: Attr

  /**
   * Returns the underlying DOM text node.
   */
  readonly text: Text

  /**
   * Returns the underlying DOM cdata section node.
   */
  readonly cdataSection: CDATASection

  /**
   * Returns the underlying DOM comment node.
   */
  readonly comment: Comment

  /**
   * Returns the underlying DOM processing instruction node.
   */
  readonly processingInstruction: ProcessingInstruction

  /**
   * Returns the underlying DOM element node.
   */
  readonly element: Element

}