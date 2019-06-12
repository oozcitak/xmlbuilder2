import { XMLWriter, WriterOptions, WriterState } from "./interfaces"
import { Node } from "../dom/interfaces"

/**
 * Converts values to strings.
 */
export class XMLWriterBaseImpl<T> implements XMLWriter<T> {

  /** @inheritdoc */
  textEscape(str: string): string {
    const ampregex = (this.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g)
    // TODO: Check if we need to escape \r
    return str.replace(ampregex, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\r/g, '&#xD;')
  }

  /** @inheritdoc */
  attEscape(str: string): string {
    const ampregex = (this.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g)
    // TODO: Check if we need to escape \t, \n, \r
    return str.replace(ampregex, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\t/g, '&#x9;')
      .replace(/\n/g, '&#xA;')
      .replace(/\r/g, '&#xD;')
  }

  /**
   * Index signature
   */
  [key: string]: undefined | ((v: string) => string) |
    ((node: Node, options: WriterOptions, state: WriterState, user: {}) => T)
}
