import { Node } from './Node'
import { DOMException } from './DOMException'
import { CharacterData } from './CharacterData'
import { ShadowRoot } from './ShadowRoot'
import { Document } from './Document'
import { DocumentFragment } from './DocumentFragment'
import { Text } from './Text'
import { Element } from './Element'

export class Utility {

  /**
   * Includes methods for ordered sets.
   */
  static OrderedSet = class {
    /**
     * RegExp to split attribute values at ASCII whitespace
     * https://infra.spec.whatwg.org/#ascii-whitespace
     * U+0009 TAB, U+000A LF, U+000C FF, U+000D CR, or U+0020 SPACE
     */
    static readonly WhiteSpace = /[\t\n\f\r ]/

    /**
     * Converts a whitespace separated string into an array of tokens.
     * 
     * @param value - a string of whitespace separated tokens
     */
    static parse(value: string): string[] {
      let arr = value.split(Utility.OrderedSet.WhiteSpace)

      // remove empty strings
      let filtered: string[] = []
      for (let str of arr)
        if (str) filtered.push(str)

      return filtered
    }

    /**
     * Converts an array of tokens into a space separated string.
     * 
     * @param tokens - an array of token strings
     */
    static serialize(tokens: string[]): string {
      return tokens.join(' ')
    }

    /**
     * Removes duplicate tokens and convert all whitespace characters
     * to space.
     * 
     * @param value - a string of whitespace separated tokens
     */
    static sanitize(value: string): string {
      return Utility.OrderedSet.serialize(Utility.OrderedSet.parse(value))
    }
  }

  /**
   * Includes methods for trees.
   * A tree is a finite hierarchical tree structure.
   */
  static Tree = class {
    /**
     * Applies the given function to all descendant nodes of the given
     * node, optionaly including shadow trees. In tree order is 
     * preorder, depth-first traversal of a tree.
     * 
     * @param node - the node whose descendants will be traversed
     * @param options - an object to set traversal settings.
     * If `options.self` is truthy, traversal includes `node`
     * itself. If `options.shadow` is truthy, traversal includes the 
     * node's and its descendant's shadow trees as well.
     * @param func - the function to apply to the descendant nodes. The
     * function receives each descendant node as an argument and should
     * return a value to stop iteration, or `undefined` to continue 
     * with the next descendant.
     * 
     * @returns the value returned from `func` or `shadowFunc` whichever
     * returns a value first.
     */
    static forEachDescendant(node: Node,
      options: { self?: boolean, shadow?: boolean } = { self: false, shadow: false },
      func: (childNode: Node) => any): any {
      // apply to node itself
      if (options && options.self) {
        let res = func(node)
        if (res !== undefined)
          return res
      }

      // traverse shadow tree
      if (options && options.shadow && node.nodeType === Node.Element) {
        let ele = <Element>node
        if (ele.shadowRoot) {
          for (let child of ele.shadowRoot.childNodes) {
            let res = func(child)
            if (res !== undefined) {
              return res
            } else {
              let res = Utility.Tree.forEachDescendant(child, options, func)
              if (res !== undefined) return res
            }
          }
        }
      }

      // traverse child nodes
      for (let child of node.childNodes) {
        let res = func(child)
        if (res !== undefined) {
          return res
        } else {
          let res = Utility.Tree.forEachDescendant(child, options, func)
          if (res !== undefined) return res
        }
      }
    }

    /**
     * Determines if the node tree is constrained. A node tree is 
     * constrained as follows, expressed as a relationship between the 
     * type of node and its allowed children:
     *  - Document (In tree order)
     *    * Zero or more nodes each of which is ProcessingInstruction 
     *      or Comment.
     *    * Optionally one DocumentType node.
     *    * Zero or more nodes each of which is ProcessingInstruction
     *      or Comment.
     *    * Optionally one Element node.
     *    * Zero or more nodes each of which is ProcessingInstruction
     *      or Comment.
     *  - DocumentFragment
     *  - Element
     *    * Zero or more nodes each of which is Element, Text, 
     *      ProcessingInstruction, or Comment.
     *  - DocumentType
     *  - Text
     *  - ProcessingInstruction
     *  - Comment
     *    * None.
     * 
     * @param node - the root of the tree
     */
    static isConstrained(node: Node): boolean {
      switch (node.nodeType) {
        case Node.Document:
          let hasDocType = false
          let hasElement = false
          for (let childNode of node.childNodes) {
            switch (childNode.nodeType) {
              case Node.ProcessingInstruction:
              case Node.Comment:
                break
              case Node.DocumentType:
                if (hasDocType || hasElement) return false
                hasDocType = true
                break
              case Node.Element:
                if (hasElement) return false
                hasElement = true
                break
              default:
                return false
            }
          }
          break
        case Node.DocumentFragment:
        case Node.Element:
          for (let childNode of node.childNodes) {
            switch (childNode.nodeType) {
              case Node.Element:
              case Node.Text:
              case Node.ProcessingInstruction:
              case Node.Comment:
                break
              default:
                return false
            }
          }
          break
        case Node.DocumentType:
        case Node.Text:
        case Node.ProcessingInstruction:
        case Node.Comment:
          return (!node.hasChildNodes())
      }

      return true
    }

    /**
     * Returns the length of a node.
     * 
     * @param node - a node to check
     */
    static nodeLength(node: Node): number {
      switch (node.nodeType) {
        case Node.DocumentType:
          return 0
        case Node.Text:
        case Node.ProcessingInstruction:
        case Node.Comment:
          return (<CharacterData>node).data.length
        default:
          return node.childNodes.length
      }
    }

    /**
     * Determines if a node is empty.
     * 
     * @param node - a node to check
     */
    static isEmpty(node: Node): boolean {
      return (Utility.Tree.nodeLength(node) === 0)
    }

    /**
     * Returns the root node of a tree. The root of an object is itself,
     * if its parent is `null`, or else it is the root of its parent. 
     * The root of a tree is any object participating in that tree 
     * whose parent is `null`.
     * 
     * @param node - a node of the tree
     */
    static rootNode(node: Node): Node {
      if (!node.parentNode)
        return node
      else
        return Utility.Tree.rootNode(node.parentNode)
    }

    /**
     * Determines whether `other` is a descendant of `node`. An object 
     * A is called a descendant of an object B, if either A is a child 
     * of B or A is a child of an object C that is a descendant of B.
     * 
     * @param node - a node
     * @param other - the node to check
     * @param options - an object to set traversal settings.
     * If `options.self` is truthy, traversal includes `node`
     * itself. If `options.shadow` is truthy, traversal includes the 
     * node's and its descendant's shadow trees as well.
     */
    static isDescendantOf(node: Node, other: Node,
      options: { self?: boolean, shadow?: boolean } = { self: false, shadow: false }
    ): boolean {

      if (options && options.self && node === other)
        return true

      for (let child of node.childNodes) {
        if (child === other)
          return true
        if (Utility.Tree.isDescendantOf(child, other, options))
          return true
      }

      return false
    }

    /**
     * Determines whether `other` is an ancestor of `node`. An object A 
     * is called an ancestor of an object B if and only if B is a 
     * descendant of A.
     * 
     * @param node - a node
     * @param other - the node to check
     * @param options - an object to set traversal settings.
     * If `options.self` is truthy, traversal includes `node`
     * itself. If `options.shadow` is truthy, traversal includes the 
     * node's and its descendant's shadow trees as well.
     */
    static isAncestorOf(node: Node, other: Node,
      options: { self?: boolean, shadow?: boolean } = { self: false, shadow: false }
    ): boolean {

      if (Utility.Tree.isDescendantOf(other, node, options))
        return true

      if (options && options.shadow) {
        let root = Utility.Tree.rootNode(node)
        if (root && root instanceof ShadowRoot) {
          let nodeHost = (<ShadowRoot>root).host
          return Utility.Tree.isAncestorOf(nodeHost, other, options)
        }
      }

      return false
    }

    /**
     * Determines whether `other` is a sibling of `node`. An object A is
     * called a sibling of an object B, if and only if B and A share 
     * the same non-null parent.
     * 
     * @param node - a node
     * @param other - the node to check
     * @param options - an object to set traversal settings.
     * If `options.self` is truthy, traversal includes `node`
     * itself. If `options.shadow` is truthy, traversal includes the 
     * node's and its descendant's shadow trees as well.
     */
    static isSiblingOf(node: Node, other: Node,
      options: { self?: boolean, shadow?: boolean } = { self: false, shadow: false }
    ): boolean {

      if (options && options.self && node === other)
        return true

      return (node.parentNode != null &&
        node.parentNode === other.parentNode)
    }

    /**
     * Determines whether `other` is preceding `node`. An object A is 
     * preceding an object B if A and B are in the same tree and A comes 
     * before B in tree order.
     * 
     * @param node - a node
     * @param other - the node to check
     */
    static isPreceding(node: Node, other: Node): boolean {
      let nodePos = Utility.Tree.treePosition(node)
      let otherPos = Utility.Tree.treePosition(other)

      if (nodePos === -1 || otherPos === -1)
        return false
      else if (Utility.Tree.rootNode(node) !== Utility.Tree.rootNode(other))
        return false
      else
        return otherPos < nodePos
    }

    /**
     * Determines whether `other` is following `node`. An object A is 
     * following an object B if A and B are in the same tree and A comes 
     * after B in tree order.
     * 
     * @param node - a node
     * @param other - the node to check
     */
    static isFollowing(node: Node, other: Node): boolean {
      let nodePos = Utility.Tree.treePosition(node)
      let otherPos = Utility.Tree.treePosition(other)

      if (nodePos === -1 || otherPos === -1)
        return false
      else if (Utility.Tree.rootNode(node) !== Utility.Tree.rootNode(other))
        return false
      else
        return otherPos > nodePos
    }

    /**
     * Returns the first child node of `node` or null if it has no
     * children.
     * 
     * @param node 
     */
    static firstChild(node: Node): Node | null {
      return node.firstChild
    }

    /**
     * Returns the last child node of `node` or null if it has no
     * children.
     * 
     * @param node 
     */
    static lastChild(node: Node): Node | null {
      return node.lastChild
    }

    /**
     * Returns the zero-based index of `node` when counted preorder in
     * the tree rooted at `root`. Returns `-1` if `node` is not in 
     * the tree.
     * 
     * @param node - the node to get the index of
     */
    private static treePosition(node: Node): number {
      let root = Utility.Tree.rootNode(node)
      if (root === null) return -1

      let pos = 0
      let found = false

      Utility.Tree.forEachDescendant(root, {}, function (childNode) {
        pos++
        if (!found && (childNode === node)) found = true
      })

      if (found)
        return pos
      else
        return -1
    }

    /**
     * Contains tree mutation algorithms.
     */
    static Mutation = class {
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
        if (parent.nodeType !== Node.Document &&
          parent.nodeType !== Node.DocumentFragment &&
          parent.nodeType !== Node.Element)
          throw DOMException.HierarchyRequestError

        // node should not be an ancestor of parent
        if (Utility.Tree.isAncestorOf(parent, node, { self: true, shadow: true }))
          throw DOMException.HierarchyRequestError

        // insertion reference child node should be a child node of
        // parent
        if (child && child.parentNode !== parent)
          throw DOMException.NotFoundError

        // only document fragment, document type, element, text,
        // processing instruction or comment nodes can be child nodes
        if (node.nodeType !== Node.DocumentFragment &&
          node.nodeType !== Node.DocumentType &&
          node.nodeType !== Node.Element &&
          node.nodeType !== Node.Text &&
          node.nodeType !== Node.ProcessingInstruction &&
          node.nodeType !== Node.Comment)
          throw DOMException.HierarchyRequestError

        // a document node cannot have text child nodes
        if (node.nodeType === Node.Text &&
          parent.nodeType === Node.Document)
          throw DOMException.HierarchyRequestError

        // a document type node can only be parented to a document
        // node
        if (node.nodeType === Node.DocumentType &&
          parent.nodeType !== Node.Document)
          throw DOMException.HierarchyRequestError

        if (parent.nodeType === Node.Document) {
          if (node.nodeType === Node.DocumentFragment) {
            if (node.childNodes.length > 1)
              throw DOMException.HierarchyRequestError
            else if (node.firstChild && node.firstChild.nodeType === Node.Text)
              throw DOMException.HierarchyRequestError
            else if (node.firstChild) {
              for (let ele of parent.childNodes) {
                if (ele.nodeType === Node.Element)
                  throw DOMException.HierarchyRequestError
              }

              if (child) {
                if (child.nodeType === Node.DocumentType)
                  throw DOMException.HierarchyRequestError

                let doctypeChild = child.nextSibling
                while (doctypeChild) {
                  if (doctypeChild.nodeType === Node.DocumentType)
                    throw DOMException.HierarchyRequestError
                  doctypeChild = doctypeChild.nextSibling
                }
              }
            }
          } else if (node.nodeType === Node.Element) {
            for (let ele of parent.childNodes) {
              if (ele.nodeType === Node.Element)
                throw DOMException.HierarchyRequestError
            }

            if (child) {
              if (child.nodeType === Node.DocumentType)
                throw DOMException.HierarchyRequestError

              let doctypeChild = child.nextSibling
              while (doctypeChild) {
                if (doctypeChild.nodeType === Node.DocumentType)
                  throw DOMException.HierarchyRequestError
                doctypeChild = doctypeChild.nextSibling
              }
            }
          } else if (node.nodeType === Node.DocumentType) {
            for (let ele of parent.childNodes) {
              if (ele.nodeType === Node.DocumentType)
                throw DOMException.HierarchyRequestError
            }

            if (child) {
              let elementChild = child.nextSibling
              while (elementChild) {
                if (elementChild.nodeType === Node.Element)
                  throw DOMException.HierarchyRequestError
                elementChild = elementChild.nextSibling
              }
            } else {
              let elementChild = parent.firstChild
              while (elementChild) {
                if (elementChild.nodeType === Node.Element)
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
        Utility.Tree.Mutation.ensurePreInsertionValidity(node, parent, child)
        if (!parent.ownerDocument)
          throw DOMException.HierarchyRequestError

        let referenceChild = child
        if (referenceChild === node)
          referenceChild = node.nextSibling

        Utility.Tree.Mutation.adoptNode(node, parent.ownerDocument)
        Utility.Tree.Mutation.insertNode(node, parent, referenceChild)

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
          Utility.Tree.Mutation.removeNode(node, node.parentNode)

        if (document !== oldDocument) {
          Utility.Tree.forEachDescendant(node, { self: true, shadow: true }, function (inclusiveDescendant: Node) {
            inclusiveDescendant._ownerDocument = document

            if (inclusiveDescendant.nodeType === Node.Element) {
              let ele = <Element>node
              for (let i = 0; i < ele.attributes.length; i++) {
                let attr = ele.attributes[i]
                attr._ownerDocument = document
              }
            }

            /**
             * TODO:
             * For each inclusiveDescendant in node’s shadow - including 
             * inclusive descendants that is custom, enqueue a custom
             * element callback reaction with inclusiveDescendant, 
             * callback name "adoptedCallback", and an argument list 
             * containing oldDocument and document.
             */

            Utility.Tree.Mutation.adoptNode(inclusiveDescendant, document)
          })
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
        let count = (node.nodeType === Node.DocumentFragment ?
          node.childNodes.length : 1)

        /**
         * TODO:
         * 1. If child is non-null, then:
         *    For each live range whose start node is parent and start 
         *    offset is greater than child’s index, increase its start 
         *    offset by count.
         * 2. For each live range whose end node is parent and end 
         *    offset is greater than child’s index, increase its end 
         *    offset by count.
         */

        let nodes: Node[] = []
        if (node.nodeType === Node.DocumentFragment) {
          for (let childNode of node.childNodes) {
            nodes.push(childNode)
            Utility.Tree.Mutation.removeNode(childNode, node)
          }
        } else {
          nodes.push(node)
        }

        /**
         * TODO:
         * If node is a DocumentFragment node, then queue a tree 
         * mutation record for node with « », nodes, null, and null.
         */

        let previousSibling = (child ? child.previousSibling : parent.lastChild)

        for (let node of nodes) {
          if (!child)
            Utility.NodeList.append(node, parent)
          else
            Utility.NodeList.insert(node, parent, child)

          /**
           * If parent is a shadow host and node is a slotable, then 
           * assign a slot for node.
           * 
           * If node is a Text node, run the child text content change 
           * steps for parent.
           * 
           * If parent’s root is a shadow root, and parent is a slot 
           * whose assigned nodes is the empty list, then run signal
           * a slot change for parent.
           * 
           * Run assign slotables for a tree with node’s root.
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
         * mutation record for parent with nodes, « », previousSibling,
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
        return Utility.Tree.Mutation.preInsert(node, parent, null)
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
        if (parent.nodeType !== Node.Document &&
          parent.nodeType !== Node.DocumentFragment &&
          parent.nodeType !== Node.Element)
          throw DOMException.HierarchyRequestError

        // node should not be an ancestor of parent
        if (Utility.Tree.isAncestorOf(parent, node, { self: true, shadow: true }))
          throw DOMException.HierarchyRequestError

        // removed child node should be a child node of parent
        if (child.parentNode !== parent)
          throw DOMException.NotFoundError

        // only document fragment, document type, element, text,
        // processing instruction or comment nodes can be child nodes
        if (node.nodeType !== Node.DocumentFragment &&
          node.nodeType !== Node.DocumentType &&
          node.nodeType !== Node.Element &&
          node.nodeType !== Node.Text &&
          node.nodeType !== Node.ProcessingInstruction &&
          node.nodeType !== Node.Comment)
          throw DOMException.HierarchyRequestError

        // a document node cannot have text child nodes
        if (node.nodeType === Node.Text &&
          parent.nodeType === Node.Document)
          throw DOMException.HierarchyRequestError

        // a document type node can only be parented to a document
        // node
        if (node.nodeType === Node.DocumentType &&
          parent.nodeType !== Node.Document)
          throw DOMException.HierarchyRequestError

        if (parent.nodeType === Node.Document) {
          if (node.nodeType === Node.DocumentFragment) {
            if (node.childNodes.length > 1)
              throw DOMException.HierarchyRequestError
            else if (node.firstChild && node.firstChild.nodeType === Node.Text)
              throw DOMException.HierarchyRequestError
            else if (node.firstChild) {
              for (let ele of parent.childNodes) {
                if (ele.nodeType === Node.Element && ele !== child)
                  throw DOMException.HierarchyRequestError
              }

              let doctypeChild = child.nextSibling
              while (doctypeChild) {
                if (doctypeChild.nodeType === Node.DocumentType)
                  throw DOMException.HierarchyRequestError
                doctypeChild = doctypeChild.nextSibling
              }
            }
          } else if (node.nodeType === Node.Element) {
            for (let ele of parent.childNodes) {
              if (ele.nodeType === Node.Element && ele !== child)
                throw DOMException.HierarchyRequestError
            }

            let doctypeChild = child.nextSibling
            while (doctypeChild) {
              if (doctypeChild.nodeType === Node.DocumentType)
                throw DOMException.HierarchyRequestError
              doctypeChild = doctypeChild.nextSibling
            }
          } else if (node.nodeType === Node.DocumentType) {
            for (let ele of parent.childNodes) {
              if (ele.nodeType === Node.DocumentType && ele !== child)
                throw DOMException.HierarchyRequestError
            }

            let elementChild = child.nextSibling
            while (elementChild) {
              if (elementChild.nodeType === Node.Element)
                throw DOMException.HierarchyRequestError
              elementChild = elementChild.nextSibling
            }
          }
        }

        let referenceChild = child.nextSibling
        if (referenceChild === node) referenceChild = node.nextSibling
        let previousSibling = child.previousSibling

        if(!parent.ownerDocument)
          throw DOMException.HierarchyRequestError

        Utility.Tree.Mutation.adoptNode(node, parent.ownerDocument)

        let removedNodes: Node[] = []

        if (child.parentNode) {
          removedNodes.push(child)
          // TODO: Remove child from its parent with the suppress 
          // observers flag set.
          Utility.Tree.Mutation.removeNode(child, parent)
        }

        let nodes: Node[] = []
        if (node.nodeType === Node.DocumentFragment) {
          for (let childNode of node.childNodes) {
            nodes.push(childNode)
          }
        } else {
          nodes.push(node)
        }

        // TODO: Insert node into parent before reference child with
        // the suppress observers flag set.
        Utility.Tree.Mutation.insertNode(node, parent, referenceChild)

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
          if(!parent.ownerDocument)
            throw DOMException.HierarchyRequestError

          Utility.Tree.Mutation.adoptNode(node, parent.ownerDocument)
        }

        let removedNodes: Node[] = []
        for (let childNode of parent.childNodes) {
          removedNodes.push(childNode)
        }

        let addedNodes: Node[] = []
        if (node && node.nodeType === Node.DocumentFragment) {
          for (let childNode of node.childNodes) {
            addedNodes.push(childNode)
          }
        } else if (node) {
          addedNodes.push(node)
        }

        for (let childNode of removedNodes) {
          // TODO: Remove all parent’s children, in tree order, 
          // with the suppress observers flag set.
          Utility.Tree.Mutation.removeNode(childNode, parent)
        }

        if (node) {
          // TODO: If node is not null, then insert node into parent
          // before null with the suppress observers flag set.
          Utility.Tree.Mutation.insertNode(node, parent, null)
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

        Utility.Tree.Mutation.removeNode(node, parent)

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
         * Let index be node’s index.
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
         * For each NodeIterator object iterator whose root’s node 
         * document is node’s node document, run the NodeIterator 
         * pre-removing steps given node and iterator.
         * 
         * Let oldPreviousSibling be node’s previous sibling.
         * 
         * Let oldNextSibling be node’s next sibling.
         */

        Utility.NodeList.remove(node, parent)

        /**
         * TODO:
         * If node is assigned, then run assign slotables for node’s 
         * assigned slot.
         *
         * If parent’s root is a shadow root, and parent is a slot whose
         * assigned nodes is the empty list, then run signal a slot 
         * change for parent.
         * 
         * If node has an inclusive descendant that is a slot, then:
         *   1. Run assign slotables for a tree with parent’s root.
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
         * then for each registered of inclusiveAncestor’s registered 
         * observer list, if registered’s options’s subtree is true, 
         * then append a new transient registered observer whose 
         * observer is registered’s observer, options is registered’s 
         * options, and source is registered to node’s registered
         * observer list.
         * 
         * If suppress observers flag is unset, then queue a tree 
         * mutation record for parent with 
         * « », « node », oldPreviousSibling, and oldNextSibling.
         * 
         * If node is a Text node, then run the child text content 
         * change steps for parent.
         */
      }

      /**
       * Converts the given nodes or strings into a node (if `nodes` has
       * only one element) or a document fragment.
       * 
       * @param nodes - the array of nodes or strings
       */
      static convertNodesIntoNode(nodes: [Node | string], document: Document): Node {
        if (nodes.length === 1)
        {
          if (typeof nodes[0] === 'string')
            return new Text(document, nodes[0])
          else
            return <Node>nodes[0]
        }
        else
        {
          let fragment = new DocumentFragment(document)
    
          for(let child of nodes) {
            if (typeof child === 'string')
              fragment.appendChild(new Text(document, child))
            else
              fragment.appendChild(child)
          }
    
          return fragment
        }
      }
    }
  }

  /**
   * Contains methods for manipulating a {@link NodeList}.
   */
  static NodeList = class {
    /**
     * Appends a node into a parent node.
     * 
     * @param node - node to insert
     * @param parent - parent node to receive node
     */
    static append(node: Node, parent: Node): void {
      Utility.NodeList.insert(node, parent, null)
    }

    /**
     * Inserts a node into a parent node before the given child node.
     * 
     * @param node - node to insert
     * @param parent - parent node to receive node
     * @param child - child node to insert node before
     */
    static insert(node: Node, parent: Node, child: Node | null): void {
      // an ordered set cannot contain duplicates
      for (let child of parent.childNodes) {
        if (node === child)
          return
      }

      node._parentNode = parent

      if (!parent.firstChild) {
        node._previousSibling = null
        node._nextSibling = null

        parent._firstChild = node
        parent._lastChild = node
        parent.childNodes._length = 1
      } else {
        let prev = (child ? child.previousSibling : parent.lastChild)
        let next = (child ? child : null)

        node._previousSibling = prev
        node._nextSibling = next

        if (prev) prev._nextSibling = node
        if (next) next._previousSibling = node

        if (!prev) parent._firstChild = node
        if (!next) parent._lastChild = node
        parent.childNodes._length++
      }
    }

    /**
     * Removes a child node from its parent.
     * 
     * @param node - node to remove
     * @param parent - parent node
     */
    static remove(node: Node, parent: Node): void {
      node._parentNode = null

      let prev = node.previousSibling
      let next = node.nextSibling

      node._previousSibling = null
      node._nextSibling = null

      if (prev) prev._nextSibling = next
      if (next) next._previousSibling = prev

      if (!prev) parent._firstChild = next
      if (!next) parent._lastChild = prev
      parent.childNodes._length--
    }
  }

  /**
   * Contains regex strings to match against productions defined in the 
   * XML specification 1.0 (http://www.w3.org/TR/xml/) and
   * XML specification 1.0 (http://www.w3.org/TR/xml11).
   */
  static XMLSpec = class {
    static readonly NameStartChar = /[:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF]/
    static readonly NameChar = /[\x2D\.0-:A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF]/
    static readonly Name = /^([:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-:A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/
    static readonly NCName = /^([A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-9A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/
    static readonly QName = /^(([A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-9A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*:([A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-9A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*)|(([A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-9A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*)$/

    static isName(name: string): boolean {
      return (!!name.match(Utility.XMLSpec.Name))
    }

    static isQName(name: string): boolean {
      return (!!name.match(Utility.XMLSpec.QName))
    }
  }

  /**
   * Includes methods for namespaces.
   * A tree is a finite hierarchical tree structure.
   */
  static Namespace = class {
    static readonly HTML = "http://www.w3.org/1999/xhtml"
    static readonly XML = "http://www.w3.org/XML/1998/namespace"
    static readonly XMLNS = "http://www.w3.org/2000/xmlns/"
    static readonly MathML = "http://www.w3.org/1998/Math/MathML"
    static readonly SVG = "http://www.w3.org/2000/svg"
    static readonly XLink = "http://www.w3.org/1999/xlink"

    /**
     * Validates the given qualified name.
     * 
     * @param qualifiedName - qualified name
     */
    static validateQName(qualifiedName: string): void {
      if (!Utility.XMLSpec.isName(qualifiedName))
        throw DOMException.InvalidCharacterError
      if (!Utility.XMLSpec.isQName(qualifiedName))
        throw DOMException.InvalidCharacterError
    }

    /**
     * Validates and extracts a namespace, prefix, and localName from the
     * given namespace and qualified name.
     * 
     * @param namespace - namespace
     * @param qualifiedName - qualified name
     * 
     * @returns an object with `namespace`, `prefix`, and `localName` 
     * keys.
     */
    static extractNames(namespace: string | null, qualifiedName: string): { namespace: string | null, prefix: string | null, localName: string } {
      if (!namespace) namespace = null
      Utility.Namespace.validateQName(qualifiedName)

      let parts = qualifiedName.split(':')
      let prefix = (parts.length === 2 ? parts[0] : null)
      let localName = (parts.length === 2 ? parts[1] : qualifiedName)

      if (prefix && !namespace)
        throw DOMException.NamespaceError

      if (prefix === "xml" && namespace !== Utility.Namespace.XML)
        throw DOMException.NamespaceError

      if (namespace !== Utility.Namespace.XMLNS &&
        (prefix === "xmlns" || qualifiedName === "xmlns"))
        throw DOMException.NamespaceError

      if (namespace === Utility.Namespace.XMLNS &&
        (prefix !== "xmlns" && qualifiedName !== "xmlns"))
        throw DOMException.NamespaceError

      return {
        'namespace': namespace,
        'prefix': prefix,
        'localName': localName
      }
    }
  }

  /**
   * Contains internal functions used by the module.
   */
  static Internal = class {
    /**
     * Applies the given mixin classes to a base class.
     * 
     * @param derivedCtor - base class constructor
     * @param baseCtors - mixin constructor
     */
    static applyMixin(derivedCtor: any, baseCtor: any): void {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        derivedCtor.prototype[name] = baseCtor.prototype[name]
      })
    }
  }
}