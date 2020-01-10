import {
  XMLSerializedValue, ObjectWriterOptions, XMLBuilderOptions
} from "../builder/interfaces"
import { applyDefaults, isArray, isString, isObject } from "@oozcitak/util"
import {
  Node, NodeType
} from "@oozcitak/dom/lib/dom/interfaces"
import { PreSerializer } from "@oozcitak/dom/lib/serializer/PreSerializer"

class IntermediateContentNode {
  parent: IntermediateElementNode
  contentNode = true

  name: string
  contents: string

  constructor(parent: IntermediateElementNode, name: string, contents: string) {
    this.parent = parent
    this.name = name
    this.contents = contents
  }
}

class IntermediateElementNode {
  parent?: IntermediateElementNode
  contentNode = false

  name: string
  contents: (IntermediateContentNode | IntermediateElementNode)[] = []

  constructor(parent: IntermediateElementNode | undefined, name: string) {
    this.parent = parent
    this.name = name
  }

  appendContentNode(name: string, contents: string): void {
    this.contents.push(new IntermediateContentNode(this, name, contents))
  }

  appendElementNode(name: string): IntermediateElementNode {
    const newItem = new IntermediateElementNode(this, name)
    this.contents.push(newItem)
    return newItem
  }
}

function isContentNode(x: any): x is IntermediateContentNode { return x.contentNode }
function isElementNode(x: any): x is IntermediateElementNode { return !x.contentNode }

type IntermediateValue = {
  parent?: IntermediateValue,
  name: string,
  items: (string | IntermediateValue)[]
}

/**
 * Serializes XML nodes into objects and arrays.
 */
export class ObjectWriterImpl {

  private _builderOptions: XMLBuilderOptions
  private _pre!: PreSerializer

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
   * @param writerOptions - serialization options
   */
  serialize(node: Node, writerOptions?: ObjectWriterOptions): XMLSerializedValue {
    const options: ObjectWriterOptions = applyDefaults(writerOptions, {
      format: "object"
    })

    let intObj: IntermediateValue = { name: "#document", items: [] }
    this._pre = new PreSerializer(this._builderOptions.version, {
      beginElement: (name) => {
        const childObj = this._addElement(intObj, name)
        intObj = childObj
      },
      endElement: () => {
        if (intObj.parent) intObj = intObj.parent
      },
      attribute: (name, value) => {
        this._addValue(intObj, this._getAttrKey() + name, value)
      },
      comment: (data) => {
        this._addValue(intObj, this._getNodeKey(NodeType.Comment), data)
      },
      text: (data) => {
        this._addValue(intObj, this._getNodeKey(NodeType.Text), data)
      },
      instruction: (target, data) => {
        this._addValue(intObj, this._getNodeKey(NodeType.ProcessingInstruction), target + " " + data)
      },
      cdata: (data) => {
        this._addValue(intObj, this._getNodeKey(NodeType.CData), data)
      }
    })

    this._pre.serialize(node, false)
    return { }
  }

  private _addElement(obj: IntermediateValue, name: string): IntermediateValue {
    const childObj: IntermediateValue = { parent: obj, name: name, items: [] }
    obj.items.push(childObj)
    return childObj
  }

  private _addValue(obj: IntermediateValue, key: string, value: string): void {
    if (obj.items.length === 0) {
      obj.items.push({ parent: obj, name: key, items: [value] })
    } else {
      const lastItem = obj.items[obj.items.length - 1]
      if (isObject(lastItem) && lastItem.name === key) {
        lastItem.items.push(value)
      } else {
        obj.items.push({ parent: obj, name: key, items: [value] })
      }
    }
  }

  /**
   * Returns an object key for and attribute or namespace declaration.
   */
  private _getAttrKey(): string {
    return this._builderOptions.convert.att
  }

  /**
   * Returns an object key for the given node type.
   * 
   * @param nodeType - node type to get a key for
   */
  private _getNodeKey(nodeType: NodeType): string {
    switch (nodeType) {
      case NodeType.Comment:
        return this._builderOptions.convert.comment
      case NodeType.Text:
        return this._builderOptions.convert.text
      case NodeType.ProcessingInstruction:
        return this._builderOptions.convert.ins
      case NodeType.CData:
        return this._builderOptions.convert.cdata
      /* istanbul ignore next */
      default:
        throw new Error("Invalid node type.")
    }
  }

}
