import {
  WriterOptions, XMLSerializedValue, XMLBuilderOptions
} from "../builder/interfaces"
import { dom, serializer } from "@oozcitak/dom"
import { applyDefaults } from "@oozcitak/util"
import { isRawNode } from "../builder"

/**
 * Serializes XML nodes into objects and arrays.
 */
export class ObjectWriterImpl {

  private _builderOptions: XMLBuilderOptions

  /**
   * Initializes a new instance of `ObjectWriterImpl`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderOptions) {
    this._builderOptions = builderOptions
  }

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - node to serialize
   * @param writerOptions - serialization options
   */
  serialize(node: dom.Interfaces.Node, writerOptions?: WriterOptions): XMLSerializedValue {
    const options: XMLBuilderOptions = applyDefaults(writerOptions, {
      format: "object"
    })

    const pre = new serializer.PreSerializer(this._builderOptions.version)
    const preNode = pre.serialize(node, false)

    switch (preNode.node.nodeType) {
      case dom.Interfaces.NodeType.Element:
      case dom.Interfaces.NodeType.Document:
      case dom.Interfaces.NodeType.DocumentFragment:
        return this._serializeNode(preNode, options)
      case dom.Interfaces.NodeType.Comment:
      case dom.Interfaces.NodeType.Text:
      case dom.Interfaces.NodeType.CData:
        return new Map<string, XMLSerializedValue>([[this._getNodeKey(preNode)[0], 
          (<dom.Interfaces.CharacterData>node).data]])
      case dom.Interfaces.NodeType.ProcessingInstruction:
        const pi = <dom.Interfaces.ProcessingInstruction>node
        return new Map<string, XMLSerializedValue>([[this._getNodeKey(preNode)[0], 
          `${pi.target} ${pi.data}`]])          
      /* istanbul ignore next */
      default:
        throw new Error("Invalid node type.")
    }
  }

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param preNode - current node
   * @param options - serialization options
   */
  protected _serializeNode(preNode:serializer.Interfaces.PreSerializedNode<dom.Interfaces.Node>,
    options: XMLBuilderOptions): XMLSerializedValue {
    switch (preNode.node.nodeType) {
      case dom.Interfaces.NodeType.Element:
        return this._serializeElement(preNode, options)
      case dom.Interfaces.NodeType.Document:
        return this._serializeChildNodes(preNode, options)
      case dom.Interfaces.NodeType.Comment:
        return (<dom.Interfaces.Comment>preNode.node).data
      case dom.Interfaces.NodeType.Text:
        return (<dom.Interfaces.Text>preNode.node).data
      case dom.Interfaces.NodeType.DocumentFragment:
        return this._serializeChildNodes(preNode, options)
      case dom.Interfaces.NodeType.ProcessingInstruction:
        const pi = <dom.Interfaces.ProcessingInstruction>preNode.node
        return `${pi.target} ${pi.data}`
      case dom.Interfaces.NodeType.CData:
        return (<dom.Interfaces.CDATASection>preNode.node).data
      /* istanbul ignore next */
      default:
        throw new Error("Invalid node type.")
    }
  }

  /**
   * Produces an XML serialization of an element node.
   * 
   * @param preNode - current node
   * @param options - serialization options
   */
  private _serializeElement(preNode: serializer.Interfaces.PreSerializedNode<dom.Interfaces.Node>,
    options: XMLBuilderOptions): XMLSerializedValue {
 
    /* istanbul ignore next */
    if (preNode.name === undefined) {
      throw new Error("Pre-serialized node name is undefined.")
    }

    const markup: { [key:string]: any } = { }
    markup[preNode.name] = this._serializeChildNodes(preNode, options)
    return markup
  }

  /**
   * Produces an XML serialization of the given node's children.
   * 
   * @param preNode - current node
   * @param options - serialization options
   */
  private _serializeChildNodes(preNode: serializer.Interfaces.PreSerializedNode<dom.Interfaces.Node>,
    options: XMLBuilderOptions): XMLSerializedValue {
    const items = new Array<[string, boolean, serializer.Interfaces.PreSerializedNode<dom.Interfaces.Node>]>()
    const keyCount = new Map<string, number>()
    const keyIndices = new Map<string, number>()
    let hasDuplicateKeys = false

    for (const childPreNode of preNode.children) {
      if (childPreNode.node.nodeType === dom.Interfaces.NodeType.DocumentType) continue

      const [key, canIncrement] = this._getNodeKey(childPreNode)
      items.push([key, canIncrement, childPreNode])
      let count = keyCount.get(key)
      count = (count || 0) + 1
      if (!hasDuplicateKeys && !canIncrement && count > 1) [
        hasDuplicateKeys = true
      ]
      keyCount.set(key, count)
      keyIndices.set(key, 0)
    }

    if (items.length === 1 && items[0][2].node.nodeType === dom.Interfaces.NodeType.Text) {
      // an element node with a single text node
      return (<dom.Interfaces.Text>(items[0][2].node)).data
    } else {
      const markup: { [key:string]: any } = { }
      for (const attr of preNode.attributes) {
        const key = this._getAttrKey(attr.name)
        markup[key] = attr.value
      }
      for (const [key, canIncrement, node] of items) {
        // serialize child nodes or node contents
        const nodeResult = node.node.nodeType === dom.Interfaces.NodeType.Element ?
          this._serializeChildNodes(node, options) :
          this._serializeNode(node, options)

        if (canIncrement && <number>keyCount.get(key) > 1) {
          // generate a unique key
          let index = (keyIndices.get(key) || 0) + 1
          const uniqueKey = key + index.toString()
          keyIndices.set(key, index)

          markup[uniqueKey] = nodeResult
        } else if (<number>keyCount.get(key) > 1) {
          // cannot generate a unique key, create an array to hold nodes with
          // duplicate keys
          const nodeList = <Array<XMLSerializedValue>>(markup[key] || [])
          nodeList.push(nodeResult)
          markup[key] = nodeList
        } else {
          // object already has a unique key
          markup[key] = nodeResult
        }
      }
      return markup
    }
  }

  /**
   * Returns an object key for the given attribute or namespace declaration.
   * 
   * @param name - attribute name
   */
  private _getAttrKey(name: string): string {
    return this._builderOptions.convert.att + name
  }

  /**
   * Returns an object key for the given node.
   * 
   * @param preNode - node to get a key for
   * 
   * @returns a two-tuple whose first value is the node key and second value
   * is a boolean determining whether the key can be prefixed with a random 
   * string to provide uniqueness.
   */
  private _getNodeKey(preNode: serializer.Interfaces.PreSerializedNode<dom.Interfaces.Node>): [string, boolean] {
    if (isRawNode(preNode.node)) {
      return [this._builderOptions.convert.raw, true]
    }

    switch (preNode.node.nodeType) {
      case dom.Interfaces.NodeType.Element:
        return [(<dom.Interfaces.Element>preNode.node).tagName, false]
      case dom.Interfaces.NodeType.Comment:
        return [this._builderOptions.convert.comment, true]
      case dom.Interfaces.NodeType.Text:
        return [this._builderOptions.convert.text, true]
      case dom.Interfaces.NodeType.ProcessingInstruction:
        return [this._builderOptions.convert.ins, true]
      case dom.Interfaces.NodeType.CData:
        return [this._builderOptions.convert.cdata, true]
      /* istanbul ignore next */
      default:
        throw new Error("Invalid node type.")
    }
  }

}