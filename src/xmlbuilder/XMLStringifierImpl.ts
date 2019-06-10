import { XMLStringifier, XMLBuilderOptions } from "./interfaces"
import { XMLSpec } from "../dom/spec"

/**
 * Converts values to strings.
 */
export class XMLStringifierImpl implements XMLStringifier {
  private _options: XMLBuilderOptions

  /**
   * Initializes a new instance of `XMLStringifier`
   * 
   * @param options - builder options
   */
  constructor(options: XMLBuilderOptions) {
    this._options = options || { version: "1.0" }
    const stringify = this._options.stringify || {}
    for (const key in stringify) {
      if (!stringify.hasOwnProperty(key)) continue
      this[key] = stringify[key]
    }
  }

  /** @inheritdoc */
  convertAttKey = '@'
  /** @inheritdoc */
  convertPIKey = '?'
  /** @inheritdoc */
  convertTextKey = '#text'
  /** @inheritdoc */
  convertCDataKey = '#cdata'
  /** @inheritdoc */
  convertCommentKey = '#comment'
  /** @inheritdoc */
  convertRawKey = '#raw'

  /** @inheritdoc */
  name(val: any): string {
    return this._assertLegalName('' + val || '')
  }

  /** @inheritdoc */
  text(val: any): string {
    return this._assertLegalChar(this.textEscape('' + val || ''))
  }
  /** @inheritdoc */
  cdata(val: any): string {
    val = '' + val || ''
    val = val.replace(']]>', ']]]]><![CDATA[>')
    return this._assertLegalChar(val)
  }
  /** @inheritdoc */
  comment(val: any): string {
    val = '' + val || ''
    if (val.match(/--/)) {
      throw new Error("Comment text cannot contain double-hypen: " + val)
    }
    return this._assertLegalChar(val)
  }
  /** @inheritdoc */
  raw(val: any): string {
    return '' + val || ''
  }
  /** @inheritdoc */
  attValue(val: any): string {
    return this._assertLegalChar(this.attEscape(val = '' + val || ''))
  }
  /** @inheritdoc */
  insTarget(val: any): string {
    return this._assertLegalChar('' + val || '')
  }
  /** @inheritdoc */
  insValue(val: any): string {
    val = '' + val || ''
    if (val.match(/\?>/)) {
      throw new Error("Invalid processing instruction value: " + val)
    }
    return this._assertLegalChar(val)
  }

  /** @inheritdoc */
  textEscape(str: string): string {
    const ampregex = (this._options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g)
    // TODO: Check if we need to escape \r
    return str.replace(ampregex, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/\r/g, '&#xD;')
  }

  /** @inheritdoc */
  attEscape(str: string): string {
    const ampregex = (this._options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g)
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
   * Validates characters according to the XML spec.
   */
  private _assertLegalChar(str: string): string {
    if (!XMLSpec.isLegalChar(str, this._options.version)) {
      throw new Error(`Invalid character in string: ${str}.`)
    }
    return str
  }

  /** 
   * Validates a name according to the XML spec.
   */  
  private _assertLegalName(str: string): string {
    this._assertLegalChar(str)
    if (!XMLSpec.isName(str)) {
      throw new Error(`Invalid character in name: ${str}.`)
    }
    return str
  }

  /**
   * Index signature
   */
  [key: string]: undefined | string | ((v: any) => string) | 
    ((v: string) => string) | XMLBuilderOptions
}
