import { Node, BoundaryPoint } from './interfaces'
import { AbstractRangeInternal } from './interfacesInternal'

/**
 * Represents an abstract range with a start and end boundary point.
 */
export abstract class AbstractRangeImpl implements AbstractRangeInternal {

  abstract _start: BoundaryPoint
  abstract _end: BoundaryPoint

  get _startNode(): Node { return this._start[0] }
  get _startOffset(): number { return this._start[1] }
  get _endNode(): Node { return this._end[0] }
  get _endOffset(): number { return this._end[1] }

  get _collapsed(): boolean {
    return (this._start[0] === this._end[0] &&
      this._start[1] === this._end[1])
  }

  /**
   * Returns the start node of the range.
   */
  get startContainer(): Node { return this._startNode }

  /**
   * Returns the start offset of the range.
   */
  get startOffset(): number { return this._startOffset }

  /**
   * Returns the end node of the range.
   */
  get endContainer(): Node { return this._endNode }

  /**
   * Returns the end offset of the range.
   */
  get endOffset(): number { return this._endOffset }

  /**
   * Returns `true` if the range starts and ends at the same point.
   */
  get collapsed(): boolean { return this._collapsed }

}
