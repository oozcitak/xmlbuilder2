import { XMLBuilder, ExpandObject } from "../interfaces"
import { ObjectReader } from "./ObjectReader"
import { BaseReader } from "./BaseReader"
import { load as loadYaml } from "js-yaml"

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
    const result = loadYaml(str) as ExpandObject | undefined
    /* istanbul ignore next */
    if (result === undefined) {
      throw new Error("Unable to parse YAML document.")
    }
    return new ObjectReader(this._builderOptions).parse(node, result)
  }
}
