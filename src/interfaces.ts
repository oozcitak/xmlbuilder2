import { Node, Document } from "@oozcitak/dom/lib/dom/interfaces"

/**
 * Represents a document with XML builder settings applied.
 */
export interface DocumentWithSettings extends Document {
  _xmlBuilderOptions: XMLBuilderOptions
}

/**
 * Defines the options used while creating an XML document.
 */
export interface XMLBuilderCreateOptions {
  /**
   * A version number string, always `"1.0"`.
   */
  version?: "1.0"
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
  /**
   * Defines default namespaces to apply to all elements and attributes.
   */
  defaultNamespace?: {
    ele?: null | string,
    att?: null | string
  }
  /**
   * Defines namespace aliases.
   */
  namespaceAlias?: { [key: string]: string | null }
}

/**
 * Defines the options used while creating an XML document.
 */
export interface XMLBuilderOptions {
  /**
   * A version number string, e.g. `"1.0"`
   */
  version: "1.0"
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
  /**
   * Defines default namespaces to apply to all elements and attributes.
   */
  defaultNamespace: {
    ele: undefined | null | string,
    att: undefined | null | string
  }
  /**
   * Defines namespace aliases.
   */
  namespaceAlias: { [key: string]: string | null }
}

/**
 * Contains keys of `XMLBuilderOptions`.
 */
export const XMLBuilderOptionKeys = new Set([
  "version", "encoding", "standalone", "keepNullNodes", "keepNullAttributes",
  "ignoreConverters", "convert", "defaultNamespace", "namespaceAlias"
])

/**
 * Defines the identifier strings of the DocType node.
 */
export interface DTDOptions {
  /**
   * Name of the DTD. If name is omitted, it will be taken from the document
   * element node.
   */
  name?: string
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
  },
  defaultNamespace: {
    ele: undefined,
    att: undefined
  },
  namespaceAlias: {
    html: "http://www.w3.org/1999/xhtml",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/",
    mathml: "http://www.w3.org/1998/Math/MathML",
    svg: "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink"
  }
}

/**
 * Defines the options passed to the writer.
 */
type BaseWriterOptions = {
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
  /**
   * Ensures that the document adheres to the syntax rules specified by the
   * XML specification. If this flag is set and the document is not well-formed
   * errors will be thrown. Defaults to `false`.
   */
  wellFormed?: boolean
}

/**
 * Defines the options passed to the map writer.
 */
export type MapWriterOptions = BaseWriterOptions & {
  /** @inheritdoc */
  format?: "map"
  /**
   * Groups consecutive nodes of same type under a single object. Defaults to
   * `true`.
   */
  group?: boolean
}

/**
 * Defines the options passed to the object writer.
 */
export type ObjectWriterOptions = BaseWriterOptions & {
  /** @inheritdoc */
  format?: "object"
  /**
   * Groups consecutive nodes of same type under a single object. Defaults to
   * `true`.
   */
  group?: boolean
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
   * Wraps attributes to the next line if the column width exceeds the given
   * value. Defaults to `0` which disables attribute wrapping.
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
  /**
   * Groups consecutive nodes of same type under a single object. Defaults to
   * `true`.
   */
  group?: boolean
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
  any[] | Set<any> | ((...args: any) => any)

/**
 * Represents the type of a variable that is a JS object defining
 * attributes.
 */
export type AttributesObject = Map<string, any> | {
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
 * Represents a wrapper around XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export interface XMLBuilder {

  /**
   * Returns the underlying DOM node.
   */
  readonly node: Node

  /**
   * Sets builder options.
   * 
   * @param - builder options
   * 
   * @returns current element node
   */
  set(builderOptions: Partial<XMLBuilderOptions>): XMLBuilder

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param namespace - element namespace
   * @param name - element name
   * @param attributes - a JS object with element attributes
   * 
   * @returns the new element node
   */
  ele(namespace: string | null, name: string, attributes?: AttributesObject): XMLBuilder

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param name - element name
   * @param attributes - a JS object with element attributes
   * 
   * @returns the new element node
   */
  ele(name: string, attributes?: AttributesObject): XMLBuilder

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
   * Removes this node from the XML document.
   * 
   * @returns parent element node
   */
  remove(): XMLBuilder

  /**
   * Creates or updates an element attribute.
   * 
   * @param namespace - namespace of the attribute
   * @param name - attribute name
   * @param value - attribute value
   * 
   * @returns current element node
   */
  att(namespace: string | null, name: string, value: string): XMLBuilder

  /**
   * Creates or updates an element attribute.
   * 
   * @param name - attribute name
   * @param value - attribute value
   * 
   * @returns current element node
   */
  att(name: string, value: string): XMLBuilder

  /**
   * Creates or updates an element attribute.
   * 
   * @param obj - a JS object containing element attributes and values
   * 
   * @returns current element node
   */
  att(obj: AttributesObject): XMLBuilder

  /**
   * Removes an attribute.
   * 
   * @param name - attribute name
   * 
   * @returns current element node
   */
  removeAtt(name: string): XMLBuilder

  /**
   * Removes a list of attributes.
   * 
   * @param names - an array with attribute names
   * 
   * @returns current element node
   */
  removeAtt(names: string[]): XMLBuilder

  /**
   * Removes an attribute.
   * 
   * @param namespace - namespace of the attribute to remove
   * @param name - attribute name
   * 
   * @returns current element node
   */
  removeAtt(namespace: string | null, name: string): XMLBuilder

  /**
   * Removes a list of attributes.
   * 
   * @param namespace - namespace of the attributes to remove
   * @param names - an array with attribute names
   * 
   * @returns current element node
   */
  removeAtt(namespace: string | null, names: string[]): XMLBuilder

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
   * Creates new processing instruction nodes by expanding the given object and
   * appends them to the list of child nodes.
   * 
   * @param contents - a JS object containing processing instruction targets 
   * and values or an array of strings
   * 
   * @returns current element node
   */
  ins(target: PIObject): XMLBuilder

  /**
   * Updates XML declaration.
   * 
   * @param options - declaration options
   * 
   * @returns current element node
   */
  dec(options: { version?: "1.0", encoding?: string, standalone?: boolean }): XMLBuilder

  /**
   * Creates a new DocType node and inserts it into the document. If the 
   * document already contains a DocType node it will be replaced by the new
   * node. Otherwise it will be inserted before the document element node.
   * 
   * @param options - DocType identifiers
   * 
   * @returns current element node
   */
  dtd(options?: DTDOptions): XMLBuilder

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
   * Traverses through the child nodes of a node. `callback` is called with two
   * arguments: `(node, index)`.
   * 
   * @param callback - a callback function to apply to each child node
   * @param self - whether to visit the current node along with child nodes
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   * @param thisArg - value to use as this when executing callback
   */
  each(callback: ((node: XMLBuilder, index: number) => void),
    self?: boolean, recursive?: boolean, thisArg?: any): XMLBuilder

  /**
   * Produces an array of values by transforming each child node with the given
   * callback function. `callback` is called with two arguments: `(node, index)`.
   * 
   * @param callback - a callback function to apply to each child node
   * @param self - whether to visit the current node along with child nodes
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   * @param thisArg - value to use as this when executing callback
   */
  map<T>(callback: ((node: XMLBuilder, index: number) => T),
    self?: boolean, recursive?: boolean, thisArg?: any): T[]

  /**
   * Reduces child nodes into a single value by applying the given callback 
   * function. `callback` is called with three arguments: `(value, node, index)`.
   * 
   * @param callback - a callback function to apply to each child node
   * @param initialValue - initial value of the iteration
   * @param self - whether to visit the current node along with child nodes
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   * @param thisArg - value to use as this when executing callback
   */
  reduce<T>(callback: ((value: T, node: XMLBuilder, index: number) => T),
    initialValue: T, self?: boolean, recursive?: boolean, thisArg?: any): T

  /**
   * Returns the first child node satisfying the given predicate. `predicate` is
   * called with two arguments: `(node, index)`.
   * 
   * @param predicate - a callback function to apply to each child node
   * @param self - whether to visit the current node along with child nodes
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   * @param thisArg - value to use as this when executing predicate
   */
  find(predicate: ((node: XMLBuilder, index: number) => boolean),
    self?: boolean, recursive?: boolean, thisArg?: any): XMLBuilder | undefined

  /**
   * Produces an array of child nodes which pass the given predicate test.
   * `predicate` is called with two arguments: `(node, index)`.
   * 
   * @param predicate - a callback function to apply to each child node
   * @param self - whether to visit the current node along with child nodes
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   * @param thisArg - value to use as this when executing predicate
   */
  filter(predicate: ((node: XMLBuilder, index: number) => boolean),
    self?: boolean, recursive?: boolean, thisArg?: any): XMLBuilder[]

  /**
   * Returns `true` if all child nodes pass the given predicate test.
   * `predicate` is called with two arguments: `(node, index)`.
   * 
   * @param predicate - a callback function to apply to each child node
   * @param self - whether to visit the current node along with child nodes
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   * @param thisArg - value to use as this when executing predicate
   */
  every(predicate: ((node: XMLBuilder, index: number) => boolean),
    self?: boolean, recursive?: boolean, thisArg?: any): boolean

  /**
   * Returns `true` if any of the child nodes pass the given predicate test.
   * `predicate` is called with two arguments: `(node, index)`.
   * 
   * @param predicate - a callback function to apply to each child node
   * @param self - whether to visit the current node along with child nodes
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   * @param thisArg - value to use as this when executing predicate
   */
  some(predicate: ((node: XMLBuilder, index: number) => boolean),
    self?: boolean, recursive?: boolean, thisArg?: any): boolean

  /**
   * Produces an array of child nodes.
   * 
   * @param self - whether to visit the current node along with child nodes
   * @param recursive - whether to visit all descendant nodes in tree-order or
   * only the immediate child nodes
   */
  toArray(self?: boolean, recursive?: boolean): XMLBuilder[]

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
 * Builds and serializes an XML document in chunks.
 */
export interface XMLBuilderCB {
  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param namespace - element namespace
   * @param name - element name
   * @param attributes - a JS object with element attributes
   * 
   * @returns the builder
   */
  ele(namespace: string | null, name: string, attributes?: AttributesObject): XMLBuilderCB

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param name - element name
   * @param attributes - a JS object with element attributes
   * 
   * @returns callback builder
   */
  ele(name: string, attributes?: AttributesObject): XMLBuilderCB

  /**
   * Creates or updates an element attribute.
   * 
   * @param namespace - namespace of the attribute
   * @param name - attribute name
   * @param value - attribute value
   * 
   * @returns callback builder
   */
  att(namespace: string | null, name: string, value: string): XMLBuilderCB

  /**
   * Creates or updates an element attribute.
   * 
   * @param name - attribute name
   * @param value - attribute value
   * 
   * @returns callback builder
   */
  att(name: string, value: string): XMLBuilderCB

  /**
   * Creates or updates an element attribute.
   * 
   * @param obj - a JS object containing element attributes and values
   * 
   * @returns callback builder
   */
  att(obj: AttributesObject): XMLBuilderCB

  /**
   * Creates a new text node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns callback builder
   */
  txt(content: string): XMLBuilderCB

  /**
   * Creates a new comment node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns callback builder
   */
  com(content: string): XMLBuilderCB

  /**
   * Creates a new CDATA node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns callback builder
   */
  dat(content: string): XMLBuilderCB

  /**
   * Creates a new processing instruction node and appends it to the list of 
   * child nodes.
   * 
   * @param target - instruction target
   * @param content - node content
   * 
   * @returns callback builder
   */
  ins(target: string, content?: string): XMLBuilderCB

  /**
   * Creates new processing instruction nodes by expanding the given object and
   * appends them to the list of child nodes.
   * 
   * @param contents - a JS object containing processing instruction targets 
   * and values or an array of strings
   * 
   * @returns callback builder
   */
  ins(target: PIObject): XMLBuilderCB

  /**
   * Creates the XML declaration.
   * 
   * @param options - declaration options
   * 
   * @returns callback builder
   */
  dec(options?: { version?: "1.0", encoding?: string, standalone?: boolean }): XMLBuilderCB

  /**
   * Creates a new DocType node and inserts it into the document.
   * 
   * @param options - DocType identifiers
   * 
   * @returns callback builder
   */
  dtd(options: DTDOptions & { name: string }): XMLBuilderCB

  /**
   * Closes the current element node.
   * 
   * @returns callback builder
   */
  up(): XMLBuilderCB

  /**
   * Completes serializing the XML document.
   * 
   * @returns callback builder
   */
  end(): XMLBuilderCB
}

/**
 * Defines the options passed to the callback builder.
 */
export type XMLBuilderCBOptions = {
  /**
   * A callback function which is called when a chunk of XML is serialized.
   */
  data: ((chunk: string, level: number) => void)
  /**
   * A callback function which is called when XML serialization is completed.
   */
  end: (() => void)
  /**
   * A callback function which is called when an error occurs.
   */
  error?: ((err: Error) => void)

  /**
   * Defines default namespaces to apply to all elements and attributes.
   */
  defaultNamespace?: {
    ele?: null | string,
    att?: null | string
  }
  /**
   * Defines namespace aliases.
   */
  namespaceAlias?: { [key: string]: string | null }

  /**
   * Ensures that the document adheres to the syntax rules specified by the
   * XML specification. If this flag is set and the document is not well-formed
   * errors will be thrown. Defaults to `false`.
   */
  wellFormed?: boolean
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
   * Wraps attributes to the next line if the column width exceeds the given
   * value. Defaults to `0` which disables attribute wrapping.
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
   * Inserts a space character before the slash character of self-closing tags. 
   * Defaults to `false`. With this options set to `true`, a space character 
   * will be inserted before the slash character of self-closing tags, e.g.
   * ```xml
   * <node />
   * ```
   */
  spaceBeforeSlash?: boolean
}

/**
 * Defines default values for builder options.
 */
export const DefaultXMLBuilderCBOptions: Partial<XMLBuilderCBOptions> = {
  error: (() => { }),
  wellFormed: false,
  prettyPrint: false,
  indent: "  ",
  newline: "\n",
  offset: 0,
  width: 0,
  allowEmptyTags: false,
  spaceBeforeSlash: false,
  defaultNamespace: {
    ele: undefined,
    att: undefined
  },
  namespaceAlias: {
    html: "http://www.w3.org/1999/xhtml",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/",
    mathml: "http://www.w3.org/1998/Math/MathML",
    svg: "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink"
  }
}