import { BuilderOptions, Validator } from "./interfaces"
import { XMLBuilderImpl } from "./XMLBuilderImpl"

/**
 * Represents a mixin that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export class XMLBuilderDocumentImpl extends XMLBuilderImpl {

  private _builderOptions?: BuilderOptions
  private _validator?: Validator

  /** @inheritdoc */
  get options(): BuilderOptions {
    if (this._builderOptions === undefined) {
      throw new Error("Builder options is undefined." + this._debugInfo())
    }

    return this._builderOptions
  }
  set options(options: BuilderOptions) {
    // character validation
    if (options.pubID !== undefined) {
      options.pubID = this.validate.pubID(options.pubID, this._debugInfo())
    }
    if (options.sysID !== undefined) {
      options.sysID = this.validate.sysID(options.sysID, this._debugInfo())
    }

    this._builderOptions = options
  }

  /** @inheritdoc */
  get validate(): Validator {
    if (this._validator === undefined) {
      throw new Error("Validator is undefined." + this._debugInfo())
    }

    return this._validator
  }
  set validate(validator: Validator) {
    this._validator = validator
  }

}
