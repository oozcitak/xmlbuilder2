import { 
  XMLWriter, WriterOptions, XMLBuilderOptions, WriterState, 
  PreSerializedNode, PreSerializedAttr 
} from "./interfaces"
import { 
  Node, XMLDocument, Element, DocumentType, Text, CDATASection,
  Comment, ProcessingInstruction, NodeType, DocumentFragment
} from "../dom/interfaces"
import { PreSerializer } from "./util/PreSerializer"

/**
 * Base class for serializers.
 */
export abstract class XMLWriterImpl<T> implements XMLWriter<T> {

  private _builderOptions: XMLBuilderOptions

  /**
   * Initializes a new instance of `XMLWriterImpl`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderOptions) {
    this._builderOptions = builderOptions
  }

  /**
   * Gets XML builder options.
   */
  get builderOptions(): XMLBuilderOptions {
    return this._builderOptions
  }
  
  /** @inheritdoc */
  serialize(node: Node, options?: WriterOptions): T {
    return this._serializeNode(PreSerializer.Serialize(node), options || {})
  }

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param preNode - current node
   * @param options - serialization options
   */
  protected _serializeNode(preNode: PreSerializedNode<Node>, options: WriterOptions): T {
    options.state = WriterState.None
    this.openNode(preNode, options)

    let markup:T
    switch (preNode.node.nodeType) {
      case NodeType.Element:
        markup = this.element(<PreSerializedNode<Element>>preNode, options)
        break
      case NodeType.Document:
        markup = this.document(<PreSerializedNode<XMLDocument>>preNode, options)
        break
      case NodeType.Comment:
        markup = this.comment(<PreSerializedNode<Comment>>preNode, options)
        break
      case NodeType.Text:
        markup = this.text(<PreSerializedNode<Text>>preNode, options)
        break
      case NodeType.DocumentFragment:
        markup = this.documentFragment(<PreSerializedNode<DocumentFragment>>preNode, options)
        break
      case NodeType.DocumentType:
        markup = this.documentType(<PreSerializedNode<DocumentType>>preNode, options)
        break
      case NodeType.ProcessingInstruction:
        markup = this.processingInstruction(<PreSerializedNode<ProcessingInstruction>>preNode, options)
        break
      case NodeType.CData:
        markup = this.cdata(<PreSerializedNode<CDATASection>>preNode, options)
        break
      default:
        throw new Error("Invalid node type.")
    }

    this.closeNode(preNode, options)
    options.state = WriterState.None

    return markup
  }

  /** @inheritdoc */
  abstract document(node: PreSerializedNode<XMLDocument>, options: WriterOptions): T

  /** @inheritdoc */
  abstract documentType(node: PreSerializedNode<DocumentType>, options: WriterOptions): T

  /** @inheritdoc */
  abstract documentFragment(node: PreSerializedNode<DocumentFragment>, options: WriterOptions): T

  /** @inheritdoc */
  abstract element(node: PreSerializedNode<Element>, options: WriterOptions): T

  /** @inheritdoc */
  abstract text(node: PreSerializedNode<Text>, options: WriterOptions): T

  /** @inheritdoc */
  abstract cdata(node: PreSerializedNode<CDATASection>, options: WriterOptions): T

  /** @inheritdoc */
  abstract comment(node: PreSerializedNode<Comment>, options: WriterOptions): T

  abstract processingInstruction(node: PreSerializedNode<ProcessingInstruction>, options: WriterOptions): T

  /** @inheritdoc */
  abstract attribute(node: PreSerializedAttr, options: WriterOptions): T

  /** @inheritdoc */
  abstract beginLine(node: PreSerializedNode<Node>, options: WriterOptions): T

  /** @inheritdoc */
  abstract endLine(node: PreSerializedNode<Node>, options: WriterOptions): T

  /** @inheritdoc */
  openNode(node: PreSerializedNode<Node>, options: WriterOptions): void { }

  /** @inheritdoc */
  closeNode(node: PreSerializedNode<Node>, options: WriterOptions): void { }

  /** @inheritdoc */
  openAttribute(node: PreSerializedAttr, options: WriterOptions): void { }

  /** @inheritdoc */
  closeAttribute(node: PreSerializedAttr, options: WriterOptions): void { }

}