import { XMLBuilderOptions, ExpandObject, XMLBuilder } from "../interfaces"

/**
 * Pre-serializes XML nodes.
 */
export abstract class BaseReader<U extends string | ExpandObject> {

  protected _builderOptions: XMLBuilderOptions

  /**
   * Initializes a new instance of `BaseReader`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderOptions) {
    this._builderOptions = builderOptions
    if (builderOptions.parser) {
      Object.assign(this, builderOptions.parser)
    }
  }

  abstract _parse(node: XMLBuilder, obj: U): XMLBuilder

  _docType(parent: XMLBuilder, name: string, publicId: string, systemId: string): XMLBuilder | undefined {
    return parent.dtd({ name: name, pubID: publicId, sysID: systemId })
  }

  _comment(parent: XMLBuilder, data: string): XMLBuilder | undefined {
    return parent.com(data)
  }

  _text(parent: XMLBuilder, data: string): XMLBuilder | undefined {
    return parent.txt(data)
  }

  _instruction(parent: XMLBuilder, target: string, data: string): XMLBuilder | undefined {
    return parent.ins(target, data)
  }

  _cdata(parent: XMLBuilder, data: string): XMLBuilder | undefined {
    return parent.dat(data)
  }

  _element(parent: XMLBuilder, namespace: string | null | undefined, name: string): XMLBuilder | undefined {
    return (namespace === undefined ? parent.ele(name) : parent.ele(namespace, name))
  }

  _attribute(parent: XMLBuilder, namespace: string | null | undefined, name: string, value: string): XMLBuilder | undefined {
    return (namespace === undefined ? parent.att(name, value) : parent.att(namespace, name, value))
  }

  /**
   * Main parser function which parses the given object and returns an XMLBuilder.
   * 
   * @param node - node to recieve parsed content
   * @param obj - object to parse
   */
  parse(node: XMLBuilder, obj: U): XMLBuilder {
    return this._parse(node, obj)
  }

  /**
   * Creates a DocType node.
   * The node will be skipped if the function returns `undefined`.
   * 
   * @param name - node name
   * @param publicId - public identifier
   * @param systemId - system identifier
   */
  docType(parent: XMLBuilder, name: string, publicId: string, systemId: string): XMLBuilder | undefined {
    return this._docType(parent, name, publicId, systemId)
  }

  /**
   * Creates a comment node.
   * The node will be skipped if the function returns `undefined`.
   * 
   * @param parent - parent node
   * @param data - node data
   */
  comment(parent: XMLBuilder, data: string): XMLBuilder | undefined {
    return this._comment(parent, data)
  }

  /**
   * Creates a text node.
   * The node will be skipped if the function returns `undefined`.
   * 
   * @param parent - parent node
   * @param data - node data
   */
  text(parent: XMLBuilder, data: string): XMLBuilder | undefined {
    return this._text(parent, data)
  }

  /**
   * Creates a processing instruction node.
   * The node will be skipped if the function returns `undefined`.
   * 
   * @param parent - parent node
   * @param target - instruction target
   * @param data - node data
   */
  instruction(parent: XMLBuilder, target: string, data: string): XMLBuilder | undefined {
    return this._instruction(parent, target, data)
  }

  /**
   * Creates a CData section node.
   * The node will be skipped if the function returns `undefined`.
   * 
   * @param parent - parent node
   * @param data - node data
   */
  cdata(parent: XMLBuilder, data: string): XMLBuilder | undefined {
    return this._cdata(parent, data)
  }

  /**
   * Creates an element node.
   * The node will be skipped if the function returns `undefined`.
   * 
   * @param parent - parent node
   * @param namespace - node namespace
   * @param name - node name
   */
  element(parent: XMLBuilder, namespace: string | null | undefined, name: string): XMLBuilder | undefined {
    return this._element(parent, namespace, name)
  }

  /**
   * Creates an attribute or namespace declaration.
   * The node will be skipped if the function returns `undefined`.
   * 
   * @param parent - parent node
   * @param namespace - node namespace
   * @param name - node name
   * @param value - node value
   */
  attribute(parent: XMLBuilder, namespace: string | null | undefined, name: string, value: string): XMLBuilder | undefined {
    return this._attribute(parent, namespace, name, value)
  }

}
