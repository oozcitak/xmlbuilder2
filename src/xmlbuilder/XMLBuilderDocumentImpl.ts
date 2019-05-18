import { XMLDocument } from "../dom"
import {
  XMLBuilder, XMLBuilderDocument, AttributesOrText, ExpandObject
} from "./interfaces"

/**
 * Represents an XML document extended with the builder mixin.
 */
export class XMLBuilderDocumentImpl extends XMLDocument implements XMLBuilderDocument {

  // MIXIN: XMLBuilder
  /* istanbul ignore next */
  namespace(namespace: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  element(name: string | ExpandObject, attributes?: AttributesOrText, text?: AttributesOrText): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  attribute(name: AttributesOrText, value?: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  text(content: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  comment(content: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  cdata(content: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  instruction(target: string, content?: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  raw(content: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  document(): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  root(): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  up(): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  prev(): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  next(): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }

  // Function aliases
  /* istanbul ignore next */
  ns(namespace: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  ele(name: string | ExpandObject, attributes?: AttributesOrText, text?: AttributesOrText): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  att(name: AttributesOrText, value?: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  txt(content: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  com(content: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  dat(content: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  ins(target: string, content?: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  doc(): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }

}
