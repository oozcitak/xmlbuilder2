import { dom, util } from "@oozcitak/dom"
import { XMLBuilderNode, CastAsNode } from "./interfaces"

/**
 * Returns underlying DOM nodes.
 */
export class CastAsNodeImpl implements CastAsNode {
  private _node: dom.Interfaces.Node

  /**
   * Initializes a new `CastAsNode`.
   * 
   * @param builder - an XML builder node
   */
  constructor (builder: XMLBuilderNode) {
    if (util.Guard.isNode(builder)) {
      this._node = builder
    } else {
      throw new Error("This function can only be applied to a DOM node.")
    }
  }

  /** @inheritdoc */
  get any(): any {
    return this._node as any
  }

  /** @inheritdoc */
  get node(): dom.Interfaces.Node {
    return this._node
  }

  /** @inheritdoc */
  get document(): dom.Interfaces.Document {
    if (util.Guard.isDocumentNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM document node.")
    }
  }

  /** @inheritdoc */
  get documentType(): dom.Interfaces.DocumentType {
    if (util.Guard.isDocumentTypeNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM document type node.")
    }
  }

  /** @inheritdoc */
  get documentFragment(): dom.Interfaces.DocumentFragment {
    if (util.Guard.isDocumentFragmentNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM document fragment node.")
    }
  }

  /** @inheritdoc */
  get attr(): dom.Interfaces.Attr {
    if (util.Guard.isAttrNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM attr node.")
    }
  }

  /** @inheritdoc */
  get text(): dom.Interfaces.Text {
    if (util.Guard.isTextNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM text node.")
    }
  }

  /** @inheritdoc */
  get cdataSection(): dom.Interfaces.CDATASection {
    if (util.Guard.isCDATASectionNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM cdata section node.")
    }
  }

  /** @inheritdoc */
  get comment(): dom.Interfaces.Comment {
    if (util.Guard.isCommentNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM comment node.")
    }
  }

  /** @inheritdoc */
  get processingInstruction(): dom.Interfaces.ProcessingInstruction {
    if (util.Guard.isProcessingInstructionNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM processing instruction node.")
    }
  }

  /** @inheritdoc */
  get element(): dom.Interfaces.Element {
    if (util.Guard.isElementNode(this._node)) {
      return this._node
    } else {
      throw new Error("This function can only be applied to a DOM element node.")
    }
  }

}