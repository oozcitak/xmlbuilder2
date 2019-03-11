import { NodeType, Node, Document, Element } from "../interfaces";
import { DOMException } from "..";
import { List } from "./List";
import { TreeQuery } from "./TreeQuery";

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
    if (TreeQuery.isAncestorOf(parent, node, { self: true, shadow: true }))
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
        if (node.childNodes.length > 1)
          throw DOMException.HierarchyRequestError
        else if (node.firstChild && node.firstChild.nodeType === NodeType.Text)
          throw DOMException.HierarchyRequestError
        else if (node.firstChild) {
          for (let ele of parent.childNodes) {
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
        for (let ele of parent.childNodes) {
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
        for (let ele of parent.childNodes) {
          if (ele.nodeType === NodeType.DocumentType)
            throw DOMException.HierarchyRequestError
        }

        if (child) {
          let elementChild = child.nextSibling
          while (elementChild) {
            if (elementChild.nodeType === NodeType.Element)
              throw DOMException.HierarchyRequestError
            elementChild = elementChild.nextSibling
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
    if (!parent.ownerDocument)
      throw DOMException.HierarchyRequestError

    let referenceChild = child
    if (referenceChild === node)
      referenceChild = node.nextSibling

    TreeMutation.adoptNode(node, parent.ownerDocument)
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
    let oldDocument = node.ownerDocument

    if (node.parentNode)
      TreeMutation.removeNode(node, node.parentNode)

    if (document !== oldDocument) {
      for (const inclusiveDescendant of TreeQuery.getDescendantNodes(node, true, true)) {
        (<any>inclusiveDescendant)._ownerDocument = document

        if (inclusiveDescendant.nodeType === NodeType.Element) {
          let ele = <Element>inclusiveDescendant
          for (const attr of ele.attributes) {
            (<any>attr)._ownerDocument = document
          }
        }

        /**
         * TODO:
         * For each inclusiveDescendant in node's shadow - including 
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
   */
  static insertNode(node: Node, parent: Node, child: Node | null): void {
    let count = (node.nodeType === NodeType.DocumentFragment ?
      node.childNodes.length : 1)

    /**
     * TODO:
     * 1. If child is non-null, then:
     *    For each live range whose start node is parent and start 
     *    offset is greater than child's index, increase its start 
     *    offset by count.
     * 2. For each live range whose end node is parent and end 
     *    offset is greater than child's index, increase its end 
     *    offset by count.
     */

    let nodes: Node[] = []
    if (node.nodeType === NodeType.DocumentFragment) {
      for (let childNode of node.childNodes) {
        nodes.push(childNode)
      }
      // remove child nodes
      (<any>node)._firstChild = null
    } else {
      nodes.push(node)
    }

    /**
     * TODO:
     * If node is a DocumentFragment node, then queue a tree 
     * mutation record for node with [ ], nodes, null, and null.
     */

    let previousSibling = (child ? child.previousSibling : parent.lastChild)

    for (let node of nodes) {
      if (!child)
        List.append(node, parent)
      else
        List.insert(node, parent, child)

      /**
       * If parent is a shadow host and node is a slotable, then 
       * assign a slot for node.
       * 
       * If node is a Text node, run the child text content change 
       * steps for parent.
       * 
       * If parent's root is a shadow root, and parent is a slot 
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

    /**
     * TODO:
     * If suppress observers flag is unset, then queue a tree 
     * mutation record for parent with nodes, [ ], previousSibling,
     * and child.
     */
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
    if (TreeQuery.isAncestorOf(parent, node, { self: true, shadow: true }))
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
        if (node.childNodes.length > 1)
          throw DOMException.HierarchyRequestError
        else if (node.firstChild && node.firstChild.nodeType === NodeType.Text)
          throw DOMException.HierarchyRequestError
        else if (node.firstChild) {
          for (let ele of parent.childNodes) {
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
        for (let ele of parent.childNodes) {
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
        for (let ele of parent.childNodes) {
          if (ele.nodeType === NodeType.DocumentType && ele !== child)
            throw DOMException.HierarchyRequestError
        }

        let elementChild = child.nextSibling
        while (elementChild) {
          if (elementChild.nodeType === NodeType.Element)
            throw DOMException.HierarchyRequestError
          elementChild = elementChild.nextSibling
        }
      }
    }

    let referenceChild = child.nextSibling
    if (referenceChild === node) referenceChild = node.nextSibling
    let previousSibling = child.previousSibling

    if (!parent.ownerDocument)
      throw DOMException.HierarchyRequestError

    TreeMutation.adoptNode(node, parent.ownerDocument)

    let removedNodes: Node[] = []

    if (child.parentNode) {
      removedNodes.push(child)
      // TODO: Remove child from its parent with the suppress 
      // observers flag set.
      TreeMutation.removeNode(child, parent)
    }

    let nodes: Node[] = []
    if (node.nodeType === NodeType.DocumentFragment) {
      for (let childNode of node.childNodes) {
        nodes.push(childNode)
      }
    } else {
      nodes.push(node)
    }

    // TODO: Insert node into parent before reference child with
    // the suppress observers flag set.
    TreeMutation.insertNode(node, parent, referenceChild)

    // TODO: Queue a tree mutation record for parent with 
    // nodes, removedNodes, previousSibling, and reference child.

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
      if (!parent.ownerDocument)
        throw DOMException.HierarchyRequestError

      TreeMutation.adoptNode(node, parent.ownerDocument)
    }

    let removedNodes: Node[] = []
    for (let childNode of parent.childNodes) {
      removedNodes.push(childNode)
    }

    let addedNodes: Node[] = []
    if (node && node.nodeType === NodeType.DocumentFragment) {
      for (let childNode of node.childNodes) {
        addedNodes.push(childNode)
      }
    } else if (node) {
      addedNodes.push(node)
    }

    for (let childNode of removedNodes) {
      // TODO: Remove all parent's children, in tree order, 
      // with the suppress observers flag set.
      TreeMutation.removeNode(childNode, parent)
    }

    if (node) {
      // TODO: If node is not null, then insert node into parent
      // before null with the suppress observers flag set.
      TreeMutation.insertNode(node, parent, null)
    }

    // TODO: Queue a tree mutation record for parent with
    // addedNodes, removedNodes, null, and null.
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
   */
  static removeNode(node: Node, parent: Node): void {
    /**
     * TODO:
     * Let index be node's index.
     * 
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
     * 
     * For each NodeIterator object iterator whose root's node 
     * document is node's node document, run the NodeIterator 
     * pre-removing steps given node and iterator.
     * 
     * Let oldPreviousSibling be node's previous sibling.
     * 
     * Let oldNextSibling be node's next sibling.
     */

    List.remove(node, parent)

    /**
     * TODO:
     * If node is assigned, then run assign slotables for node's 
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
     * 
     * If suppress observers flag is unset, then queue a tree 
     * mutation record for parent with 
     * [ ], [ node ], oldPreviousSibling, and oldNextSibling.
     * 
     * If node is a Text node, then run the child text content 
     * change steps for parent.
     */
  }
}
