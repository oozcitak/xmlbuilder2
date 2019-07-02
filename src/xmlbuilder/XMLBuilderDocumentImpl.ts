import { XMLBuilderOptions, Validator } from "./interfaces"
import { XMLBuilderNodeImpl } from "./XMLBuilderNodeImpl"

/**
 * Represents a mixin that extends XML document nodes to implement easy to use
 * and chainable document builder methods.
 */
export class XMLBuilderDocumentImpl extends XMLBuilderNodeImpl {

  private _builderOptions?: XMLBuilderOptions
  private _validator?: Validator

  protected get _options(): XMLBuilderOptions {
    /* istanbul ignore next */
    if (this._builderOptions === undefined) {
      throw new Error("Builder options is not set.")
    }
    return this._builderOptions
  }
  protected set _options(value: XMLBuilderOptions) {
    this._builderOptions = value
  }

  protected get _validate(): Validator {
    /* istanbul ignore next */
    if (this._validator === undefined) {
      throw new Error("Validator is not set.")
    }
    return this._validator
  }
  protected set _validate(value: Validator) {
    this._validator = value
  }
}
