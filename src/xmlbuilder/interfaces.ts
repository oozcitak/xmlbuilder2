/**
 * Defines the options used while creating an XML document.
 */
export interface XMLBuilderOptions {
  /**
   * A version number string, e.g. `1.0`
   */
  version?: string
  /**
   * Encoding declaration, e.g. `UTF-8`
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
  noDoubleEncoding?: boolean;
  /**
   * Whether values will be validated and escaped or returned as is
   */
  noValidation?: boolean
  /**
   * A set of functions to use for converting values to strings
   */
  stringify?: XMLStringifier
}

/**
 * Defines the functions used for converting values to strings.
 */
interface XMLStringifier {
  /**
   * Converts an element or attribute name to string
   */
  name?: (v: any) => string;
  /**
   * Converts the contents of a text node to string
   */
  text?: (v: any) => string;
  /**
   * Converts the contents of a CDATA node to string
   */
  cdata?: (v: any) => string;
  /**
   * Converts the contents of a comment node to string
   */
  comment?: (v: any) => string;
  /**
   * Converts the contents of a raw text node to string
   */
  raw?: (v: any) => string;
  /**
   * Converts attribute value to string
   */
  attValue?: (v: any) => string;
  /**
   * Converts processing instruction target to string
   */
  insTarget?: (v: any) => string;
  /**
   * Converts processing instruction value to string
   */
  insValue?: (v: any) => string;
  /**
   * Converts XML version to string
   */
  xmlVersion?: (v: any) => string;
  /**
   * Converts XML encoding to string
   */
  xmlEncoding?: (v: any) => string;
  /**
   * Converts standalone document declaration to string
   */
  xmlStandalone?: (v: any) => string;
  /**
   * Converts DocType public identifier to string
   */
  dtdPubID?: (v: any) => string;
  /**
   * Converts DocType system identifier to string
   */
  dtdSysID?: (v: any) => string;
  /**
   * Converts `!ELEMENT` node content inside Doctype to string
   */
  dtdElementValue?: (v: any) => string;
  /**
   * Converts `!ATTLIST` node type inside DocType to string
   */
  dtdAttType?: (v: any) => string;
  /**
   * Converts `!ATTLIST` node default value inside DocType to string
   */
  dtdAttDefault?: (v: any) => string;
  /**
   * Converts `!ENTITY` node content inside Doctype to string
   */
  dtdEntityValue?: (v: any) => string;
  /**
   * Converts `!NOTATION` node content inside Doctype to string
   */
  dtdNData?: (v: any) => string;
  /** 
   * When prepended to a JS object key, converts the key-value pair 
   * to an attribute. 
   */
  convertAttKey?: string;
  /** 
   * When prepended to a JS object key, converts the key-value pair 
   * to a processing instruction node. 
   */
  convertPIKey?: string;
  /** 
   * When prepended to a JS object key, converts its value to a text node. 
   * 
   * _Note:_ Since JS objects cannot contain duplicate keys, multiple text 
   * nodes can be created by adding some unique text after each object 
   * key. For example: `{ '#text1': 'some text', '#text2': 'more text' };`
   */
  convertTextKey?: string;
  /** 
   * When prepended to a JS object key, converts its value to a CDATA 
   * node. 
   */
  convertCDataKey?: string;
  /** 
   * When prepended to a JS object key, converts its value to a 
   * comment node.
   */
  convertCommentKey?: string;
  /** 
   * When prepended to a JS object key, converts its value to a raw 
   * text node. 
   */
  convertRawKey?: string;
  /**
   * Escapes special characters in text.
   */
  textEscape?: (v: string) => string;
  /**
   * Escapes special characters in attribute values.
   */
  attEscape?: (v: string) => string;
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
   * 
   * @returns the new element node
   */
  element(name: string): XMLBuilder

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param namespace - element namespace
   * @param qualifiedName - qualified name
   * 
   * @returns the new element node
   */
  element(namespace: string, qualifiedName?: string): XMLBuilder

  /**
   * Creates or updates an element attribute.
   * 
   * @param name - attribute name
   * @param value - attribute value
   * 
   * @returns current element node
   */
  attribute(name: string, value: string): XMLBuilder

  /**
   * Creates or updates an element attribute.
   * 
   * @param namespace - attribute namespace
   * @param qualifiedName - qualified name
   * @param value - attribute value
   * 
   * @returns current element node
   */
  attribute(namespace: string, qualifiedName: string, value?: string): XMLBuilder

  /**
   * Creates a new text node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  text(content: string): XMLBuilder

  /**
   * Creates a new comment node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  comment(content: string): XMLBuilder

  /**
   * Creates a new CDATA node and appends it to the list of child nodes.
   * 
   * @param content - node content
   * 
   * @returns current element node
   */
  cdata(content: string): XMLBuilder

  /**
   * Creates a new processing instruction node and appends it to the list of 
   * child nodes.
   * 
   * @param target - instruction target
   * @param content - node content
   * 
   * @returns current element node
   */
  instruction(target: string, content?: string): XMLBuilder

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
  document(): XMLBuilder

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

/**
 * Represents an XML document extended with the builder mixin.
 * 
 * This type actually extends `XMLDocument` but this is not listed in the
 * interface definition to keep the visible API simple.
 */
export interface XMLBuilderDocument extends XMLBuilder {

}

/**
 * Represents an element node extended with the builder mixin.
 * 
 * This type actually extends `Element` but this is not listed in the
 * interface definition to keep the visible API simple.
 */
export interface XMLBuilderElement extends XMLBuilder {

}
