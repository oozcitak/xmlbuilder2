import { 
  Node, Attr, XMLDocument, Element, DocumentType, Text, CDATASection,
  Comment, ProcessingInstruction, DocumentFragment
} from "../dom/interfaces"

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
 * Defines the options passed to the XML writer.
 */
export interface WriterOptions {
  /**
   * Whether to suppress the XML declaration from the output
   */
  headless?: boolean
  /**
   * Whether to pretty-print the XML tree
   */
  prettyPrint?: boolean
  /**
   * Indentation string for pretty printing. Defaults to two space characters.
   */
  indent?: string
  /**
   * Newline string for pretty printing. Defaults to `"\n"`.
   */
  newline?: string
  /**
   * A fixed number of indentations to add to every line
   */
  offset?: number
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
  noDoubleEncoding?: boolean
  /**
   * Defines the current state of the writer
   */
  state?: WriterState
  /**
   * User data which will be passed to writer functions
   */
  user?: any
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
   * Produces an XML serialization of the given node. This function is the main
   * entry point to the serializer. It branches on the type of node to call
   * specialized serializer functions.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   */
  serialize(node: Node, options?: WriterOptions): T

  /**
   * Serializes a document node.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   */
  document?(node: PreSerializedNode<XMLDocument>, options: WriterOptions): T

  /**
   * Serializes a document type node.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   */
  documentType?(node: PreSerializedNode<DocumentType>, options: WriterOptions): T

  /**
   * Serializes a document fragment node.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   */
  documentFragment?(node: PreSerializedNode<DocumentFragment>, options: WriterOptions): T

  /**
   * Serializes an element node.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   */
  element?(node: PreSerializedNode<Element>, options: WriterOptions): T

  /**
   * Serializes a text node.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   */
  text?(node: PreSerializedNode<Text>, options: WriterOptions): T

  /**
   * Serializes a CDATA node.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   */
  cdata?(node: PreSerializedNode<CDATASection>, options: WriterOptions): T

  /**
   * Serializes a comment node.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   */
  comment?(node: PreSerializedNode<Comment>, options: WriterOptions): T

  /**
   * Serializes a processing instruction node.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   */
  processingInstruction?(node: PreSerializedNode<ProcessingInstruction>, options: WriterOptions): T

  /**
   * Serializes an attribute.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   */
  attribute?(node: PreSerializedAttr, options: WriterOptions): T

  /**
   * Serializes a namespace declaration.
   * 
   * @param node - node to serialize
   * @param options - serialization options
   */
  namespace?(node: PreSerializedNS, options: WriterOptions): T

  /** 
   * Called before starting a new line of output. Not all writers use this 
   * function. A string writer may use this function to write the indentation
   * string. 
   * 
   * @param node - current node
   * @param options - serialization options
   */
  beginLine?(node: PreSerializedNode<Node>, options: WriterOptions): T

  /** 
   * Called before completing the current line of output. Not all writers use 
   * this function. A string writer may use this function to write the newline
   * string. 
   * 
   * @param node - current node
   * @param options - serialization options
   */
  endLine?(node: PreSerializedNode<Node>, options: WriterOptions): T

  /** 
   * Called right after starting writing a node. This function does not 
   * produce any output, but can be used to alter the state of the writer. 
   * 
   * @param node - current node
   * @param options - serialization options
   */
  openNode?(node: PreSerializedNode<Node>, options: WriterOptions): void

  /** 
   * Called right before completing writing a node. This function does not 
   * produce any output, but can be used to alter the state of the writer.
   * 
   * @param node - current node
   * @param options - serialization options
   */
  closeNode?(node: PreSerializedNode<Node>, options: WriterOptions): void

  /** 
   * Called right after starting writing an attribute. This function does 
   * not produce any output, but can be used to alter the state of the 
   * writer. 
   * 
   * @param node - current attribute
   * @param options - serialization options
   */
  openAttribute?(node: PreSerializedAttr, options: WriterOptions): void

  /** 
   * Called right before completing writing an attribute. This function 
   * does not produce any output, but can be used to alter the state of 
   * the writer. 
   * 
   * @param node - current attribute
   * @param options - serialization options
   */
  closeAttribute?(node: PreSerializedAttr, options: WriterOptions): void
}

/**
 * Represents a recursive type that can for arrays and maps of serialized nodes.
 * Uses the approach in explained in: 
 * https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
 */
export type XMLSerializedValue = string | XMLSerializedObject | XMLSerializedArray
interface XMLSerializedObject extends Map<string, XMLSerializedValue> { }
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

  /**
   * Converts the node into its string representation.
   * 
   * @param options - serialization options
   */
  toString(options?: WriterOptions): string

  /**
   * Converts the node into its object representation.
   * 
   * @param options - serialization options
   */
  toObject(options?: WriterOptions): XMLSerializedValue

  /**
   * Converts the entire XML document into its string representation.
   * 
   * @param options - serialization options
   */
  end(options?: WriterOptions): string
}
