import { Element } from '../dom'
import { 
  XMLBuilderOptions, XMLBuilder, XMLBuilderElement 
} from "./interfaces"

/**
 * Represents an element node extended with the builder mixin.
 */
export class XMLBuilderElementImpl extends Element implements XMLBuilderElement {

  // MIXIN: XMLBuilder
  /* istanbul ignore next */
  get options(): XMLBuilderOptions { throw new Error("Mixin: XMLBuilder not implemented.") }
  set options(value: XMLBuilderOptions) { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  element(namespace: string, qualifiedName?: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
  /* istanbul ignore next */
  attribute(namespace: string, qualifiedName: string, value?: string): XMLBuilder { throw new Error("Mixin: XMLBuilder not implemented.") }
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

}