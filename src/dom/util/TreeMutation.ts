import {
  NodeType, Node, Element, RegisteredObserver,
  MutationObserver, MutationRecord, Document
} from "../interfaces"
import { DOMException } from "../DOMException"
import { List } from "./List"
import { TreeQuery } from "./TreeQuery"
import { TextUtility } from "./TextUtility"
import { NodeListStaticImpl } from "../NodeListStaticImpl"
import {
  NodeInternal, DocumentInternal, RangeInternal,
  MutationObserverInternal, AttrInternal
} from "../interfacesInternal"
import { Guard } from "./Guard"

/**
 * Contains tree mutation algorithms.
 */
export class TreeMutation {
  /**
   * Ensures pre-insertion validity of a node into a parent before a
   * child.
   * 
   * @param node - node to insert
   * @param parent - parent node to receive node
   * @param child - child node to insert node before
   */
  static ensurePreInsertionValidity(node: Node, parent: Node, child: Node | null): void {
    // Only document, document fragment and element nodes can have
    // child nodes
    if (parent.nodeType !== NodeType.Document &&
      parent.nodeType !== NodeType.DocumentFragment &&
      parent.nodeType !== NodeType.Element)
      throw DOMException.HierarchyRequestError

    // node should not be an ancestor of parent
    if (TreeQuery.isAncestorOf(parent, node, true, true))
      throw DOMException.HierarchyRequestError

    // insertion reference child node should be a child node of
    // parent
    if (child && child.parentNode !== parent)
      throw DOMException.NotFoundError

    // only document fragment, document type, element, text,
    // processing instruction or comment nodes can be child nodes
    if (node.nodeType !== NodeType.DocumentFragment &&
      node.nodeType !== NodeType.DocumentType &&
      node.nodeType !== NodeType.Element &&
      node.nodeType !== NodeType.Text &&
      node.nodeType !== NodeType.ProcessingInstruction &&
      node.nodeType !== NodeType.CData &&
      node.nodeType !== NodeType.Comment)
      throw DOMException.HierarchyRequestError

    // a document node cannot have text child nodes
    if (node.nodeType === NodeType.Text &&
      parent.nodeType === NodeType.Document)
      throw DOMException.HierarchyRequestError

    // a document type node can only be parented to a document
    // node
    if (node.nodeType === NodeType.DocumentType &&
      parent.nodeType !== NodeType.Document)
      throw DOMException.HierarchyRequestError

    if (parent.nodeType === NodeType.Document) {
      if (node.nodeType === NodeType.DocumentFragment) {
        let eleCount = 0
        for (const childNode of node.childNodes) {
          if (childNode.nodeType === NodeType.Element)
            eleCount++
          else if (childNode.nodeType === NodeType.Text)
            throw DOMException.HierarchyRequestError

          if (eleCount > 1)
            throw DOMException.HierarchyRequestError
        }

        if (eleCount === 1) {
          for (const ele of parent.childNodes) {
            if (ele.nodeType === NodeType.Element)
              throw DOMException.HierarchyRequestError
          }

          if (child) {
            if (child.nodeType === NodeType.DocumentType)
              throw DOMException.HierarchyRequestError

            let doctypeChild = child.nextSibling
            while (doctypeChild) {
              if (doctypeChild.nodeType === NodeType.DocumentType)
                throw DOMException.HierarchyRequestError
              doctypeChild = doctypeChild.nextSibling
            }
          }
        }
      } else if (node.nodeType === NodeType.Element) {
        for (const ele of parent.childNodes) {
          if (ele.nodeType === NodeType.Element)
            throw DOMException.HierarchyRequestError
        }

        if (child) {
          if (child.nodeType === NodeType.DocumentType)
            throw DOMException.HierarchyRequestError

          let doctypeChild = child.nextSibling
          while (doctypeChild) {
            if (doctypeChild.nodeType === NodeType.DocumentType)
              throw DOMException.HierarchyRequestError
            doctypeChild = doctypeChild.nextSibling
          }
        }
      } else if (node.nodeType === NodeType.DocumentType) {
        for (const ele of parent.childNodes) {
          if (ele.nodeType === NodeType.DocumentType)
            throw DOMException.HierarchyRequestError
        }

        if (child) {
          let elementChild = child.previousSibling
          while (elementChild) {
            if (elementChild.nodeType === NodeType.Element)
              throw DOMException.HierarchyRequestError
            elementChild = elementChild.previousSibling
          }
        } else {
          let elementChild = parent.firstChild
          while (elementChild) {
            if (elementChild.nodeType === NodeType.Element)
              throw DOMException.HierarchyRequestError
            elementChild = elementChild.nextSibling
          }
        }
      }
    }
  }

  /**
   * Ensures pre-insertion validity of a node into a parent before a
   * child, then adopts the node to the tree and inserts it.
   * 
   * @param node - node to insert
   * @param parent - parent node to receive node
   * @param child - child node to insert node before
   */
  static preInsert(node: Node, parent: Node, child: Node | null): Node {
    TreeMutation.ensurePreInsertionValidity(node, parent, child)

    let referenceChild = child
    if (referenceChild === node)
      referenceChild = node.nextSibling

    TreeMutation.adoptNode(node, (parent as NodeInternal)._nodeDocument)
    TreeMutation.insertNode(node, parent, referenceChild)

    return node
  }

  /**
   * Removes `node` and its subtree from its document and changes
   * its owner document to `document` so that it can be inserted
   * into `document`.
   * 
   * @param node - the node to move
   * @param document - document to receive the node and its subtree
   */
  static adoptNode(node: Node, document: Document): void {
    const oldDocument = (node as NodeInternal)._nodeDocument

    if (node.parentNode)
      TreeMutation.removeNode(node, node.parentNode)

    if (document !== oldDocument) {
      for (const inclusiveDescendant of TreeQuery.getDescendantNodes(node, true, true)) {
        (inclusiveDescendant as NodeInternal)._nodeDocument = document as DocumentInternal

        if (inclusiveDescendant.nodeType === NodeType.Element) {
          const ele = <Element>inclusiveDescendant
          for (const attr of ele.attributes) {
            (attr as AttrInternal)._nodeDocument = document as DocumentInternal
          }
        }

        /**
         * TODO: For each inclusiveDescendant in node's shadow - including 
         * inclusive descendants that is custom, enqueue a custom
         * element callback reaction with inclusiveDescendant, 
         * callback name "adoptedCallback", and an argument list 
         * containing oldDocument and document.
         */
      }
    }
  }

  /**
   * Inserts a node into a parent node before the given child node.
   * 
   * @param node - node to insert
   * @param parent - parent node to receive node
   * @param child - child node to insert node before
   * @param suppressObservers - whether to notify observers
   */
  static insertNode(node: Node, parent: Node, child: Node | null,
    suppressObservers?: boolean): void {

    const count = (node.nodeType === NodeType.DocumentFragment ?
      node.childNodes.length : 1)

    if (child !== null) {
      /**
       * 1. For each live range whose start node is parent and start 
       * offset is greater than child's index, increase its start 
       * offset by count.
       * 2. For each live range whose end node is parent and end 
       * offset is greater than child's index, increase its end 
       * offset by count.
       */
      const doc = (parent as NodeInternal)._nodeDocument
      const index = TreeQuery.index(child)
      for (const item of doc._rangeList) {
        const range = item as RangeInternal
        if (range._start[0] === parent && range._start[1] > index) {
          range._start[1] += count
        }
        if (range._end[0] === parent && range._end[1] > index) {
          range._end[1] += count
        }
      }
    }

    const nodes: Node[] = []
    if (node.nodeType === NodeType.DocumentFragment) {
      for (const childNode of node.childNodes) {
        nodes.push(childNode)
      }
      // remove child nodes
      while (node.firstChild) {
        TreeMutation.removeNode(node.firstChild, node, true)
      }
    } else {
      nodes.push(node)
    }

    TreeMutation.queueTreeMutationRecord(node, [], nodes, null, null)

    const previousSibling = (child ? child.previousSibling : parent.lastChild)

    for (const node of nodes) {
      if (!child)
        List.append(node, parent)
      else
        List.insert(node, parent, child)

      /**
       * TODO: If parent is a shadow host and node is a slotable, then 
       * assign a slot for node.
       */

      /**
       * If node is a Text node, run the child text content change 
       * steps for parent.
       */
      if (Guard.isTextNode(node)) {
        TextUtility.childTextContentChanged(parent)
      }
      /**
       * TODO: If parent's root is a shadow root, and parent is a slot 
       * whose assigned nodes is the empty list, then run signal
       * a slot change for parent.
       * 
       * Run assign slotables for a tree with node's root.
       * 
       * For each shadow-including inclusive descendant 
       * inclusiveDescendant of node, in shadow-including tree
       * order:
       * 
       * 1. Run the insertion steps with inclusiveDescendant.
       * 2. If inclusiveDescendant is connected, then:
       *    - If inclusiveDescendant is custom, then enqueue a
       *      custom element callback reaction with
       *      inclusiveDescendant, callback name "connectedCallback",
       *      and an empty argument list.
       *    - Otherwise, try to upgrade inclusiveDescendant.
       */
    }

    TreeMutation.queueTreeMutationRecord(parent, nodes, [], previousSibling, child)
  }

  /**
   * Appends a node into a parent node.
   * 
   * @param node - node to insert
   * @param parent - parent node to receive node
   */
  static appendNode(node: Node, parent: Node): Node {
    return TreeMutation.preInsert(node, parent, null)
  }

  /**
   * Replaces a node with another node.
   * 
   * @param child - child node to remove
   * @param node - node to insert
   * @param parent - parent node to receive node
   */
  static replaceNode(child: Node, node: Node, parent: Node): Node {
    // Only document, document fragment and element nodes can have
    // child nodes
    if (parent.nodeType !== NodeType.Document &&
      parent.nodeType !== NodeType.DocumentFragment &&
      parent.nodeType !== NodeType.Element)
      throw DOMException.HierarchyRequestError

    // node should not be an ancestor of parent
    if (TreeQuery.isAncestorOf(parent, node, true, true))
      throw DOMException.HierarchyRequestError

    // removed child node should be a child node of parent
    if (child.parentNode !== parent)
      throw DOMException.NotFoundError

    // only document fragment, document type, element, text,
    // processing instruction or comment nodes can be child nodes
    if (node.nodeType !== NodeType.DocumentFragment &&
      node.nodeType !== NodeType.DocumentType &&
      node.nodeType !== NodeType.Element &&
      node.nodeType !== NodeType.Text &&
      node.nodeType !== NodeType.ProcessingInstruction &&
      node.nodeType !== NodeType.CData &&
      node.nodeType !== NodeType.Comment)
      throw DOMException.HierarchyRequestError

    // a document node cannot have text child nodes
    if (node.nodeType === NodeType.Text &&
      parent.nodeType === NodeType.Document)
      throw DOMException.HierarchyRequestError

    // a document type node can only be parented to a document
    // node
    if (node.nodeType === NodeType.DocumentType &&
      parent.nodeType !== NodeType.Document)
      throw DOMException.HierarchyRequestError

    if (parent.nodeType === NodeType.Document) {
      if (node.nodeType === NodeType.DocumentFragment) {
        let eleCount = 0
        for (const childNode of node.childNodes) {
          if (childNode.nodeType === NodeType.Element)
            eleCount++
          else if (childNode.nodeType === NodeType.Text)
            throw DOMException.HierarchyRequestError

          if (eleCount > 1)
            throw DOMException.HierarchyRequestError
        }

        if (eleCount === 1) {
          for (const ele of parent.childNodes) {
            if (ele.nodeType === NodeType.Element && ele !== child)
              throw DOMException.HierarchyRequestError
          }

          let doctypeChild = child.nextSibling
          while (doctypeChild) {
            if (doctypeChild.nodeType === NodeType.DocumentType)
              throw DOMException.HierarchyRequestError
            doctypeChild = doctypeChild.nextSibling
          }
        }
      } else if (node.nodeType === NodeType.Element) {
        for (const ele of parent.childNodes) {
          if (ele.nodeType === NodeType.Element && ele !== child)
            throw DOMException.HierarchyRequestError
        }

        let doctypeChild = child.nextSibling
        while (doctypeChild) {
          if (doctypeChild.nodeType === NodeType.DocumentType)
            throw DOMException.HierarchyRequestError
          doctypeChild = doctypeChild.nextSibling
        }
      } else if (node.nodeType === NodeType.DocumentType) {
        for (const ele of parent.childNodes) {
          if (ele.nodeType === NodeType.DocumentType && ele !== child)
            throw DOMException.HierarchyRequestError
        }

        let elementChild = child.previousSibling
        while (elementChild) {
          if (elementChild.nodeType === NodeType.Element)
            throw DOMException.HierarchyRequestError
          elementChild = elementChild.previousSibling
        }
      }
    }

    let referenceChild = child.nextSibling
    if (referenceChild === node) referenceChild = node.nextSibling
    let previousSibling = child.previousSibling

    TreeMutation.adoptNode(node, (parent as NodeInternal)._nodeDocument)

    const removedNodes: Node[] = []

    if (child.parentNode) {
      removedNodes.push(child)
      TreeMutation.removeNode(child, parent, true)
    }

    const nodes: Node[] = []
    if (node.nodeType === NodeType.DocumentFragment) {
      for (const childNode of node.childNodes) {
        nodes.push(childNode)
      }
    } else {
      nodes.push(node)
    }

    TreeMutation.insertNode(node, parent, referenceChild, true)

    TreeMutation.queueTreeMutationRecord(parent, nodes, removedNodes, previousSibling, referenceChild)

    return child
  }

  /**
   * Replaces all nodes of a parent with the given node.
   * 
   * @param node - node to insert
   * @param parent - parent node to receive node
   */
  static replaceAllNode(node: Node | null, parent: Node): void {
    if (node) {
      TreeMutation.adoptNode(node, (parent as NodeInternal)._nodeDocument)
    }

    const removedNodes: Node[] = []
    for (const childNode of parent.childNodes) {
      removedNodes.push(childNode)
    }

    const addedNodes: Node[] = []
    if (node && node.nodeType === NodeType.DocumentFragment) {
      for (const childNode of node.childNodes) {
        addedNodes.push(childNode)
      }
    } else if (node) {
      addedNodes.push(node)
    }

    for (const childNode of removedNodes) {
      TreeMutation.removeNode(childNode, parent, true)
    }

    if (node) {
      TreeMutation.insertNode(node, parent, null, true)
    }

    TreeMutation.queueTreeMutationRecord(parent, addedNodes, removedNodes, null, null)
  }

  /**
   * Ensures pre-removal validity of a node from a parent, then
   * removes it.
   * 
   * @param node - node to remove
   * @param parent - parent node
   */
  static preRemoveNode(node: Node, parent: Node): Node {
    if (node.parentNode !== parent)
      throw DOMException.NotFoundError

    TreeMutation.removeNode(node, parent)

    return node
  }

  /**
   * Removes a child node from its parent.
   * 
   * @param node - node to remove
   * @param parent - parent node
   * @param suppressObservers - whether to notify observers
   */
  static removeNode(node: Node, parent: Node, suppressObservers?: boolean): void {
    /**
     * For each live range whose start node is an inclusive
     * descendant of node, set its start to (parent, index).
     * 
     * For each live range whose end node is an inclusive descendant
     * of node, set its end to (parent, index).
     * 
     * For each live range whose start node is parent and start 
     * offset is greater than index, decrease its start offset by 1.
     * 
     * For each live range whose end node is parent and end offset 
     * is greater than index, decrease its end offset by 1.
     */
    const index = TreeQuery.index(node)
    const doc = (parent as NodeInternal)._nodeDocument as DocumentInternal
    for (const item of doc._rangeList) {
      const range = item as RangeInternal
      if (TreeQuery.isDescendantOf(node, range._start[0], true)) {
        range._start = [parent, index]
      }
      if (TreeQuery.isDescendantOf(node, range._end[0], true)) {
        range._end = [parent, index]
      }
      if (range._start[0] === parent && range._start[1] > index) {
        range._start[1]--
      }
      if (range._end[0] === parent && range._end[1] > index) {
        range._end[1]--
      }
    }
    /**
     * TODO: For each NodeIterator object iterator whose root's node 
     * document is node's node document, run the NodeIterator 
     * pre-removing steps given node and iterator.
     */

    const oldPreviousSibling = node.previousSibling
    const oldNextSibling = node.nextSibling

    List.remove(node, parent)

    /**
     * TODO: If node is assigned, then run assign slotables for node's 
     * assigned slot.
     *
     * If parent's root is a shadow root, and parent is a slot whose
     * assigned nodes is the empty list, then run signal a slot 
     * change for parent.
     * 
     * If node has an inclusive descendant that is a slot, then:
     *   1. Run assign slotables for a tree with parent's root.
     *   2. Run assign slotables for a tree with node.
     * 
     * Run the removing steps with node and parent.
     * 
     * If node is custom, then enqueue a custom element callback 
     * reaction with node, callback name "disconnectedCallback", 
     * and an empty argument list.
     * 
     * For each shadow-including descendant descendant of node, 
     * in shadow-including tree order, then:
     *   1. Run the removing steps with descendant.
     *   2. If descendant is custom, then enqueue a custom element 
     *      callback reaction with descendant, callback name 
     *      "disconnectedCallback", and an empty argument list.
     * 
     * For each inclusive ancestor inclusiveAncestor of parent, and 
     * then for each registered of inclusiveAncestor's registered 
     * observer list, if registered's options's subtree is true, 
     * then append a new transient registered observer whose 
     * observer is registered's observer, options is registered's 
     * options, and source is registered to node's registered
     * observer list.
     */

    TreeMutation.queueTreeMutationRecord(parent, [], [node],
      oldPreviousSibling, oldNextSibling)

    if (Guard.isTextNode(node)) {
      TextUtility.childTextContentChanged(parent)
    }
  }

  /**
   * Queues a mutation record of the given type for target.
   * 
   * @param type - mutation record type
   * @param target - target node
   * @param name - name before mutation
   * @param namespace - namespace before mutation
   * @param oldValue - attribute value before mutation
   * @param addedNodes - a list od added nodes
   * @param removedNodes - a list of removed nodes
   * @param previousSibling - previous sibling of target before mutation
   * @param nextSibling - next sibling of target before mutation
   */
  static queueMutationRecord(type: string, target: Node, name: string | null,
    namespace: string | null, oldValue: string | null,
    addedNodes: Node[], removedNodes: Node[],
    previousSibling: Node | null, nextSibling: Node | null): void {

    const interestedObservers = new Map<MutationObserver, string | null>()
    for (const node of TreeQuery.getAncestorNodes(target, true)) {
      const observers: Array<RegisteredObserver> =
        (<NodeInternal>target)._registeredObserverList
      for (const registered of observers) {
        const options = registered.options

        if (node !== target && !options.subtree) continue
        if (type === "attributes" && !options.attributes) continue
        if (type === "attributes" && options.attributeFilter &&
          (!options.attributeFilter.includes(name || '') || namespace !== null)) continue
        if (type === "characterData" && !options.characterData) continue
        if (type === "childList" && !options.childList) continue

        const mo = registered.observer
        if (!interestedObservers.has(mo)) {
          interestedObservers.set(mo, null)
        }
        if ((type === "attributes" && options.attributeOldValue) || (type === "characterData" && options.characterDataOldValue)) {
          interestedObservers.set(mo, oldValue)
        }
      }
    }
    for (const [observer, mappedOldValue] of interestedObservers) {
      const record: MutationRecord = {
        type: type,
        target: target,
        attributeName: name,
        attributeNamespace: namespace,
        oldValue: mappedOldValue,
        addedNodes: new NodeListStaticImpl(addedNodes),
        removedNodes: new NodeListStaticImpl(removedNodes),
        previousSibling: previousSibling,
        nextSibling: nextSibling
      }

      const queue: MutationRecord[] = (observer as MutationObserverInternal)._recordQueue
      queue.push(record)
    }

    // TODO: Queue a mutation observer microtask.
    // See: https://dom.spec.whatwg.org/#queue-a-mutation-observer-compound-microtask
  }

  /**
   * Queues a tree mutation record for target.
   * 
   * @param target - target node
   * @param addedNodes - a list od added nodes
   * @param removedNodes - a list of removed nodes
   * @param previousSibling - previous sibling of target before mutation
   * @param nextSibling - next sibling of target before mutation
   */
  static queueTreeMutationRecord(target: Node,
    addedNodes: Node[], removedNodes: Node[],
    previousSibling: Node | null, nextSibling: Node | null): void {

    TreeMutation.queueMutationRecord("childList", target, null, null, null,
      addedNodes, removedNodes, previousSibling, nextSibling)
  }

  /**
   * Queues an attribute mutation record for target.
   * 
   * @param target - target node
   * @param name - name before mutation
   * @param namespace - namespace before mutation
   * @param oldValue - attribute value before mutation
   */
  static queueAttributeMutationRecord(target: Node, name: string | null,
    namespace: string | null, oldValue: string | null): void {

    TreeMutation.queueMutationRecord("attributes", target, name, namespace,
      oldValue, [], [], null, null)
  }

}
