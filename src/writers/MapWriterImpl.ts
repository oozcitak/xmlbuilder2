import {
  XMLSerializedValue, MapWriterOptions, XMLBuilderOptions
} from "../builder/interfaces"
import { applyDefaults } from "@oozcitak/util"
import { 
  Node, NodeType, CharacterData, ProcessingInstruction, Comment, Text, 
  CDATASection, Element 
} from "@oozcitak/dom/lib/dom/interfaces"
import { PreSerializer } from "@oozcitak/dom/lib/serializer/PreSerializer"
import { Guard } from "@oozcitak/dom/lib/util"

/**
 * Serializes XML nodes into maps and arrays.
 */
export class MapWriterImpl {

  private _builderOptions: XMLBuilderOptions

  /**
   * Initializes a new instance of `MapWriterImpl`.
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
  serialize(node: Node, writerOptions?: MapWriterOptions): XMLSerializedValue {
    const options: MapWriterOptions = applyDefaults(writerOptions, {
      format: "map"
    })

    return []
  }

}