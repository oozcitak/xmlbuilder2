import { Char } from "./util"
import { Validator, XMLBuilderOptions } from "./interfaces"

/**
 * Validates character data in XML nodes.
 */
export class ValidatorImpl implements Validator {

  private _xmlVersion: "1.0" | "1.1"

  /**
   * Initializes a new instance of `ValidatorImpl`.
   * 
   * @options - builder options
   */
  constructor(options: XMLBuilderOptions) {
    this._xmlVersion = options.version || "1.0"

    // override base implementation with user supplied functions
    if (options.validate) {
      if (options.validate.pubID) this.pubID = options.validate.pubID
      if (options.validate.sysID) this.sysID = options.validate.sysID
      if (options.validate.text) this.text = options.validate.text
      if (options.validate.cdata) this.cdata = options.validate.cdata
      if (options.validate.comment) this.comment = options.validate.comment
      if (options.validate.attValue) this.attValue = options.validate.attValue
      if (options.validate.insTarget) this.insTarget = options.validate.insTarget
      if (options.validate.insValue) this.insValue = options.validate.insValue
      if (options.validate.namespace) this.namespace = options.validate.namespace
    }
  }

  /** @inheritdoc */
  pubID(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertPubId(val, this._xmlVersion, debugInfo || '')
    return val
  }

  /** @inheritdoc */
  sysID(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo || '')
    if (val.includes('"') && val.includes("'")) {
      throw new Error(`System identifier cannot contain both a single and double quote: ${val}.` + debugInfo || '')
    }
    return val
  }

  /** @inheritdoc */
  name(val: string, debugInfo?: string): string {
    val = '' + val
    Char.assertName(val, this._xmlVersion, debugInfo || '')
    return val
  }

  /** @inheritdoc */
  text(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo || '')
    return val
  }

  /** @inheritdoc */
  cdata(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo || '')
    if (val.includes("]]>")) {
      throw new Error(`CDATA content cannot contain "]]>": ${val}.` + debugInfo || '')
    }
    return val
  }

  /** @inheritdoc */
  comment(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo || '')
    if (val.includes("--") || val.endsWith("-")) {
      throw new Error(`Comment content cannot contain double-hypen or end with a hypen: ${val}.` + debugInfo || '')
    }
    return val
  }

  /** @inheritdoc */
  attValue(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo || '')
    return val
  }

  /** @inheritdoc */
  insTarget(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertName(val, this._xmlVersion, debugInfo || '')
    if (val.includes(":") || (/^xml$/i).test(val)) {
      throw new Error(`Processing instruction target cannot contain ":" or cannot be "xml": ${val}.` + debugInfo || '')
    }
    return val
  }

  /** @inheritdoc */
  insValue(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo || '')
    if (val.includes("?>")) {
      throw new Error(`Processing instruction content cannot contain "?>": ${val}.` + debugInfo || '')
    }
    return val
  }

  /** @inheritdoc */
  namespace(val: string, debugInfo?: string | undefined): string {
    return '' + val
  }

}