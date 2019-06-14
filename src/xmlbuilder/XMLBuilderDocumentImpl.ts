import { XMLBuilderOptions } from "./interfaces"
import { XMLBuilderImpl } from "./XMLBuilderImpl"

/**
 * Represents a mixin that extends XML nodes to implement easy to use and
 * chainable document builder methods.
 */
export class XMLBuilderDocumentImpl extends XMLBuilderImpl {

  private _builderOptions: XMLBuilderOptions = { version: "1.0" }

  /** @inheritdoc */
  get options(): XMLBuilderOptions {
    return this._builderOptions
  }
  set options(options: XMLBuilderOptions) {
    this._builderOptions = options
  }

}
