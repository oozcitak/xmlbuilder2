import { XMLStringifier, XMLBuilderOptions } from "./interfaces"

/**
 * Converts values to strings.
 */
export class XMLStringifierImpl implements XMLStringifier {
  /** @inheritdoc */
  noDoubleEncoding = false

  /** @inheritdoc */
  name(val: any): string {
    return '' + val || ''
  }

  /** @inheritdoc */
  text(val: any): string {
    return this.textEscape('' + val || '')
  }
  /** @inheritdoc */
  cdata(val: any): string {
    val = '' + val || ''
    val = val.replace(']]>', ']]]]><![CDATA[>')
    return val
  }
  /** @inheritdoc */
  comment(val: any): string {
    val = '' + val || ''
    if (val.match(/--/)) {
      throw new Error("Comment text cannot contain double-hypen: " + val)
    }
    return val
  }
  /** @inheritdoc */
  attValue(val: any): string {
    return this.attEscape(val = '' + val || '')
  }
  /** @inheritdoc */
  insTarget(val: any): string {
    return '' + val || ''
  }
  /** @inheritdoc */
  insValue(val: any): string {
    val = '' + val || ''
    if (val.match(/\?>/)) {
      throw new Error("Invalid processing instruction value: " + val)
    }
    return val
  }

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
  [key: string]: undefined | boolean | string | ((v: any) => string) |
    ((v: string) => string) | XMLBuilderOptions  
}
