import { AbstractRange, Node } from './interfaces'

/**
 * Represents a generic XML node.
 */
export class AbstractRangeImpl implements AbstractRange {

  protected _start: [Node, number]
  protected _end: [Node, number]

  /**
   * Initializes a new instance of `AbstractRange`.
   */
  protected constructor(start: [Node, number], end: [Node, number]) {
    this._start = start
    this._end = end
  }

  /**
   * Returns the start node of the range.
   */
  get startContainer(): Node { return this._start[0] }

  /**
   * Returns the start offset of the range.
   */
  get startOffset(): number { return this._start[1] }

  /**
   * Returns the end node of the range.
   */
  get endContainer(): Node { return this._end[0] }

  /**
   * Returns the end offset of the range.
   */
  get endOffset(): number { return this._end[1] }

  /**
   * Returns `true` if the range starts and ends at the same point.
   */
  get collapsed(): boolean {
    return (this._start[0] === this._end[0] &&
      this._start[1] === this._end[1])
  }

}
