import { Node, Range, NodeType, BoundaryPosition, HowToCompare, DocumentFragment, CharacterData } from './interfaces'
import { AbstractRangeImpl } from './AbstractRangeImpl'
import { TreeQuery } from './util/TreeQuery';
import { DOMException } from '.'
import { BoundaryPoint } from './util/BoundaryPoint';
import { RangeQuery } from './util/RangeQuery';
import { CharacterDataUtility } from './util/CharacterDataUtility';
import { randomBytes } from 'crypto';

/**
 * Represents a live range.
 */
export class RangeImpl extends AbstractRangeImpl implements Range {

  static readonly START_TO_START: number = 0
  static readonly START_TO_END: number = 1
  static readonly END_TO_END: number = 2
  static readonly END_TO_START: number = 3

  /**
   * Initializes a new instance of `Range`.
   */
  constructor(start?: [Node, number], end?: [Node, number]) {
    super([<Node><unknown>null, 0], [<Node><unknown>null, 0])

    if (start) { this.setStart(start[0], start[1]) }
    if (end) { this.setEnd(end[0], end[1]) }
  }

  /** @inheritdoc */
  get commonAncestorContainer(): Node {
    let container = this._start[0]
    while (!TreeQuery.isAncestorOf(this._end[0], container, true)) {
      if (container.parentNode === null) {
        throw new Error("Container node has no parent node.")
      } else {
        container = container.parentNode
      }
    }

    return container
  }

  /** @inheritdoc */
  setStart(node: Node, offset: number): void {
    if (node.nodeType === NodeType.DocumentType) {
      throw DOMException.InvalidNodeTypeError
    }
    if (offset > TreeQuery.nodeLength(node)) {
      throw DOMException.IndexSizeError
    }

    const bp: [Node, number] = [node, offset]

    if (BoundaryPoint.position(bp, this._end) === BoundaryPosition.After ||
      RangeQuery.root(this) !== TreeQuery.rootNode(node)) {
      this._end = bp
    }

    this._start = bp
  }

  /** @inheritdoc */
  setEnd(node: Node, offset: number): void {
    if (node.nodeType === NodeType.DocumentType) {
      throw DOMException.InvalidNodeTypeError
    }

    if (offset > TreeQuery.nodeLength(node)) {
      throw DOMException.IndexSizeError
    }

    const bp: [Node, number] = [node, offset]

    if (BoundaryPoint.position(bp, this._start) === BoundaryPosition.Before ||
      RangeQuery.root(this) !== TreeQuery.rootNode(node)) {
      this._start = bp
    }

    this._end = bp
  }

  /** @inheritdoc */
  setStartBefore(node: Node): void {
    let parent = node.parentNode
    if (parent === null) {
      throw DOMException.InvalidNodeTypeError
    }
    this.setStart(parent, TreeQuery.index(node))
  }

  /** @inheritdoc */
  setStartAfter(node: Node): void {
    let parent = node.parentNode
    if (parent === null) {
      throw DOMException.InvalidNodeTypeError
    }
    this.setStart(parent, TreeQuery.index(node) + 1)
  }

  /** @inheritdoc */
  setEndBefore(node: Node): void {
    let parent = node.parentNode
    if (parent === null) {
      throw DOMException.InvalidNodeTypeError
    }
    this.setEnd(parent, TreeQuery.index(node))
  }

  /** @inheritdoc */
  setEndAfter(node: Node): void {
    let parent = node.parentNode
    if (parent === null) {
      throw DOMException.InvalidNodeTypeError
    }
    this.setEnd(parent, TreeQuery.index(node) + 1)
  }

  /** @inheritdoc */
  collapse(toStart?: boolean | undefined): void {
    if (toStart) {
      this._end = this._start
    } else {
      this._start = this._end
    }
  }

  /** @inheritdoc */
  selectNode(node: Node): void {
    let parent = node.parentNode
    if (parent === null) {
      throw DOMException.InvalidNodeTypeError
    }

    let index = TreeQuery.index(node)
    this._start = [parent, index]
    this._end = [parent, index + 1]
  }

  /** @inheritdoc */
  selectNodeContents(node: Node): void {
    if (node.nodeType === NodeType.DocumentType) {
      throw DOMException.InvalidNodeTypeError
    }
    let length = TreeQuery.nodeLength(node)
    this._start = [node, 0]
    this._end = [node, length]
  }

  /** @inheritdoc */
  compareBoundaryPoints(how: HowToCompare, sourceRange: Range): number {
    if (RangeQuery.root(this) !== RangeQuery.root(sourceRange)) {
      throw DOMException.WrongDocumentError
    }

    let thisPoint: [Node, number]
    let otherPoint: [Node, number]

    switch(how) {
      case HowToCompare.StartToStart:
        thisPoint = this._start
        otherPoint = [sourceRange.startContainer, sourceRange.startOffset]
        break
      case HowToCompare.StartToEnd:
        thisPoint = this._end
        otherPoint = [sourceRange.startContainer, sourceRange.startOffset]
      case HowToCompare.EndToEnd:
        thisPoint = this._end
        otherPoint = [sourceRange.endContainer, sourceRange.endOffset]
      case HowToCompare.EndToStart:
        thisPoint = this._start
        otherPoint = [sourceRange.endContainer, sourceRange.endOffset]
      default:
        throw DOMException.NotSupportedError
    }

    const position = BoundaryPoint.position(thisPoint, otherPoint)

    if (position === BoundaryPosition.Before) {
      return -1
    } else if (position === BoundaryPosition.After) {
      return 1
    } else {
      return 0
    }
  }

  /** @inheritdoc */
  deleteContents(): void {
    if (this.collapsed) {
      return
    }

    const [originalStartNode, originalStartOffset] = this._start
    const [originalEndNode, originalEndOffset] = this._end

    if (originalStartNode === originalEndNode && 
      (originalStartNode.nodeType === NodeType.Text || 
        originalStartNode.nodeType === NodeType.ProcessingInstruction || 
        originalStartNode.nodeType === NodeType.Comment)) {
      CharacterDataUtility.replaceData(<CharacterData>originalStartNode, originalStartOffset, originalEndOffset, '')
      return
    }

    const nodesToRemove: Node[] = []
    for (const node of RangeQuery.getContainedNodes(this)) {
      const parent = node.parentNode
      if (parent !== null && RangeQuery.isContained(this, parent)) {
        continue
      }
      nodesToRemove.push(node)
    }

    let newNode: Node
    let newOffset: number

    if (TreeQuery.isAncestorOf(originalEndNode, originalStartNode, true)) {
      newNode = originalStartNode
      newOffset = originalStartOffset  
    } else {
      let referenceNode = originalStartNode
      while (referenceNode.parentNode !== null && 
        TreeQuery.isAncestorOf(originalEndNode, referenceNode.parentNode, true)) {
        referenceNode = referenceNode.parentNode
      }
      /** istanbul ignore next */
      if (referenceNode.parentNode === null) {
        throw new Error("Parent node is null.")
      }
      newNode = referenceNode.parentNode
      newOffset = TreeQuery.index(referenceNode) + 1
    }

    if (originalStartNode.nodeType === NodeType.Text || 
        originalStartNode.nodeType === NodeType.ProcessingInstruction || 
        originalStartNode.nodeType === NodeType.Comment) {
      CharacterDataUtility.replaceData(<CharacterData>originalStartNode, 
        originalStartOffset, 
        TreeQuery.nodeLength(originalStartNode) - originalStartOffset, '')
      return
    }

    for (const node of nodesToRemove) {
      if (node.parentNode) {
        node.parentNode.removeChild(node)
      }
    }

    if (originalEndNode.nodeType === NodeType.Text || 
      originalEndNode.nodeType === NodeType.ProcessingInstruction || 
      originalEndNode.nodeType === NodeType.Comment) {
    CharacterDataUtility.replaceData(<CharacterData>originalEndNode, 
      0, originalEndOffset, '')
    return
  }

  this._start = [newNode, newOffset]
  this._end = [newNode, newOffset]
  }
  
  /** @inheritdoc */
  extractContents(): DocumentFragment {
    throw new Error("Method not implemented.");
  }
  /** @inheritdoc */
  cloneContents(): DocumentFragment {
    throw new Error("Method not implemented.");
  }
  /** @inheritdoc */
  insertNode(node: Node): void {
    throw new Error("Method not implemented.");
  }
  /** @inheritdoc */
  surroundContents(newParent: Node): void {
    throw new Error("Method not implemented.");
  }
  /** @inheritdoc */
  cloneRange(): Range {
    throw new Error("Method not implemented.");
  }
  /** @inheritdoc */
  detach(): void {
    throw new Error("Method not implemented.");
  }
  /** @inheritdoc */
  isPointInRange(node: Node, offset: number): boolean {
    throw new Error("Method not implemented.");
  }
  /** @inheritdoc */
  comparePoint(node: Node, offset: number): number {
    throw new Error("Method not implemented.");
  }
  /** @inheritdoc */
  intersectsNode(node: Node): boolean {
    throw new Error("Method not implemented.");
  }

}
