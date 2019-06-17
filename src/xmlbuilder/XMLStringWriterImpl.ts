import { 
  XMLWriter, WriterOptions, XMLBuilderOptions, WriterState, 
  PreSerializedNode, PreSerializedAttr, PreSerializedNS 
} from "./interfaces"
import { 
  Node, XMLDocument, Element, DocumentType, Text, CDATASection,
  Comment, ProcessingInstruction, DocumentFragment
} from "../dom/interfaces"
import { Char } from "./util/Char"
import { XMLWriterImpl } from "./XMLWriterImpl"

/**
 * Serializes XML nodes into strings.
 */
export class XMLStringWriterImpl extends XMLWriterImpl<string> {

  /**
   * Initializes a new instance of `XMLStringWriterImpl`.
   * 
   * @param builderOptions - XML builder options
   */
  constructor(builderOptions: XMLBuilderOptions) {
    super(builderOptions)
  }

  /**
   * Produces an XML serialization of the given node's children.
   * 
   * @param preNode - current node
   * @param options - serialization options
   */
  private _serializeChildNodes(preNode: PreSerializedNode<Node>, options: WriterOptions): string {
    let markup = ''
    for (const child of preNode.children) {
      markup += this._serializeNode(child, options)
    }
    return markup
  }

  /**
   * Produces an XML serialization of the given node's attributes.
   * 
   * @param preNode - current node
   * @param options - serialization options
   */
  private _serializeAttributes(preNode: PreSerializedNode<Node>, options: WriterOptions): string {
    let markup = ''
    for (const preAttr of preNode.attributes) {
      markup += ` ${this.attribute(preAttr, options)}`
    }
    return markup
  }

  /**
   * Produces an XML serialization of the given node's namespace declarations.
   * 
   * @param preNode - current node
   * @param options - serialization options
   */
  private _serializeNamespaces(preNode: PreSerializedNode<Node>, options: WriterOptions): string {
    let markup = ''
    for (const preNS of preNode.namespaces) {
      markup += ` ${this.namespace(preNS, options)}`
    }
    return markup
  }

  /** @inheritdoc */
  document(preNode: PreSerializedNode<XMLDocument>, options: WriterOptions): string {
    let markup = ''

    if(!options.headless) {
      markup = this.beginLine(preNode, options) + '<?xml'
      markup += ' version="' + (this.builderOptions.version || "1.0") + '"'
      if (this.builderOptions.encoding !== undefined) {
        markup += ' encoding="' + this.builderOptions.encoding + '"'
      }
      if (this.builderOptions.standalone !== undefined) {
        markup += ' standalone="' + (this.builderOptions.standalone ? "yes" : "no") + '"'
      }
      markup += '?>' + this.endLine(preNode, options)
    }

    markup += this._serializeChildNodes(preNode, options)

    return markup
  }

  /** @inheritdoc */
  documentType(preNode: PreSerializedNode<DocumentType>, options: WriterOptions): string {
    let markup = this.beginLine(preNode, options)

    if (preNode.node.publicId && preNode.node.systemId) {
      markup += `<!DOCTYPE ${preNode.node.name} PUBLIC "${preNode.node.publicId}" "${preNode.node.systemId}">`
    } else if (preNode.node.publicId) {
      markup += `<!DOCTYPE ${preNode.node.name} PUBLIC "${preNode.node.publicId}">`
    } else if (preNode.node.systemId) {
      markup += `<!DOCTYPE ${preNode.node.name} SYSTEM "${preNode.node.systemId}">`
    } else {
      markup += `<!DOCTYPE ${preNode.node.name}>`
    }

    markup += this.endLine(preNode, options)
    return markup
  }

  /** @inheritdoc */
  documentFragment(preNode: PreSerializedNode<DocumentFragment>, options: WriterOptions): string {
    return this._serializeChildNodes(preNode, options)
  }

  /** @inheritdoc */
  element(preNode: PreSerializedNode<Element>, options: WriterOptions): string {
    options.state = WriterState.OpenTag
    let markup = this.beginLine(preNode, options) + '<' + preNode.name
    markup += this._serializeNamespaces(preNode, options)
    markup += this._serializeAttributes(preNode, options)

    if (preNode.children.length === 0) {
      // self closing tag
      if (options.spaceBeforeSlash) {
        markup += ' '
      }
      markup += "/>"
    } else {
      markup += ">"

      // serialize child-nodes
      options.state = WriterState.InsideTag
      markup += this._serializeChildNodes(preNode, options)
  
      options.state = WriterState.CloseTag
      markup += `</${options.spaceBeforeSlash ? ' ' : ''}${preNode.name}>`
    }

    markup += this.endLine(preNode, options)
    options.state = WriterState.None
    return markup
  }

  /** @inheritdoc */
  text(preNode: PreSerializedNode<Text>, options: WriterOptions): string {
    return this.beginLine(preNode, options) + 
      Char.escapeText(preNode.node.data) + 
      this.endLine(preNode, options)
  }

  /** @inheritdoc */
  cdata(preNode: PreSerializedNode<CDATASection>, options: WriterOptions): string {
    return this.beginLine(preNode, options) + 
      `<![CDATA[${preNode.node.data}]]>` + 
      this.endLine(preNode, options)    
  }

  /** @inheritdoc */
  comment(preNode: PreSerializedNode<Comment>, options: WriterOptions): string {
    return this.beginLine(preNode, options) + 
      `<!--${preNode.node.data}-->` + 
      this.endLine(preNode, options)  
  }

  /** @inheritdoc */
  processingInstruction(preNode: PreSerializedNode<ProcessingInstruction>, options: WriterOptions): string {
    return this.beginLine(preNode, options) + 
      `<?${preNode.node.target} ${preNode.node.data}?>` + 
      this.endLine(preNode, options)  
  }

  /** @inheritdoc */
  attribute(preAttr: PreSerializedAttr, options: WriterOptions): string {
    return `${preAttr.name}="${Char.escapeAttrValue(preAttr.value)}"`
  }

  /** @inheritdoc */
  namespace(preNS: PreSerializedNS, options: WriterOptions): string {
    return `${preNS.name}="${Char.escapeAttrValue(preNS.value)}"`
  }

  /** @inheritdoc */
  beginLine(preNode: PreSerializedNode<Node>, options: WriterOptions): string {
    const suppressPrettyCount = options.user ? options.user.suppressPrettyCount : false
    if (options.prettyPrint && suppressPrettyCount) {
      const indentLevel = (options.offset || 0) + preNode.level + 1
      if (indentLevel > 0) {
        return new Array(indentLevel).join(options.indent || '  ')
      }
    }

    return ''
  }

  /** @inheritdoc */
  endLine(preNode: PreSerializedNode<Node>, options: WriterOptions): string {
    const suppressPrettyCount = options.user ? options.user.suppressPrettyCount : false
    if (options.prettyPrint && suppressPrettyCount) {
      return options.newline || '\n'
    } else {
      return ''
    }
  }

  /** @inheritdoc */
  openNode(preNode: PreSerializedNode<Node>, options: WriterOptions): void { }

  /** @inheritdoc */
  closeNode(preNode: PreSerializedNode<Node>, options: WriterOptions): void { }

  /** @inheritdoc */
  openAttribute(preAttr: PreSerializedAttr, options: WriterOptions): void { }

  /** @inheritdoc */
  closeAttribute(preAttr: PreSerializedAttr, options: WriterOptions): void { }

}