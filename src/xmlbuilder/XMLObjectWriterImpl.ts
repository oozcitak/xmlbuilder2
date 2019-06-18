import {
  WriterOptions, XMLBuilderOptions, WriterState, XMLSerializedValue,
  PreSerializedNode, PreSerializedAttr, PreSerializedNS
} from "./interfaces"
import {
  Node, XMLDocument, Element, Text, CDATASection,
  Comment, ProcessingInstruction, NodeType, DocumentFragment, DocumentType
} from "../dom/interfaces"
import { XMLWriterImpl } from "./XMLWriterImpl"

/**
 * Serializes XML nodes into objects.
 */
export class XMLObjectWriterImpl extends XMLWriterImpl<XMLSerializedValue> {

  /**
   * Initializes a new instance of `XMLObjectWriterImpl`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderOptions) {
    super(builderOptions)
  }

  /** @inheritdoc */
  document(preNode: PreSerializedNode<XMLDocument>, options: WriterOptions): XMLSerializedValue {
    return this._serializeChildNodes(preNode, options)
  }

  /** @inheritdoc */
  documentType(preNode: PreSerializedNode<DocumentType>, options: WriterOptions): XMLSerializedValue {
    return ''
  }

  /** @inheritdoc */
  documentFragment(preNode: PreSerializedNode<DocumentFragment>, options: WriterOptions): XMLSerializedValue {
    return this._serializeChildNodes(preNode, options)
  }

  /** @inheritdoc */
  element(preNode: PreSerializedNode<Element>, options: WriterOptions): XMLSerializedValue {
    // serialize child-nodes
    options.state = WriterState.InsideTag
    let markup = this._serializeChildNodes(preNode, options)

    options.state = WriterState.None
    return markup
  }

  /** @inheritdoc */
  text(preNode: PreSerializedNode<Text>, options: WriterOptions): XMLSerializedValue {
    return preNode.node.data
  }

  /** @inheritdoc */
  cdata(preNode: PreSerializedNode<CDATASection>, options: WriterOptions): XMLSerializedValue {
    return preNode.node.data
  }

  /** @inheritdoc */
  comment(preNode: PreSerializedNode<Comment>, options: WriterOptions): XMLSerializedValue {
    return preNode.node.data
  }

  /** @inheritdoc */
  processingInstruction(preNode: PreSerializedNode<ProcessingInstruction>, options: WriterOptions): XMLSerializedValue {
    return preNode.node.data
  }

  /** @inheritdoc */
  attribute(preAttr: PreSerializedAttr, options: WriterOptions): XMLSerializedValue {
    return new Map<string, string>([[preAttr.name, preAttr.value]])
  }

  /** @inheritdoc */
  namespace(preNS: PreSerializedNS, options: WriterOptions): XMLSerializedValue {
    return new Map<string, string>([[preNS.name, preNS.value]])
  }

  /** @inheritdoc */
  beginLine(preNode: PreSerializedNode<Node>, options: WriterOptions): XMLSerializedValue {
    return ''
  }

  /** @inheritdoc */
  endLine(preNode: PreSerializedNode<Node>, options: WriterOptions): XMLSerializedValue {
    return ''
  }

  /**
   * Produces an XML serialization of the given node's children.
   * 
   * @param preNode - current node
   * @param options - serialization options
   */
  _serializeChildNodes(preNode: PreSerializedNode<Node>, options: WriterOptions): XMLSerializedValue {
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
      const result = new Array<XMLSerializedValue>()
      for (const ns of preNode.namespaces) {
        const [key, canIncrement] = this._getAttrKey(ns.name)
        result.push(new Map<string, XMLSerializedValue>([[key, ns.value]]))
      }
      for (const attr of preNode.attributes) {
        const [key, canIncrement] = this._getAttrKey(attr.name)
        result.push(new Map<string, XMLSerializedValue>([[key, attr.value]]))
      }
      for (const [key, node] of items) {
        const nodeResult = this._serializeNode(node, options)
        result.push(new Map<string, XMLSerializedValue>([[key, nodeResult]]))
      }
      return result
    } else {
      // child nodes have unique keys
      // return a map
      const result = new Map<string, XMLSerializedValue>()
      for (const ns of preNode.namespaces) {
        const [key, canIncrement] = this._getAttrKey(ns.name)
        result.set(key, ns.value)
      }
      for (const attr of preNode.attributes) {
        const [key, canIncrement] = this._getAttrKey(attr.name)
        result.set(key, attr.value)
      }
      for (const [key, node] of items) {
        let uniqueKey = key
        if ((keyCount.get(key) || 0) > 1) {
          let index = (keyIndices.get(key) || 0) + 1
          uniqueKey = key + index.toString()
          keyIndices.set(key, index)
        }
        const nodeResult = this._serializeNode(node, options)
        result.set(uniqueKey, nodeResult)
      }
      return result
    }
  }

  /**
   * Returns an object key for the given attribute or namespace declaration.
   * 
   * @param name - attribute name
   * 
   * @returns a two-tuple whose first value is the node key and second value
   * is a boolean determining whether the key can be prefixed with a random 
   * string to provide uniqueness.
   */
  private _getAttrKey(name: string): [string, boolean] {
    return [(this.builderOptions.convertAttKey || '@') + name, false]
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
        return [this.builderOptions.convertCommentKey || '#comment', true]
      case NodeType.Text:
        return [this.builderOptions.convertTextKey || '#text', true]
      case NodeType.ProcessingInstruction:
        return [(this.builderOptions.convertPIKey || '?') + (<ProcessingInstruction>preNode.node).target, false]
      case NodeType.CData:
        return [this.builderOptions.convertCDataKey || '#cdata', true]
      default:
        throw new Error("Invalid node type.")
    }
  }

}