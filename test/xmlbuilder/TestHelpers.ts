import TestHelpersRoot from "../TestHelpers"
import { XMLSerializer } from '../../src/dom/serializer'

import { withOptions, create, parse, fragment } from '../../src/xmlbuilder'

export default class TestHelpers extends TestHelpersRoot {
  static withOptions = withOptions
  static create = create
  static fragment = fragment
  static parse = parse
  static serialize(node: any): string {
    const serializer = new XMLSerializer()
    return serializer.serializeToString(node)
  }
}