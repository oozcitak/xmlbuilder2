import {
  Node, BoundaryPosition, NodeType, CharacterData,
  DocumentFragment, BoundaryPoint
} from '../interfaces'
import { TreeQuery } from './TreeQuery'
import { TreeMutation } from './TreeMutation'
import { TextUtility } from './TextUtility'
import { BPUtil } from './BPUtil'
import { DOMException } from '../DOMException'
import { DocumentFragmentImpl } from '../DocumentFragmentImpl'
import { RangeImpl } from '../RangeImpl'
import { RangeInternal, DocumentInternal, NodeInternal } from '../interfacesInternal'
import { Guard } from './Guard'

/**
 * Includes methods to query ranges.
 */
export class RangeQuery {

  /** 
   * Sets the start boundary point of a range.
   * 
   * @param range - a range
   * @param node - a node
   * @param offset - an offset on node
   */
  static setStart(range: RangeInternal, node: Node, offset: number): void {
    if (node.nodeType === NodeType.DocumentType) {
      throw DOMException.InvalidNodeTypeError
    }
    if (offset > TreeQuery.nodeLength(node)) {
      throw DOMException.IndexSizeError
    }

    const bp: BoundaryPoint = [node, offset]

    if (BPUtil.position(bp, range._end) === BoundaryPosition.After ||
      range._root !== TreeQuery.rootNode(node)) {
      range._end = bp
    }

    range._start = bp
  }

  /** 
   * Sets the end boundary point of a range.
   * 
   * @param range - a range
   * @param node - a node
   * @param offset - an offset on node
   */
  static setEnd(range: RangeInternal, node: Node, offset: number): void {
    if (node.nodeType === NodeType.DocumentType) {
      throw DOMException.InvalidNodeTypeError
    }

    if (offset > TreeQuery.nodeLength(node)) {
      throw DOMException.IndexSizeError
    }

    const bp: BoundaryPoint = [node, offset]

    if (BPUtil.position(bp, range._start) === BoundaryPosition.Before ||
      range._root !== TreeQuery.rootNode(node)) {
      range._start = bp
    }

    range._end = bp
  }

  /** Selects a node.
   * 
   * @param range - a range
   * @param node - a node
   */
  static selectNode(range: RangeInternal, node: Node): void {
    let parent = node.parentNode
    if (parent === null) {
      throw DOMException.InvalidNodeTypeError
    }

    let index = TreeQuery.index(node)
    range._start = [parent, index]
    range._end = [parent, index + 1]
  }

  /**
   * Traverses through all contained nodes of a range.
   * 
   * @param range - a range
   */
  static *getContainedNodes(range: RangeInternal): IterableIterator<Node> {
    const root = range._root
    const container = range.commonAncestorContainer

    const start: BoundaryPoint = range._start
    const end: BoundaryPoint = range._end

    for (const node of TreeQuery.getDescendantNodes(container)) {
      if (root === TreeQuery.rootNode(node)) {
        const nodeStart = BPUtil.nodeStart(node)
        const nodeEnd = BPUtil.nodeEnd(node)
        if (BPUtil.position(nodeStart, start) === BoundaryPosition.After &&
          BPUtil.position(nodeEnd, end) === BoundaryPosition.Before) {
          yield node
        }
      }
    }
  }

  /**
   * Traverses through all partially contained nodes of a range.
   * 
   * @param range - a range
   */
  static *getPartiallyContainedNodes(range: RangeInternal): IterableIterator<Node> {
    const container = range.commonAncestorContainer

    for (const node of TreeQuery.getDescendantNodes(container)) {
      if (RangeQuery.isPartiallyContained(range, node)) {
        yield node
      }
    }
  }

  /**
   * Determines whether the given node is contained in the range.
   * 
   * A node is contained in a live range if node's root is range's 
   * root, and (node, 0) is after range's start, and (node, node's length)
   * is before range's end.
   * 
   * @param range - a range
   * @param node - the node to check
   */
  static isContained(range: RangeInternal, node: Node): boolean {
    const root = range._root

    const start: BoundaryPoint = range._start
    const end: BoundaryPoint = range._end

    if (root === TreeQuery.rootNode(node)) {
      const nodeStart = BPUtil.nodeStart(node)
      const nodeEnd = BPUtil.nodeEnd(node)
      if (BPUtil.position(nodeStart, start) === BoundaryPosition.After &&
        BPUtil.position(nodeEnd, end) === BoundaryPosition.Before) {
        return true
      }
    }

    return false
  }

  /**
   * Determines whether the given node is partially contained in the range.
   * 
   * A node is partially contained in a live range if it is an inclusive
   * ancestor of the live range's start node but not its end node, or
   * vice versa.
   * 
   * @param range - a range
   * @param node - the node to check
   */
  static isPartiallyContained(range: RangeInternal, node: Node): boolean {
    const startCheck = TreeQuery.isAncestorOf(range.startContainer, node, true)
    const endCheck = TreeQuery.isAncestorOf(range.endContainer, node, true)

    return (startCheck && !endCheck) || (!startCheck && endCheck)
  }

  /**
   * EXtracts the contents of range as a document fragment.
   * 
   * @param range - a range
   */
  static extractContents(range: RangeInternal): DocumentFragment {
    const fragment = new DocumentFragmentImpl((range._root as NodeInternal)._nodeDocument)

    if (range.collapsed) {
      return fragment
    }

    const [originalStartNode, originalStartOffset] = range._start
    const [originalEndNode, originalEndOffset] = range._end

    // range starts and ends over a single node
    if (originalStartNode === originalEndNode &&
      Guard.isCharacterDataNode(originalStartNode)) {
      const clone = <CharacterData>originalStartNode.cloneNode()
      clone.data = TextUtility.substringData(
        originalStartNode, originalStartOffset,
        originalEndOffset - originalStartOffset)
      fragment.append(clone)
      TextUtility.replaceData(
        originalStartNode, originalStartOffset,
        originalEndOffset - originalStartOffset, '')
      return fragment
    }

    let commonAncestor = originalStartNode
    while (!TreeQuery.isAncestorOf(originalEndNode, commonAncestor, true)) {
      if (commonAncestor.parentNode === null) {
        throw new Error("Parent node is null.")
      }
      commonAncestor = commonAncestor.parentNode
    }

    let firstPartiallyContainedChild: Node | null = null
    if (!TreeQuery.isAncestorOf(originalEndNode, originalStartNode, true)) {
      for (const node of commonAncestor.childNodes) {
        if (RangeQuery.isPartiallyContained(range, node)) {
          firstPartiallyContainedChild = node
          break
        }
      }
    }

    let lastPartiallyContainedChild: Node | null = null
    if (!TreeQuery.isAncestorOf(originalStartNode, originalEndNode, true)) {
      let i = commonAncestor.childNodes.length - 1
      for (let i = commonAncestor.childNodes.length - 1; i > 0; i--) {
        const node = commonAncestor.childNodes.item(i)
        if (node === null) {
          throw new Error("Child node is null.")
        }
        if (RangeQuery.isPartiallyContained(range, node)) {
          lastPartiallyContainedChild = node
          break
        }
      }
    }

    const containedChildren: Node[] = []
    for (const child of commonAncestor.childNodes) {
      if (RangeQuery.isContained(range, child)) {
        if (child.nodeType === NodeType.DocumentType) {
          throw DOMException.HierarchyRequestError
        }
        containedChildren.push(child)
      }
    }

    if (firstPartiallyContainedChild !== null &&
      Guard.isCharacterDataNode(firstPartiallyContainedChild)) {
      const clone = <CharacterData>originalStartNode.cloneNode()
      clone.data = TextUtility.substringData(
        <CharacterData>originalStartNode, originalStartOffset,
        TreeQuery.nodeLength(originalStartNode) - originalStartOffset)
      fragment.append(clone)
    } else if (firstPartiallyContainedChild !== null) {
      const clone = originalStartNode.cloneNode()
      fragment.append(clone)
      const subrange = new RangeImpl([originalStartNode, originalStartOffset],
        [firstPartiallyContainedChild, TreeQuery.nodeLength(firstPartiallyContainedChild)])
      const subfragment = RangeQuery.cloneContents(subrange)
      clone.appendChild(subfragment)
    }

    for (const child of containedChildren) {
      const clone = child.cloneNode(true)
      fragment.appendChild(clone)
    }

    if (lastPartiallyContainedChild !== null &&
      Guard.isCharacterDataNode(lastPartiallyContainedChild)) {
      const clone = <CharacterData>originalEndNode.cloneNode()
      clone.data = TextUtility.substringData(
        <CharacterData>originalEndNode, 0, originalEndOffset)
      fragment.append(clone)
    } else if (lastPartiallyContainedChild !== null) {
      const clone = lastPartiallyContainedChild.cloneNode()
      fragment.append(clone)
      const subrange = new RangeImpl([lastPartiallyContainedChild, 0],
        [originalEndNode, originalEndOffset])
      const subfragment = RangeQuery.cloneContents(subrange)
      clone.appendChild(subfragment)
    }

    return fragment
  }

  /**
   * Clones the contents of range as a document fragment.
   * 
   * @param range - a range
   */
  static cloneContents(range: RangeInternal): DocumentFragment {
    const fragment = new DocumentFragmentImpl((range._root as NodeInternal)._nodeDocument)

    if (range.collapsed) {
      return fragment
    }

    const [originalStartNode, originalStartOffset] = range._start
    const [originalEndNode, originalEndOffset] = range._end

    // range starts and ends over a single node
    if (originalStartNode === originalEndNode &&
      Guard.isCharacterDataNode(originalStartNode)) {
      const clone = <CharacterData>originalStartNode.cloneNode()
      clone.data = TextUtility.substringData(
        originalStartNode, originalStartOffset,
        originalEndOffset - originalStartOffset)
      fragment.append(clone)
      return fragment
    }

    let commonAncestor = originalStartNode
    while (!TreeQuery.isAncestorOf(originalEndNode, commonAncestor, true)) {
      if (commonAncestor.parentNode === null) {
        throw new Error("Parent node is null.")
      }
      commonAncestor = commonAncestor.parentNode
    }

    let firstPartiallyContainedChild: Node | null = null
    if (!TreeQuery.isAncestorOf(originalEndNode, originalStartNode, true)) {
      for (const node of commonAncestor.childNodes) {
        if (RangeQuery.isPartiallyContained(range, node)) {
          firstPartiallyContainedChild = node
          break
        }
      }
    }

    let lastPartiallyContainedChild: Node | null = null
    if (!TreeQuery.isAncestorOf(originalStartNode, originalEndNode, true)) {
      let i = commonAncestor.childNodes.length - 1
      for (let i = commonAncestor.childNodes.length - 1; i > 0; i--) {
        const node = commonAncestor.childNodes.item(i)
        if (node === null) {
          throw new Error("Child node is null.")
        }
        if (RangeQuery.isPartiallyContained(range, node)) {
          lastPartiallyContainedChild = node
          break
        }
      }
    }

    const containedChildren: Node[] = []
    for (const child of commonAncestor.childNodes) {
      if (RangeQuery.isContained(range, child)) {
        if (child.nodeType === NodeType.DocumentType) {
          throw DOMException.HierarchyRequestError
        }
        containedChildren.push(child)
      }
    }

    if (firstPartiallyContainedChild !== null &&
      Guard.isCharacterDataNode(firstPartiallyContainedChild)) {
      const clone = <CharacterData>originalStartNode.cloneNode()
      clone.data = TextUtility.substringData(
        <CharacterData>originalStartNode, originalStartOffset,
        TreeQuery.nodeLength(originalStartNode) - originalStartOffset)
      fragment.append(clone)
    } else if (firstPartiallyContainedChild !== null) {
      const clone = originalStartNode.cloneNode()
      fragment.append(clone)
      const subrange = new RangeImpl([originalStartNode, originalStartOffset],
        [firstPartiallyContainedChild, TreeQuery.nodeLength(firstPartiallyContainedChild)])
      const subfragment = RangeQuery.cloneContents(subrange)
      clone.appendChild(subfragment)
    }

    for (const child of containedChildren) {
      const clone = child.cloneNode(true)
      fragment.appendChild(clone)
    }

    if (lastPartiallyContainedChild !== null &&
      Guard.isCharacterDataNode(lastPartiallyContainedChild)) {
      const clone = <CharacterData>originalEndNode.cloneNode()
      clone.data = TextUtility.substringData(
        <CharacterData>originalEndNode, 0, originalEndOffset)
      fragment.append(clone)
    } else if (lastPartiallyContainedChild !== null) {
      const clone = lastPartiallyContainedChild.cloneNode()
      fragment.append(clone)
      const subrange = new RangeImpl([lastPartiallyContainedChild, 0],
        [originalEndNode, originalEndOffset])
      const subfragment = RangeQuery.cloneContents(subrange)
      clone.appendChild(subfragment)
    }

    return fragment
  }

  /**
   * Inserts a node into a range at the start boundary point.
   * 
   * @param range - a range
   * @param node - node to insert
   */
  static insert(range: RangeInternal, node: Node): void {
    const start: BoundaryPoint = range._start
    const end: BoundaryPoint = range._end

    if (start[0].nodeType === NodeType.ProcessingInstruction ||
      start[0].nodeType === NodeType.Comment ||
      (start[0].nodeType === NodeType.Text &&
        (node.parentNode === null || node.parentNode === node))) {
      throw DOMException.HierarchyRequestError
    }

    let referenceNode: Node | null = null
    if (start[0].nodeType === NodeType.Text) {
      referenceNode = start[0]
    } else {
      let index = 0
      for (const child of start[0].childNodes) {
        if (index === start[1]) {
          referenceNode = child
          break
        }
        index++
      }
    }

    let parent: Node
    if (referenceNode === null) {
      parent = start[0]
    } else {
      if (referenceNode.parentNode === null) {
        throw new Error("Parent node is null.")
      }
      parent = referenceNode.parentNode
    }

    TreeMutation.ensurePreInsertionValidity(node, parent, referenceNode)

    if (Guard.isTextNode(start[0])) {
      referenceNode = TextUtility.splitText(start[0], start[1])
    }

    if (node === referenceNode) {
      referenceNode = node.nextSibling
    }

    if (node.parentNode !== null) {
      TreeMutation.removeNode(node, parent)
    }

    let newOffset = referenceNode === null ? TreeQuery.nodeLength(parent) : TreeQuery.index(referenceNode)
    if (node.nodeType === NodeType.DocumentFragment) {
      newOffset += TreeQuery.nodeLength(node)
    } else {
      newOffset++
    }

    TreeMutation.preInsert(node, parent, referenceNode)

    if (range.collapsed) {
      range._end = [parent, newOffset]
    }
  }

  /**
   * Returns the concatenation of all text nodes contained in the range.
   * 
   * @param range - a range
   */
  static stringify(range: RangeInternal): string {
    const start: BoundaryPoint = range._start
    const end: BoundaryPoint = range._end

    if (start[0] === end[0] && Guard.isTextNode(start[0])) {
      return start[0].data.substring(start[1], end[1])
    }

    let s = ''
    if (Guard.isTextNode(start[0])) {
      s += start[0].data.substring(start[1])
    }

    for (const child of RangeQuery.getContainedNodes(range)) {
      if (Guard.isTextNode(child)) {
        s += child.data
      }
    }

    if (Guard.isTextNode(end[0])) {
      s += end[0].data.substring(0, end[1])
    }

    return s
  }

  /**
   * Removes a range object from the given document.
   * 
   * @param doc - owner document
   * @param range - the range to remove
   */
  static removeRange(doc: DocumentInternal, range: RangeInternal): void {
    const index = doc._rangeList.indexOf(range)
    if (index > -1) {
      doc._rangeList.splice(index, 1)
    }
  }
}
