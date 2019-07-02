import {
  WriterOptions, XMLSerializedValue, PreSerializedNode, XMLBuilderOptions
} from "../interfaces"
import {
  Node, Element, Text, CDATASection, Comment, ProcessingInstruction, 
  NodeType, CharacterData
} from "../../dom/interfaces"
import { PreSerializer } from "../util"
import { applyDefaults } from "../../util"

/**
 * Serializes XML nodes into maps and arrays.
 */
export class MapWriterImpl {

  private _builderOptions: XMLBuilderOptions

  /**
   * Initializes a new instance of `MapWriterImpl`.
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
  serialize(node: Node, writerOptions?: WriterOptions): XMLSerializedValue {
    const options: XMLBuilderOptions = applyDefaults(writerOptions, {
      format: "map"
    })

    const preNode = PreSerializer.Serialize(node)

    switch (preNode.node.nodeType) {
      case NodeType.Element:
      case NodeType.Document:
      case NodeType.DocumentFragment:
        return this._serializeNode(preNode, options)
      case NodeType.Comment:
      case NodeType.Text:
      case NodeType.CData:
        return new Map<string, XMLSerializedValue>([[this._getNodeKey(preNode)[0], 
          (<CharacterData>node).data]])
      case NodeType.ProcessingInstruction:
        const pi = <ProcessingInstruction>node
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
  protected _serializeNode(preNode: PreSerializedNode<Node>,
    options: XMLBuilderOptions): XMLSerializedValue {
    switch (preNode.node.nodeType) {
      case NodeType.Element:
        return this._serializeElement(preNode, options)
      case NodeType.Document:
        return this._serializeChildNodes(preNode, options)
      case NodeType.Comment:
        return (<Comment>preNode.node).data
      case NodeType.Text:
        return (<Text>preNode.node).data
      case NodeType.DocumentFragment:
        return this._serializeChildNodes(preNode, options)
      case NodeType.ProcessingInstruction:
        const pi = <ProcessingInstruction>preNode.node
        return `${pi.target} ${pi.data}`
      case NodeType.CData:
        return (<CDATASection>preNode.node).data
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
  private _serializeElement(preNode: PreSerializedNode<Node>,
    options: XMLBuilderOptions): XMLSerializedValue {
    return new Map<string, XMLSerializedValue>([
      [<string><unknown>preNode.name, this._serializeChildNodes(preNode, options)]
    ])
  }

  /**
   * Produces an XML serialization of the given node's children.
   * 
   * @param preNode - current node
   * @param options - serialization options
   */
  private _serializeChildNodes(preNode: PreSerializedNode<Node>,
    options: XMLBuilderOptions): XMLSerializedValue {
    const items = new Array<[string, boolean, PreSerializedNode<Node>]>()
    const keyCount = new Map<string, number>()
    const keyIndices = new Map<string, number>()
    let hasDuplicateKeys = false

    for (const childPreNode of preNode.children) {
      if (childPreNode.node.nodeType === NodeType.DocumentType) continue

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

    if (items.length === 1 && items[0][2].node.nodeType === NodeType.Text) {
      // an element node with a single text node
      return (<Text>(items[0][2].node)).data
    } else {
      const markup = new Map<string, XMLSerializedValue>()
      for (const ns of preNode.namespaces) {
        const key = this._getAttrKey(ns.name)
        markup.set(key, ns.value)
      }
      for (const attr of preNode.attributes) {
        const key = this._getAttrKey(attr.name)
        markup.set(key, attr.value)
      }
      for (const [key, canIncrement, node] of items) {
        // serialize child nodes or node contents
        const nodeResult = node.node.nodeType === NodeType.Element ?
          this._serializeChildNodes(node, options) :
          this._serializeNode(node, options)

        if (canIncrement && <number>keyCount.get(key) > 1) {
          // generate a unique key
          let index = (keyIndices.get(key) || 0) + 1
          const uniqueKey = key + index.toString()
          keyIndices.set(key, index)

          markup.set(uniqueKey, nodeResult)
        } else if (<number>keyCount.get(key) > 1) {
          // cannot generate a unique key, create an array to hold nodes with
          // duplicate keys
          const nodeList = <Array<XMLSerializedValue>>(markup.get(key) || [])
          nodeList.push(nodeResult)
          markup.set(key, nodeList)
        } else {
          // object already has a unique key
          markup.set(key, nodeResult)
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
  private _getNodeKey(preNode: PreSerializedNode<Node>): [string, boolean] {
    const isRaw = (<any><unknown>preNode.node)._isRawNode

    if (isRaw) {
      return [this._builderOptions.convert.raw, true]
    }
        
    switch (preNode.node.nodeType) {
      case NodeType.Element:
        return [(<Element>preNode.node).tagName, false]
      case NodeType.Comment:
        return [this._builderOptions.convert.comment, true]
      case NodeType.Text:
        return [this._builderOptions.convert.text, true]
      case NodeType.ProcessingInstruction:
        return [this._builderOptions.convert.ins, true]
      case NodeType.CData:
        return [this._builderOptions.convert.cdata, true]
      /* istanbul ignore next */
      default:
        throw new Error("Invalid node type.")
    }
  }

}