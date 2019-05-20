import { Node, Document, Element, NodeType } from "../dom/interfaces"
import { XMLBuilderOptions, XMLBuilder, AttributesOrText, XMLStringifier, ExpandObject } from "./interfaces"
import { isString, isArray, isFunction, isObject, isEmpty, getValue } from "../util"

/**
 * Represents a mixin that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export class XMLBuilderImpl implements XMLBuilder {

  private _options: XMLBuilderOptions = { version: "1.0" }
  private _namespace?: string

  /** @inheritdoc */
  namespace(namespace: string): XMLBuilder {
    this._namespace = namespace
    return this
  }

  /** @inheritdoc */
  element(name: string | ExpandObject, attributes?: AttributesOrText,
    text?: AttributesOrText): XMLBuilder {

    name = getValue(name)
    // swap argument order: text <-> attributes
    if (!isObject(attributes)) {
      [text, attributes] = [attributes, text]
    }

    if (attributes) {
      attributes = <{ [key: string]: any }>getValue(attributes)
    }
    if (text) {
      text = <string>text
    }

    let lastChild: XMLBuilder | null = null
                
    if (isArray(name)) {
      // expand if array
      for (let i = 0, len = name.length; i < len; i++) {
        const item = name[i]
        lastChild = this.element(item)
      }
    } else if (isFunction(name)) {
      // evaluate if function
      lastChild = this.element(name.apply(this))
    } else if (isObject(name)) {
      // expand if object
      for (const key in name) {
        if (!name.hasOwnProperty(key)) continue
        let val = name[key]
        if (isFunction(val)) {
          // evaluate if function
          val = val.apply()
        }
        if (!this.options.ignoreDecorators && this.stringify.convertAttKey && key.indexOf(this.stringify.convertAttKey) === 0) {
          // assign attributes
          lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val)
        } else if (!this.options.separateArrayItems && Array.isArray(val) && isEmpty(val)) {
          // skip empty arrays
          lastChild = this._dummy()
        } else if (isObject(val) && isEmpty(val)) {
          // empty objects produce one node
          lastChild = this.element(key)
        } else if (!this.options.keepNullNodes && (val == null)) {
          // skip null and undefined nodes
          lastChild = this._dummy()
        
        } else if (!this.options.separateArrayItems && Array.isArray(val)) {
          // expand list by creating child nodes
          for (let j = 0, len = val.length; j < len; j++) {
            const item = val[j]
            let childNode: { [key: string]: any } = { }
            childNode[key] = item
            lastChild = this.element(childNode)
          }
        
        // expand child nodes under parent
        } else if (isObject(val)) {
          // if the key is #text expand child nodes under this node to support mixed content
          if (!this.options.ignoreDecorators && this.stringify.convertTextKey && key.indexOf(this.stringify.convertTextKey) === 0) {
            lastChild = this.element(val)
          } else {
            lastChild = this.element(key)
            lastChild.element(val)
          }
        } else {
          // text node
          lastChild = this.element(key, val)
        }
      }
    } else if (!this.options.keepNullNodes && text === null) {
      // skip null nodes
      lastChild = this._dummy()
    } else if (text !== undefined) {
      if (!this.options.ignoreDecorators && this.stringify.convertTextKey && name.indexOf(this.stringify.convertTextKey) === 0) {
        // text node
        lastChild = this.text(text);
      } else if (!this.options.ignoreDecorators && this.stringify.convertCDataKey && name.indexOf(this.stringify.convertCDataKey) === 0) {
        // cdata node
        lastChild = this.cdata(text);
      } else if (!this.options.ignoreDecorators && this.stringify.convertCommentKey && name.indexOf(this.stringify.convertCommentKey) === 0) {
        // comment node
        lastChild = this.comment(text);
      } else if (!this.options.ignoreDecorators && this.stringify.convertRawKey && name.indexOf(this.stringify.convertRawKey) === 0) {
        // raw text node
        lastChild = this.raw(text);
      } else if (!this.options.ignoreDecorators && this.stringify.convertPIKey && name.indexOf(this.stringify.convertPIKey) === 0) {
        // processing instruction
        lastChild = this.instruction(name.substr(this.stringify.convertPIKey.length), text);
      } else {
        // element node with text
        lastChild = this._node(name, attributes, text);
      }
    } else {
      // element node without text
      lastChild = this._node(name, attributes, text);
    }
    
    if (lastChild == null) {
      throw new Error("Could not create any elements with: " + name.toString() + ". " + this._debugInfo)
    }
    
    return lastChild
    
  }

  /** @inheritdoc */
  attribute(name: AttributesOrText, value?: string): XMLBuilder {

    name = getValue(name)
    
    if (isObject(name)) {
      // expand if object
      for (const attName in name) {
        if (name.hasOwnProperty(attName)) {
          const attValue = name[attName]
          this.attribute(attName, attValue)
        }
      }
    } else {
      if (isFunction(value)) {
        value = value.apply(this)
      }
      if (this.options.keepNullAttributes && (value == null)) {
        this.attribute(name, "")
      } else if (value != null) {
        const ele = this._asElement
        if (this._namespace !== undefined) {
          ele.setAttributeNS(this._namespace, name, value)
          this._resetNamespace()
        } else {
          ele.setAttribute(name, value)
        }        
      }
    }

    return this
  }

  /** @inheritdoc */
  text(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createTextNode(content)
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  comment(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createComment(content)
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  cdata(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createCDATASection(content)
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  instruction(target: string, content?: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createProcessingInstruction(target, content || '')
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  raw(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createTextNode(content)
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  document(): XMLBuilder {
    return XMLBuilderImpl.FromNode(this._doc)
  }

  /** @inheritdoc */
  root(): XMLBuilder {
    const ele = this._doc.documentElement
    if (!ele) {
      throw new Error("Document root element is null. " + this._debugInfo)
    }
    return XMLBuilderImpl.FromNode(ele)
  }

  /** @inheritdoc */
  up(): XMLBuilder {
    const parent = this._asNode.parentNode
    if (!parent) {
      throw new Error("Parent node is null. " + this._debugInfo)
    }
    return XMLBuilderImpl.FromNode(parent)
  }

  /** @inheritdoc */
  prev(): XMLBuilder {
    const node = this._asNode.previousSibling
    if (!node) {
      throw new Error("Previous sibling node is null. " + this._debugInfo)
    }
    return XMLBuilderImpl.FromNode(node)
  }

  /** @inheritdoc */
  next(): XMLBuilder {
    const node = this._asNode.nextSibling
    if (!node) {
      throw new Error("Next sibling node is null. " + this._debugInfo)
    }
    return XMLBuilderImpl.FromNode(node)
  }

  /**
   * Resets the namespace to `undefined`.
   */
  private _resetNamespace(): void {
    this._namespace = undefined
  }

  /**
   * Creates a new element node and appends it to the list of child nodes.
   * 
   * @param name - element name
   * @param attributes - a JS object with element attributes
   * @param text - contents of a text child node
   *  
   * @returns the new element node
   */
  private _node(name: string, attributes?: AttributesOrText,
    text?: AttributesOrText): XMLBuilder {

    name = getValue(name)

    // swap argument order: text <-> attributes
    if (!isObject(attributes)) {
      [text, attributes] = [attributes, text]
    }

    if (attributes) {
      attributes = <{ [key: string]: any }>getValue(attributes)
    }
    if (text) {
      text = <string>text
    }

    const node = this._asNode
    let child: Element
    if (this._namespace !== undefined) {
      child = this._doc.createElementNS(this._namespace, name)
      this._resetNamespace()
    } else {
      child = this._doc.createElement(name)
    }

    node.appendChild(child)
    const builder = XMLBuilderImpl.FromNode(child)
    
    if (attributes) builder.attribute(attributes)
    if (text) builder.text(text)

    return builder
  }

  /**
   * Creates a dummy element node without adding it to the list of child nodes.
   * 
   * Dummy nodes are special nodes representing a node with a `null` value. 
   * Dummy nodes are created while recursively building the XML tree. Simply
   * skipping `null` values doesn't work because that would break the recursive
   * chain.
   * 
   * @returns the new dummy element node
   */
  private _dummy(): XMLBuilder {
    const child = this._doc.createElement('## DUMMY ##')
    return XMLBuilderImpl.FromNode(child)
  }

  /**
   * Returns the document owning this node.
   */
  private get _doc(): Document {
    const node = this._asNode
    const doc = node.ownerDocument
    if (!doc) {
      throw new Error("Document is null. " + this._debugInfo)
    }
    return doc
  }

  /**
   * Gets builder options.
   */
  private get options(): XMLBuilderOptions {
    return this._options
  }

  /**
   * Gets the stringifier.
   */
  private get stringify(): XMLStringifier {
    if (!this.options.stringify) {
      throw new Error("Stringifier functions not found.")
    }

    return this.options.stringify
  }

  /**
   * Returns the underlying node.
   */
  private get _asNode(): Node {
    const node = <Node><unknown>this

    if (!node.nodeType) {
      throw new Error("This function can only be applied to a node.")
    }

    return node
  }

  /**
   * Returns the underlying element node.
   */
  private get _asElement(): Element {
    const ele = <Element><unknown>this

    if (!ele.nodeType || ele.nodeType != NodeType.Element) {
      throw new Error("This function can only be applied to an element node.")
    }

    return ele
  }

  /**
   * Returns the underlying document node.
   */
  private get _asDocument(): Document {
    const doc = <Document><unknown>this

    if (!doc.nodeType || doc.nodeType != NodeType.Document) {
      throw new Error("This function can only be applied to a document node.")
    }

    return doc
  }

  /**
   * Converts a node to an xml builder.
   */
  private static FromNode(node: Node): XMLBuilder {
    return <XMLBuilder><unknown>node
  }

  /**
   * Returns debug information for this node.
   */
  private get _debugInfo(): string {
    return ''
  }

  // Function aliases
  /** @inheritdoc */
  ns(namespace: string): XMLBuilder { return this.namespace(namespace) }
  /** @inheritdoc */
  ele(name: string | ExpandObject, attributes?: AttributesOrText, 
    text?: AttributesOrText): XMLBuilder{
    return this.element(name, attributes, text) 
  }
  /** @inheritdoc */
  att(name: AttributesOrText, value?: string): XMLBuilder {
    return this.attribute(name, value)
  }
  /** @inheritdoc */
  txt(content: string): XMLBuilder { return this.text(content) }
  /** @inheritdoc */
  com(content: string): XMLBuilder { return this.comment(content) }
  /** @inheritdoc */
  dat(content: string): XMLBuilder { return this.cdata(content) }
  /** @inheritdoc */
  ins(target: string, content?: string): XMLBuilder { 
    return this.instruction(target, content) 
  }
  /** @inheritdoc */
  doc(): XMLBuilder { return this.document() }

}
