import { Char } from "."
import { Validator, ValidateOptions } from "../interfaces"

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
  constructor(version: "1.0" | "1.1", options: ValidateOptions) {
    this._xmlVersion = version

    // override base implementation with user supplied functions
    if (options.pubID) this.pubID = options.pubID
    if (options.sysID) this.sysID = options.sysID
    if (options.name) this.name = options.name
    if (options.text) this.text = options.text
    if (options.cdata) this.cdata = options.cdata
    if (options.comment) this.comment = options.comment
    if (options.attValue) this.attValue = options.attValue
    if (options.insTarget) this.insTarget = options.insTarget
    if (options.insValue) this.insValue = options.insValue
    if (options.namespace) this.namespace = options.namespace
  }

  /** @inheritdoc */
  pubID(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertPubId(val, this._xmlVersion, debugInfo)
    return val
  }

  /** @inheritdoc */
  sysID(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo)
    if (val.includes('"') && val.includes("'")) {
      throw new Error(`System identifier cannot contain both a single and double quote: ${val}. ${debugInfo || ""}`)
    }
    return val
  }

  /** @inheritdoc */
  name(val: string, debugInfo?: string): string {
    val = '' + val
    Char.assertName(val, this._xmlVersion, debugInfo)
    return val
  }

  /** @inheritdoc */
  text(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo)
    return val
  }

  /** @inheritdoc */
  cdata(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo)
    if (val.includes("]]>")) {
      throw new Error(`CDATA content cannot contain "]]>": ${val}. ${debugInfo || ""}`)
    }
    return val
  }

  /** @inheritdoc */
  comment(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo)
    if (val.includes("--") || val.endsWith("-")) {
      throw new Error(`Comment content cannot contain double-hypen or end with a hypen: ${val}. ${debugInfo || ""}`)
    }
    return val
  }

  /** @inheritdoc */
  raw(val: string, debugInfo?: string | undefined): string {
    return '' + val
  }

  /** @inheritdoc */
  attValue(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo)
    return val
  }

  /** @inheritdoc */
  insTarget(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertName(val, this._xmlVersion, debugInfo)
    if (val.includes(":") || (/^xml$/i).test(val)) {
      throw new Error(`Processing instruction target cannot contain ":" or cannot be "xml": ${val}. ${debugInfo || ""}`)
    }
    return val
  }

  /** @inheritdoc */
  insValue(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo)
    if (val.includes("?>")) {
      throw new Error(`Processing instruction content cannot contain "?>": ${val}. ${debugInfo || ""}`)
    }
    return val
  }

  /** @inheritdoc */
  namespace(val: string, debugInfo?: string | undefined): string {
    val = '' + val
    Char.assertChar(val, this._xmlVersion, debugInfo)
    return val
  }

}