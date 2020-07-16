import { XMLBuilderOptions, ExpandObject, XMLBuilder } from "../interfaces"

/**
 * Pre-serializes XML nodes.
 */
export abstract class BaseReader<U extends string | ExpandObject> {

  protected _builderOptions: XMLBuilderOptions

  /**
   * Initializes a new instance of `BaseWriter`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderOptions) {
    this._builderOptions = builderOptions
  }

  abstract _parse(node: XMLBuilder, obj: U): XMLBuilder
  abstract _docType(name: string, publicId: string, systemId: string): XMLBuilder | undefined
  abstract _comment(parent: XMLBuilder, data: string): XMLBuilder | undefined
  abstract _text(parent: XMLBuilder, data: string): XMLBuilder | undefined
  abstract _instruction(parent: XMLBuilder, target: string, data: string): XMLBuilder | undefined
  abstract _cdata(parent: XMLBuilder, data: string): XMLBuilder | undefined
  abstract _element(parent: XMLBuilder, name: string): XMLBuilder | undefined
  abstract _attribute(parent: XMLBuilder, name: string, value: string): XMLBuilder | undefined

    /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - node to recieve parsed content
   * @param obj - object to parse
   */
  parse(node: XMLBuilder, obj: U): XMLBuilder {
    return this._parse(node, obj)
  }

  /**
   * Used by derived classes to create a DocType node.
   * 
   * @param name - node name
   * @param publicId - public identifier
   * @param systemId - system identifier
   */
  docType(name: string, publicId: string, systemId: string): XMLBuilder | undefined {
    return this._docType(name, publicId, systemId)
  }

  /**
   * Used by derived classes to create a comment node.
   * 
   * @param parent - parent node
   * @param data - node data
   */
  comment(parent: XMLBuilder, data: string): XMLBuilder | undefined {
    return this._comment(parent, data)
  }

  /**
   * Used by derived classes to create a text node.
   * 
   * @param parent - parent node
   * @param data - node data
   */
  text(parent: XMLBuilder, data: string) {
    return this._text(parent, data)
  }

  /**
   * Used by derived classes to create a processing instruction node.
   * 
   * @param parent - parent node
   * @param target - instruction target
   * @param data - node data
   */
  instruction(parent: XMLBuilder, target: string, data: string) {
    return this._instruction(parent, target, data)
  }

  /**
   * Used by derived classes to create a CData section node.
   * 
   * @param parent - parent node
   * @param data - node data
   */
  cdata(parent: XMLBuilder, data: string) {
    return this._cdata(parent, data)
  }

  /**
   * Used by derived classes to create an element node.
   * 
   * @param parent - parent node
   * @param name - node name
   */
  element(parent: XMLBuilder, name: string) {
    return this._element(parent, name)
  }

  /**
   * Used by derived classes to create an attribute or namespace declaration.
   * 
   * @param parent - parent node
   * @param name - node name
   * @param value - node value
   */
  attribute(parent: XMLBuilder, name: string, value: string) {
    return this._attribute(parent, name, value)
  }

}
