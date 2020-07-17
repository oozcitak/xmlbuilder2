import { XMLBuilder } from "../interfaces"
import { ObjectReader } from "./ObjectReader"
import { BaseReader } from "./BaseReader"

/**
 * Parses XML nodes from a JSON string.
 */
export class JSONReader extends BaseReader<string> {

  /**
   * Parses the given document representation.
   * 
   * @param node - node receive parsed XML nodes
   * @param str - JSON string to parse
   */
  _parse(node: XMLBuilder, str: string): XMLBuilder {
    return new ObjectReader(this._builderOptions).parse(node, JSON.parse(str))
  }
}
