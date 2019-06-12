import { Node, Document, Element, NodeType } from "../dom/interfaces"
import {
  XMLBuilderOptions, XMLBuilder, AttributesObject, XMLStringifier, ExpandObject
} from "./interfaces"
import { isArray, isFunction, isObject, isEmpty, getValue, isString } from "../util"
import { Namespace } from "../dom/spec"

/**
 * Represents a mixin that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export class XMLBuilderImpl implements XMLBuilder {

  private _builderOptions: XMLBuilderOptions | null = null

  /** @inheritdoc */
  ele(name: string | ExpandObject, attributes?: AttributesObject | string,
    text?: AttributesObject | string): XMLBuilder {

    name = getValue(name)
    // swap argument order: text <-> attributes
    if (attributes && !isObject(attributes)) {
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
        lastChild = this.ele(item)
      }
    } else if (isFunction(name)) {
      // evaluate if function
      lastChild = this.ele(name.apply(this))
    } else if (isObject(name)) {
      // expand if object
      for (const key in name) {
        if (!name.hasOwnProperty(key)) continue
        let val = name[key]
        if (isFunction(val)) {
          // evaluate if function
          val = val.apply()
        }
        if (!this._stringify.ignoreDecorators && this._stringify.convertAttKey && key.indexOf(this._stringify.convertAttKey) === 0) {
          // assign attributes
          lastChild = this.att(key.substr(this._stringify.convertAttKey.length), val)
        } else if (!this._stringify.separateArrayItems && Array.isArray(val) && isEmpty(val)) {
          // skip empty arrays
          lastChild = this._dummy()
        } else if (isObject(val) && isEmpty(val)) {
          // empty objects produce one node
          lastChild = this.ele(key)
        } else if (!this._options.keepNullNodes && (val == null)) {
          // skip null and undefined nodes
          lastChild = this._dummy()
        } else if (Array.isArray(val)) {
          // expand list by creating child nodes
          for (let j = 0, len = val.length; j < len; j++) {
            const item = val[j]
            let childNode: { [key: string]: any } = {}
            childNode[key] = item
            lastChild = this.ele(childNode)
          }

          // expand child nodes under parent
        } else if (isObject(val)) {
          // if the key is #text expand child nodes under this node to support mixed content
          if (!this._stringify.ignoreDecorators && this._stringify.convertTextKey && key.indexOf(this._stringify.convertTextKey) === 0) {
            lastChild = this.ele(val)
          } else {
            // check for a default namespace declaration attribute
            let namespace: string | null = null
            if (!this._stringify.ignoreDecorators && this._stringify.convertAttKey && isObject(val)) {
              const nsKey = this._stringify.convertAttKey + "xmlns"
              const attValue = val[nsKey]
              if (attValue === null || isString(attValue)) {
                namespace = attValue
                delete val[nsKey]
              }
            }

            // create a parent node
            lastChild = (namespace !== null ?
              this._node(key) :
              this._node(key, { xmlns: namespace })
            )

            // expand child nodes under parent
            lastChild.ele(val)
          }
        } else {
          // text node
          lastChild = this.ele(key, val)
        }
      }
    } else if (!this._options.keepNullNodes && text === null) {
      // skip null nodes
      lastChild = this._dummy()
    } else if (text !== undefined) {
      if (!this._stringify.ignoreDecorators && this._stringify.convertTextKey && name.indexOf(this._stringify.convertTextKey) === 0) {
        // text node
        lastChild = this.txt(text)
      } else if (!this._stringify.ignoreDecorators && this._stringify.convertCDataKey && name.indexOf(this._stringify.convertCDataKey) === 0) {
        // cdata node
        lastChild = this.dat(text)
      } else if (!this._stringify.ignoreDecorators && this._stringify.convertCommentKey && name.indexOf(this._stringify.convertCommentKey) === 0) {
        // comment node
        lastChild = this.com(text)
      } else if (!this._stringify.ignoreDecorators && this._stringify.convertPIKey && name.indexOf(this._stringify.convertPIKey) === 0) {
        // processing instruction
        lastChild = this.ins(name.substr(this._stringify.convertPIKey.length), text)
      } else {
        // element node with text
        lastChild = this._node(name, attributes, text)
      }
    } else {
      // element node without text
      lastChild = this._node(name, attributes, text)
    }

    if (lastChild == null) {
      throw new Error("Could not create any elements with: " + name.toString() + ". " + this._debugInfo())
    }

    return lastChild

  }

  /** @inheritdoc */
  remove(): XMLBuilder {
    const parent = this.up()
    this._asAny._remove()
    return parent
  }

  /** @inheritdoc */
  att(name: AttributesObject | string, value?: string): XMLBuilder {

    name = getValue(name)

    if (isObject(name)) {
      // expand if object
      for (const attName in name) {
        if (name.hasOwnProperty(attName)) {
          const attValue = name[attName]
          this.att(attName, attValue)
        }
      }
    } else {
      if (isFunction(value)) {
        value = value.apply(this)
      }
      if (this._options.keepNullAttributes && (value == null)) {
        this.att(name, "")
      } else if (value != null) {
        const ele = this._asElement

        // skip the default namespace declaration attribute
        // it is already processed by the _node function
        if (name !== "xmlns") {
          const attQName = Namespace.extractQName(name)
          if (attQName.prefix === "xmlns") {
            // prefixed namespace declaration attribute
            ele.setAttributeNS(Namespace.XMLNS, name, value)
          } else {
            const attNamespace = ele.lookupNamespaceURI(attQName.prefix)
            if (attNamespace != null && !ele.isDefaultNamespace(attNamespace)) {
              ele.setAttributeNS(attNamespace, name, value)
            } else {
              ele.setAttribute(name, value)
            }
          }
        }
      }
    }

    return this
  }

  /** @inheritdoc */
  removeAtt(namespace: string | string[], name?: string | string[]): XMLBuilder {
    if (name === undefined) {
      name = namespace
      namespace = ""
    }

    if (isArray(namespace)) {
      throw new TypeError("namespace parameter must be a string")
    }

    if (isArray(name)) {
      for (const attName of name) {
        this.removeAtt(namespace, attName)
      }
    } else {
      if (namespace) {
        this._asElement.removeAttributeNS(namespace, name)
      } else {
        this._asElement.removeAttribute(name)
      }
    }

    return this
  }

  /** @inheritdoc */
  txt(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createTextNode(content)
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  com(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createComment(content)
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  dat(content: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createCDATASection(content)
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  ins(target: string, content?: string): XMLBuilder {
    const ele = this._asElement

    const child = this._doc.createProcessingInstruction(target, content || '')
    ele.appendChild(child)

    return this
  }

  /** @inheritdoc */
  import(node: XMLBuilder): XMLBuilder {
    const hostNode = this._asNode
    const hostDoc = hostNode.ownerDocument
    if (hostDoc === null) {
      throw new Error("Owner document is null. " + this._debugInfo())
    }

    const importedNode = (<XMLBuilderImpl>node)._asNode

    if (importedNode.nodeType === NodeType.Document) {
      // import document node
      const elementNode = (<Document>importedNode).documentElement
      if (elementNode === null) {
        throw new Error("Imported document has no document node. " + this._debugInfo())
      }
      const clone = hostDoc.importNode(elementNode, true)
      hostNode.appendChild(clone)
    } else if (importedNode.nodeType === NodeType.DocumentFragment) {
      // import child nodes
      for (const childNode of importedNode.childNodes) {
        const clone = hostDoc.importNode(childNode, true)
        hostNode.appendChild(clone)
      }
    } else {
      // import node
      const clone = hostDoc.importNode(importedNode, true)
      hostNode.appendChild(clone)
    }

    return this
  }

  /** @inheritdoc */
  doc(): XMLBuilder {
    return XMLBuilderImpl._FromNode(this._doc)
  }

  /** @inheritdoc */
  root(): XMLBuilder {
    const ele = this._doc.documentElement
    if (!ele) {
      throw new Error("Document root element is null. " + this._debugInfo())
    }
    return XMLBuilderImpl._FromNode(ele)
  }

  /** @inheritdoc */
  up(): XMLBuilder {
    const parent = this._asNode.parentNode
    if (!parent) {
      throw new Error("Parent node is null. " + this._debugInfo())
    }
    return XMLBuilderImpl._FromNode(parent)
  }

  /** @inheritdoc */
  prev(): XMLBuilder {
    const node = this._asNode.previousSibling
    if (!node) {
      throw new Error("Previous sibling node is null. " + this._debugInfo())
    }
    return XMLBuilderImpl._FromNode(node)
  }

  /** @inheritdoc */
  next(): XMLBuilder {
    const node = this._asNode.nextSibling
    if (!node) {
      throw new Error("Next sibling node is null. " + this._debugInfo())
    }
    return XMLBuilderImpl._FromNode(node)
  }

  /** @inheritdoc */
  first(): XMLBuilder {
    const node = this._asNode.firstChild
    if (!node) {
      throw new Error("First child node is null. " + this._debugInfo())
    }
    return XMLBuilderImpl._FromNode(node)
  }

  /** @inheritdoc */
  last(): XMLBuilder {
    const node = this._asNode.lastChild
    if (!node) {
      throw new Error("Last child node is null. " + this._debugInfo())
    }
    return XMLBuilderImpl._FromNode(node)
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
  private _node(name: string, attributes?: AttributesObject | string,
    text?: AttributesObject | string): XMLBuilder {

    name = getValue(name)

    // swap argument order: text <-> attributes
    if (attributes && !isObject(attributes)) {
      [text, attributes] = [attributes, text]
    }

    // inherit namespace from parent
    const qName = Namespace.extractQName(name)
    let namespace: string | null = null
    if (this._options.inheritNS) {
      const parent = this._asNode.parentNode
      if (parent) {
        namespace = parent.lookupNamespaceURI(qName.prefix)
      }
    }

    // override namespace if there is a namespace declaration
    // attribute
    if (attributes && isObject(attributes)) {
      for (let [attName, attValue] of Object.entries(attributes)) {
        if (attName === "xmlns") {
          namespace = attValue
        } else {
          const attQName = Namespace.extractQName(attName)
          if (attQName.prefix === "xmlns" && attQName.localName === qName.prefix) {
            namespace = attValue
          }
        }
      }
    }

    const node = this._asNode
    const child = (namespace !== null ?
      this._doc.createElementNS(namespace, name) :
      this._doc.createElement(name)
    )

    node.appendChild(child)
    const builder = XMLBuilderImpl._FromNode(child)

    // create attributes
    if (attributes) builder.att(attributes)

    // create a text node
    if (text && isString(text)) {
      builder.txt(text)
    }

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
    return XMLBuilderImpl._FromNode(child)
  }

  /**
   * Returns the document owning this node.
   */
  private get _doc(): Document {
    const node = this._asNode
    const doc = node.ownerDocument
    if (!doc) {
      throw new Error("Document is null. " + this._debugInfo())
    }
    return doc
  }

  /**
   * Gets or sets builder options.
   */
  private get _options(): XMLBuilderOptions {
    const node = this._asNode
    if (node.nodeType === NodeType.Document) {
      return this._builderOptions || { version: "1.0" }
    } else {
      return (<XMLBuilderImpl>this.doc())._asAny._builderOptions
    }
  }
  private set _options(options: XMLBuilderOptions) {
    const node = this._asNode
    if (node.nodeType === NodeType.Document) {
      this._builderOptions = options
    } else {
      (<XMLBuilderImpl>this.doc())._asAny._builderOptions = options
    }
  }

  /**
   * Gets the stringifier.
   */
  private get _stringify(): XMLStringifier {
    if (!this._options.stringify) {
      throw new Error("Stringifier functions not found.")
    }

    return this._options.stringify
  }

  /**
   * Cast to `any` to call methods without a TypeScript interface definition.
   */
  private get _asAny(): any {
    return <any>this
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
   * Converts a DOM node to an `XMLBuilder`.
   */
  private static _FromNode(node: Node): XMLBuilder {
    return <XMLBuilder><unknown>node
  }

  /**
   * Returns debug information for this node.
   * 
   * @param name - node name
   */
  private _debugInfo(name?: string): string {
    const node = this._asNode
    const parentNode = this._asNode.parentNode

    name = name || node.nodeName
    const parentName = parentNode ? parentNode.nodeName : ''

    if (!name && !parentName) {
      return ""
    } else if (!name) {
      return "parent: <" + parentName + ">"
    } else if (!parentName) {
      return "node: <" + name + ">"
    } else {
      return "node: <" + name + ">, parent: <" + parentName + ">"
    }
  }

}
