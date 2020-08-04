import { XMLBuilder } from "../interfaces"
import { ObjectReader } from "./ObjectReader"
import { BaseReader } from "./BaseReader"
import { safeLoad } from "js-yaml"

/**
 * Parses XML nodes from a YAML string.
 */
export class YAMLReader extends BaseReader<string> {

  /**
   * Parses the given document representation.
   * 
   * @param node - node receive parsed XML nodes
   * @param str - YAML string to parse
   */
  _parse(node: XMLBuilder, str: string): XMLBuilder {
    const result = safeLoad(str)
    if (result === undefined) {
      throw new Error("Unable to parse YAML document.")
    }
    return new ObjectReader(this._builderOptions).parse(node, result)
  }
}
