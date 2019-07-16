import { 
  XMLSerializer, PreSerializedNode, PreSerializedAttr 
} from "./interfaces"
import {
  Node, NodeType, Document, DocumentType, Comment, ProcessingInstruction,
  DocumentFragment, Text, Element, CDATASection
} from "../interfaces"
import { PreSerializer } from "./PreSerializer"

/**
 * Represents an XML serializer.
 * 
 * Implements: https://www.w3.org/TR/DOM-Parsing/#serializing
 */
export class XMLSerializerImpl implements XMLSerializer {

  private _xmlVersion: "1.0" | "1.1"

  /**
   * Initializes a new instance of `XMLSerializer`.
   * 
   * @param xmlVersion - XML specification version
   */
  constructor(xmlVersion: "1.0" | "1.1" = "1.0") {
    this._xmlVersion = xmlVersion
  }

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - node to serialize
   */
  serializeToString(node: Node): string {
    const pre = new PreSerializer(this._xmlVersion)
    return this._serializeNode(pre.serialize(node, false))
  }

  /**
   * Produces an XML serialization of `node`.
   * 
   * @param preNode - node to serialize
   */
  private _serializeNode(preNode: PreSerializedNode<Node>): string {

      switch (preNode.node.nodeType) {
        case NodeType.Element:
          return this._serializeElement(<PreSerializedNode<Element>>preNode)
        case NodeType.Document:
          return this._serializeDocument(<PreSerializedNode<Document>>preNode)
        case NodeType.Comment:
          return this._serializeComment(<PreSerializedNode<Comment>>preNode)
        case NodeType.Text:
          return this._serializeText(<PreSerializedNode<Text>>preNode)
        case NodeType.DocumentFragment:
          return this._serializeDocumentFragment(<PreSerializedNode<DocumentFragment>>preNode)
        case NodeType.DocumentType:
          return this._serializeDocumentType(<PreSerializedNode<DocumentType>>preNode)
        case NodeType.ProcessingInstruction:
          return this._serializeProcessingInstruction(<PreSerializedNode<ProcessingInstruction>>preNode)
        case NodeType.CData:
          return this._serializeCData(<PreSerializedNode<CDATASection>>preNode)
        default:
          throw new Error("Invalid node type.")
      }
  }

  /**
   * Produces an XML serialization of the given node's children.
   * 
   * @param preNode - node to serialize
   */
  private _serializeChildNodes(preNode: PreSerializedNode<Node>): string {
    let markup = ''
    for (const child of preNode.children) {
      markup += this._serializeNode(child)
    }
    return markup
  }

  /**
   * Produces an XML serialization of the given node's attributes.
   * 
   * @param preNode - the node whose attributes to serialize
   */
  private _serializeAttributes(preNode: PreSerializedNode<Node>): string {
    let markup = ''
    for (const preAttr of preNode.attributes) {
      markup += ` ${this._serializeAttribute(preAttr)}`
    }
    return markup
  }

  /**
   * Produces an XML serialization of an attribute.
   * 
   * @param preAttr - attribute node to serialize
   */
  private _serializeAttribute(preAttr: PreSerializedAttr): string {
    return `${preAttr.name}="${this._serializeAttributeValue(preAttr.value)}"`
  }

  /**
   * Produces an XML serialization of an attribute value.
   * 
   * @param value - attribute value
   */
  private _serializeAttributeValue(value: string): string {
    // Although XML spec allows ">" in attribute values, we replace ">" 
    // to match the behavior present in browsers    
    return value.replace('"', "&quot;")
      .replace("&", "&amp;")
      .replace("<", "&lt;")
      .replace(">", "&gt;")
  }

  /**
   * Produces an XML serialization of an element node.
   * 
   * @param preNode - element node to serialize
   */
  private _serializeElement(preNode: PreSerializedNode<Element>): string {

    let markup = `<${preNode.name}`
    markup += this._serializeAttributes(preNode)

    if (preNode.children.length === 0) {
      markup += "/>"
      return markup
    } else {
      markup += ">"
      markup += this._serializeChildNodes(preNode)
      markup += `</${preNode.name}>`
      return markup
    }
  }

  /**
   * Produces an XML serialization of a document node.
   * 
   * @param preNode - document node to serialize
   */
  private _serializeDocument(preNode: PreSerializedNode<Document>): string {
    return this._serializeChildNodes(preNode)
  }

  /**
   * Produces an XML serialization of a comment node.
   * 
   * @param preNode - comment node to serialize
   */
  private _serializeComment(preNode: PreSerializedNode<Comment>): string {
    return `<!--${preNode.node.data}-->`
  }

  /**
   * Produces an XML serialization of a text node.
   * 
   * @param preNode - text node to serialize
   */
  private _serializeText(preNode: PreSerializedNode<Text>): string {
    return preNode.node.data.replace("&", "&amp;")
      .replace("<", "&lt;")
      .replace(">", "&gt;")
  }

  /**
   * Produces an XML serialization of a document fragment node.
   * 
   * @param preNode - document fragment node to serialize
   */
  private _serializeDocumentFragment(preNode: PreSerializedNode<DocumentFragment>): string {
    return this._serializeChildNodes(preNode)
  }

  /**
   * Produces an XML serialization of a document type node.
   * 
   * @param preNode - document type node to serialize
   */
  private _serializeDocumentType(preNode: PreSerializedNode<DocumentType>): string {
    if (preNode.node.publicId && preNode.node.systemId) {
      return `<!DOCTYPE ${preNode.node.name} PUBLIC "${preNode.node.publicId}" "${preNode.node.systemId}">`
    } else if (preNode.node.publicId) {
      return `<!DOCTYPE ${preNode.node.name} PUBLIC "${preNode.node.publicId}">`
    } else if (preNode.node.systemId) {
      return `<!DOCTYPE ${preNode.node.name} SYSTEM "${preNode.node.systemId}">`
    } else {
      return `<!DOCTYPE ${preNode.node.name}>`
    }
  }

  /**
   * Produces an XML serialization of a processing instruction node.
   * 
   * @param preNode - processing instruction node to serialize
   */
  private _serializeProcessingInstruction(
    preNode: PreSerializedNode<ProcessingInstruction>): string {

    return `<?${preNode.node.target} ${preNode.node.data}?>`
  }

  /**
   * Produces an XML serialization of a CDATA node.
   * 
   * @param preNode - CDATA node to serialize
   */
  private _serializeCData(preNode: PreSerializedNode<CDATASection>): string {
    return `<![CDATA[${preNode.node.data}]]>`
  }

}