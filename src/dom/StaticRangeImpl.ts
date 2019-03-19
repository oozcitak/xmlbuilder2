import { StaticRange, Node } from './interfaces'
import { AbstractRangeImpl } from './AbstractRangeImpl';
import { DOMException } from './DOMException';

/**
 * Represents a generic XML node.
 */
export class StaticRangeImpl extends AbstractRangeImpl implements StaticRange {

  /**
   * Initializes a new instance of `StaticRange`.
   */
  constructor() {
    super([<Node><unknown>null, 0], [<Node><unknown>null, 0])

    throw DOMException.NotSupportedError
  }

}
