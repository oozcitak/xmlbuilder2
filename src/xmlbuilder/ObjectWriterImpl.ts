import {
  WriterOptions, XMLSerializedValue, PreSerializedNode, XMLBuilderOptions
} from "./interfaces"
import {
  Node, Element, Text, CDATASection, Comment, ProcessingInstruction, NodeType
} from "../dom/interfaces"
import { PreSerializer } from "./util"

/**
 * Serializes XML nodes into objects.
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
   * @param options - serialization options
   */
  serialize(node: Node, options?: WriterOptions): XMLSerializedValue {
    options = options || { }
    if (options.format === undefined) {
      options.format = "map"
    }

    return this._serializeNode(PreSerializer.Serialize(node), options)
  }

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param preNode - current node
   * @param options - serialization options
   */
  protected _serializeNode(preNode: PreSerializedNode<Node>,
    options: WriterOptions): XMLSerializedValue {
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
      case NodeType.DocumentType:
        return ''
      case NodeType.ProcessingInstruction:
        return (<ProcessingInstruction>preNode.node).data
      case NodeType.CData:
        return (<CDATASection>preNode.node).data
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
    options: WriterOptions): XMLSerializedValue {
    if (preNode.name === undefined) {
      throw new Error("Element node doesn't have a name.")
    }

    if (options.format === "map") {
      return new Map<string, XMLSerializedValue>([
        [preNode.name, this._serializeChildNodes(preNode, options)]
      ])
    } else if (options.format === "object") {
      const markup: { [key: string]: XMLSerializedValue } = { }
      markup[preNode.name] = this._serializeChildNodes(preNode, options)
      return markup
    } else {
      return ''
    }
  }

  /**
   * Produces an XML serialization of the given node's children.
   * 
   * @param preNode - current node
   * @param options - serialization options
   */
  private _serializeChildNodes(preNode: PreSerializedNode<Node>,
    options: WriterOptions): XMLSerializedValue {
    const items = new Array<[string, PreSerializedNode<Node>]>()
    const keyCount = new Map<string, number>()
    const keyIndices = new Map<string, number>()
    let hasDuplicateKeys = false

    for (const node of preNode.children) {
      const [key, canIncrement] = this._getNodeKey(node)
      items.push([key, node])
      let count = keyCount.get(key)
      count = (count || 0) + 1
      if (!hasDuplicateKeys && !canIncrement && count > 1) [
        hasDuplicateKeys = true
      ]
      keyCount.set(key, count)
      keyIndices.set(key, 0)
    }

    if (hasDuplicateKeys) {
      // child nodes have duplicate keys
      // return an array
      const markup = new Array<XMLSerializedValue>()
      for (const ns of preNode.namespaces) {
        const key = this._getAttrKey(ns.name)
        markup.push(new Map<string, XMLSerializedValue>([[key, ns.value]]))
      }
      for (const attr of preNode.attributes) {
        const key = this._getAttrKey(attr.name)
        markup.push(new Map<string, XMLSerializedValue>([[key, attr.value]]))
      }
      for (const [key, node] of items) {
        const nodeResult = this._serializeNode(node, options)
        markup.push(nodeResult)
      }
      return markup
    } else {
      // child nodes have unique keys
      // return a map
      if (options.format === "map") {
        const markup = new Map<string, XMLSerializedValue>()
        for (const ns of preNode.namespaces) {
          const key = this._getAttrKey(ns.name)
          markup.set(key, ns.value)
        }
        for (const attr of preNode.attributes) {
          const key = this._getAttrKey(attr.name)
          markup.set(key, attr.value)
        }
        for (const [key, node] of items) {
          let uniqueKey = key
          if ((keyCount.get(key) || 0) > 1) {
            let index = (keyIndices.get(key) || 0) + 1
            uniqueKey = key + index.toString()
            keyIndices.set(key, index)
          }
          const nodeResult = this._serializeChildNodes(node, options)
          markup.set(uniqueKey, nodeResult)
        }
        return markup
      } else if (options.format === "object") {
        const markup: { [key: string]: XMLSerializedValue } = { }
        for (const ns of preNode.namespaces) {
          const key = this._getAttrKey(ns.name)
          markup[key] = ns.value
        }
        for (const attr of preNode.attributes) {
          const key = this._getAttrKey(attr.name)
          markup[key] = attr.value
        }
        for (const [key, node] of items) {
          let uniqueKey = key
          if ((keyCount.get(key) || 0) > 1) {
            let index = (keyIndices.get(key) || 0) + 1
            uniqueKey = key + index.toString()
            keyIndices.set(key, index)
          }
          const nodeResult = this._serializeChildNodes(node, options)
          markup[uniqueKey] = nodeResult
        }
        return markup        
      } else {
        return ''
      }
    }
  }

  /**
   * Returns an object key for the given attribute or namespace declaration.
   * 
   * @param name - attribute name
   */
  private _getAttrKey(name: string): string {
    return (this._builderOptions.convertAttKey || '@') + name
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
    switch (preNode.node.nodeType) {
      case NodeType.Element:
        return [(<Element>preNode.node).tagName, false]
      case NodeType.Comment:
        return [this._builderOptions.convertCommentKey || '#comment', true]
      case NodeType.Text:
        return [this._builderOptions.convertTextKey || '#text', true]
      case NodeType.ProcessingInstruction:
        return [(this._builderOptions.convertPIKey || '?') + (<ProcessingInstruction>preNode.node).target, false]
      case NodeType.CData:
        return [this._builderOptions.convertCDataKey || '#cdata', true]
      default:
        throw new Error("Invalid node type.")
    }
  }

}