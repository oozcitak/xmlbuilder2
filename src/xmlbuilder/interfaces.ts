/**
 * Defines the options used while creating an XML document.
 */
export interface XMLBuilderOptions {
  /**
   * A version number string, e.g. `1.0`
   */
  version?: string
  /**
   * Encoding declaration, e.g. `UTF-8`
   */
  encoding?: string
  /**
   * Standalone document declaration: `true` or `false`
   */
  standalone?: boolean
  /**
   * Public identifier of the DTD
   */
  pubID?: string
  /**
   * System identifier of the DTD
   */
  sysID?: string
  /**
   * Whether XML declaration and doctype will be included
   */
  headless?: boolean
  /**
   * Whether nodes with `null` values will be kept or ignored
   */
  keepNullNodes?: boolean
  /**
   * Whether attributes with `null` values will be kept or ignored
   */
  keepNullAttributes?: boolean
  /** 
   * Whether decorator strings will be ignored when converting JS 
   * objects
   */
  ignoreDecorators?: boolean
  /** 
   * Whether array items are created as separate nodes when passed 
   * as an object value
   */
  separateArrayItems?: boolean
  /**
   * Whether existing html entities are encoded
   */
  noDoubleEncoding?: boolean;
  /**
   * Whether values will be validated and escaped or returned as is
   */
  noValidation?: boolean
  /**
   * A set of functions to use for converting values to strings
   */
  stringify?: XMLStringifier
}
