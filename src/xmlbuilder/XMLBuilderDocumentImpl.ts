import { XMLBuilderOptions, Validator } from "./interfaces"
import { XMLBuilderImpl } from "./XMLBuilderImpl"
import { ValidatorImpl } from "./ValidatorImpl"

/**
 * Represents a mixin that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export class XMLBuilderDocumentImpl extends XMLBuilderImpl {

  private _builderOptions: XMLBuilderOptions = { version: "1.0" }
  private _validator: Validator = new ValidatorImpl({ version: "1.0" })

  /** @inheritdoc */
  get options(): XMLBuilderOptions {
    return this._builderOptions
  }
  set options(options: XMLBuilderOptions) {
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
    return this._validator
  }
  set validate(validator: Validator) {
    this._validator = validator
  }

}
