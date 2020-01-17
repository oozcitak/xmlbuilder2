import {
  Node, Document, DocumentType, DocumentFragment, Attr, Text, CDATASection,
  Comment, ProcessingInstruction, Element
} from "@oozcitak/dom/lib/dom/interfaces"
import { CastAsNode } from "./interfaces"
import {
  isDocumentNode, isDocumentFragmentNode, isDocumentTypeNode, isElementNode,
  isAttrNode, isTextNode, isCDATASectionNode, isCommentNode,
  isProcessingInstructionNode
} from "./dom"

/**
 * Returns underlying DOM nodes.
 */
export class CastAsNodeImpl implements CastAsNode {
  private _node: Node

  /**
   * Initializes a new `CastAsNode`.
   * 
   * @param node - a DOM node
   */
  constructor(node: Node) {
    this._node = node
  }

  /** @inheritdoc */
  get any(): any {
    return this._node
  }

  /** @inheritdoc */
  get node(): Node {
    return this._node
  }

  /** @inheritdoc */
  get document(): Document {
    if (isDocumentNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM document node.")
    }
  }

  /** @inheritdoc */
  get documentType(): DocumentType {
    if (isDocumentTypeNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM document type node.")
    }
  }

  /** @inheritdoc */
  get documentFragment(): DocumentFragment {
    if (isDocumentFragmentNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM document fragment node.")
    }
  }

  /** @inheritdoc */
  get attr(): Attr {
    if (isAttrNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM attr node.")
    }
  }

  /** @inheritdoc */
  get text(): Text {
    if (isTextNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM text node.")
    }
  }

  /** @inheritdoc */
  get cdataSection(): CDATASection {
    if (isCDATASectionNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM cdata section node.")
    }
  }

  /** @inheritdoc */
  get comment(): Comment {
    if (isCommentNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM comment node.")
    }
  }

  /** @inheritdoc */
  get processingInstruction(): ProcessingInstruction {
    if (isProcessingInstructionNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM processing instruction node.")
    }
  }

  /** @inheritdoc */
  get element(): Element {
    if (isElementNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM element node.")
    }
  }

}