import { 
  Node, Document, DocumentType, DocumentFragment, Attr, Text, CDATASection, 
  Comment, ProcessingInstruction, Element 
} from "@oozcitak/dom/lib/dom/interfaces"
import { Cast, Guard } from "@oozcitak/dom/lib/util"
import { XMLBuilderNode, CastAsNode } from "./interfaces"

/**
 * Returns underlying DOM nodes.
 */
export class CastAsNodeImpl implements CastAsNode {
  private _node: Node

  /**
   * Initializes a new `CastAsNode`.
   * 
   * @param builder - an XML builder node
   */
  constructor (builder: XMLBuilderNode) {
    this._node = Cast.asNode(builder)
  }

  /** @inheritdoc */
  get any(): any {
    return this._node as any
  }

  /** @inheritdoc */
  get node(): Node {
    return this._node
  }

  /** @inheritdoc */
  get document(): Document {
    if (Guard.isDocumentNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM document node.")
    }
  }

  /** @inheritdoc */
  get documentType(): DocumentType {
    if (Guard.isDocumentTypeNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM document type node.")
    }
  }

  /** @inheritdoc */
  get documentFragment(): DocumentFragment {
    if (Guard.isDocumentFragmentNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM document fragment node.")
    }
  }

  /** @inheritdoc */
  get attr(): Attr {
    if (Guard.isAttrNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM attr node.")
    }
  }

  /** @inheritdoc */
  get text(): Text {
    if (Guard.isTextNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM text node.")
    }
  }

  /** @inheritdoc */
  get cdataSection(): CDATASection {
    if (Guard.isCDATASectionNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM cdata section node.")
    }
  }

  /** @inheritdoc */
  get comment(): Comment {
    if (Guard.isCommentNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM comment node.")
    }
  }

  /** @inheritdoc */
  get processingInstruction(): ProcessingInstruction {
    if (Guard.isProcessingInstructionNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM processing instruction node.")
    }
  }

  /** @inheritdoc */
  get element(): Element {
    if (Guard.isElementNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM element node.")
    }
  }

}