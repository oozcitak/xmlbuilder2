import {
  Event, PotentialEventTarget, EventPathItem, EventTarget, EventListenerEntry,
  AbortController, AbortSignal, MutationObserver, MutationCallback, Node,
  MutationRecord, Document, RegisteredObserver, TransientRegisteredObserver,
  DocumentType, DocumentFragment, Element, ShadowRoot, ShadowRootMode,
  NamedNodeMap, Attr, CharacterData, ProcessingInstruction, BoundaryPoint,
  Range, AbstractRange, NodeIterator, Traverser, WhatToShow, NodeFilter,
  Collection, NodeList, HTMLCollection, TreeWalker, DOMTokenList, CustomEvent,
  DOMImplementation, Text, CDATASection, Comment, StaticRange, Slotable, 
  ChildNode, NonDocumentTypeChildNode, ParentNode, DocumentOrShadowRoot, 
  NonElementParentNode, EventPhase, XMLDocument
} from "./interfaces"
import { HTMLSlotElement } from "../htmldom/interfaces"

/**
 * Represents a DOM event.
 */
export interface EventInternal extends Event {
  _target: PotentialEventTarget
  _relatedTarget: PotentialEventTarget
  _touchTargetList: PotentialEventTarget[]
  _path: EventPathItem[]

  _stopPropagationFlag: boolean
  _stopImmediatePropagationFlag: boolean
  _canceledFlag: boolean
  _inPassiveListenerFlag: boolean
  _composedFlag: boolean
  _initializedFlag: boolean
  _dispatchFlag: boolean
  
  _isTrustedFlag: boolean

  _currentTarget: PotentialEventTarget
  _eventPhase: EventPhase

  _type: string
}

/**
 * Represents and event that carries custom data.
 */
export interface CustomEventInternal extends CustomEvent {
}

/**
 * Represents a target to which an event can be dispatched.
 */
export interface EventTargetInternal extends EventTarget {
  _eventListenerList: EventListenerEntry[]

  /**
   * Gets the parent event target for the given event.
   * 
   * @param event - an event
   */
  _getTheParent(event: Event): EventTarget | null

  /**
   * Defines optional activation behavior for the given event.
   * 
   * _Note:_ This exists because user agents perform certain actions for certain
   * EventTarget objects, e.g., the area element, in response to synthetic
   * MouseEvent events whose type attribute is click. Web compatibility
   * prevented it from being removed and it is now the enshrined way of
   * defining an activation of something.
   * 
   * @param event - an event
   */
  _activationBehavior?(event: Event): void

  /**
   * Defines optional legacy pre-activation behavior for the given event.
   *
   * _Note:_ These algorithms only exist for checkbox and radio input elements
   * and are not to be used for anything else.
   * 
   * @param event - an event
   */
  _legacyPreActivationBehavior?(event: Event): void
}

/**
 * Represents a controller that allows to abort DOM requests.
 */
export interface AbortControllerInternal extends AbortController {
  _signal: AbortSignal
}

/**
 * Represents a signal object that communicates with a DOM request and abort
 * it through an AbortController.
 */
export interface AbortSignalInternal extends AbortSignal {
  _abortedFlag: boolean
  _abortAlgorithms: Set<CallableFunction>
}

/**
 * Represents a collection of nodes.
 */
export interface CollectionInternal extends Collection {
  _live: boolean
  _root: Node
  _filter: ((element: Element) => any) | null
}

/**
 * Represents an ordered list of nodes.
 */
export interface NodeListInternal extends CollectionInternal, NodeList {
  /**
   * Used to keep track of child node count. This is a non-standard property.
   */    
  _length: number
}

/**
 * Represents a collection of elements.
 */
export interface HTMLCollectionInternal extends CollectionInternal, HTMLCollection {

}

/**
 * Represents an object that is used to observe mutations to the node tree.
 */
export interface MutationObserverInternal extends MutationObserver {
  _callback: MutationCallback
  _nodeList: Node[]
  _recordQueue: MutationRecord[]
}

/**
 * Represents a mutation record.
 */
export interface MutationRecordInternal extends MutationRecord {

}

/**
 * Represents a generic XML node.
 */
export interface NodeInternal extends EventTargetInternal, Node {
  _nodeDocument: DocumentInternal
  _registeredObserverList: Array<RegisteredObserver | TransientRegisteredObserver>

  /**
   * Used to keep track of parent-child relations in the tree. This is a 
   * non-standard property.
   */  
  _parentNode: Node | null
  _firstChild: Node | null
  _lastChild: Node | null
  _previousSibling: Node | null
  _nextSibling: Node | null
}

/**
 * Represents a document node.
 */
export interface DocumentInternal extends NodeInternal, Document {
  _encoding: string
  _contentType: string
  _URL: string
  _origin: string
  _type: "xml" | "html"
  _mode: string

  /**
   * Used to keep track of live ranges and clean up memory. This is a 
   * non-standard property.
   */
  _rangeList: Range[]
}

/**
 * Represents a XML document node.
 */
export interface XMLDocumentInternal extends NodeInternal, XMLDocument {

}

/**
 * Represents an object providing methods which are not dependent on 
 * any particular document.
 */
export interface DOMImplementationInternal extends DOMImplementation {

}

/**
 * Represents an object providing methods which are not dependent on 
 * any particular document
 */
export interface DocumentTypeInternal extends NodeInternal, DocumentType {
  _name: string
  _publicId: string
  _systemId: string
}

/**
 * Represents a document fragment in the XML tree.
 */
export interface DocumentFragmentInternal extends NodeInternal, DocumentFragment {
  _host: Element | null
}

/**
 * Represents a shadow root.
 */
export interface ShadowRootInternal extends DocumentFragmentInternal, ShadowRoot {
  _host: Element
  _mode: ShadowRootMode
}

/**
 * Represents an element node.
 */
export interface ElementInternal extends NodeInternal, Element {
  _namespace: string | null
  _namespacePrefix: string | null
  _localName: string
  _customElementState: "undefined" | "failed" | "uncustomized" | "custom"
  _customElementDefinition: any
  _is: string
  _shadowRoot: ShadowRoot | null

  readonly _qualifiedName: string
  readonly _htmlUppercasedQualifiedName: string

  _attributeList: NamedNodeMap

  _uniqueIdentifier?: string
}

/**
 * Represents a collection of nodes.
 */
export interface NamedNodeMapInternal extends NamedNodeMap {
  _element: Element
  _attributeList: Attr[]
}

/**
 * Represents an attribute of an element node.
 */
export interface AttrInternal extends NodeInternal, Attr {
  _namespace: string | null
  _namespacePrefix: string | null
  _localName: string
  _value: string
  _element: Element | null

  readonly _qualifiedName: string
}

/**
 * Represents a generic text node.
 */
export interface CharacterDataInternal extends NodeInternal, CharacterData {
  _data: string
}

/**
 * Represents a text node.
 */
export interface TextInternal extends CharacterDataInternal, Text {

}

/**
 * Represents a CDATA node.
 */
export interface CDATASectionInternal extends TextInternal, CDATASection {

}

/**
 * Represents a processing instruction node.
 */
export interface ProcessingInstructionInternal extends
  CharacterDataInternal, ProcessingInstruction {
  _target: string
}


/**
 * Represents a comment node.
 */
export interface CommentInternal extends CharacterDataInternal, Comment {

}

/**
 * Represents an abstract range with a start and end boundary point.
 */
export interface AbstractRangeInternal extends AbstractRange {
  _start: BoundaryPoint
  _end: BoundaryPoint

  readonly _startNode: Node
  readonly _startOffset: number
  readonly _endNode: Node
  readonly _endOffset: number

  readonly _collapsed: boolean
}

/**
 * Represents a static range.
 */
export interface StaticRangeInternal extends AbstractRangeInternal, StaticRange {

}

/**
 * Represents a live range.
 */
export interface RangeInternal extends AbstractRangeInternal, Range {
  readonly _root: Node
}

/**
 * Represents an object which can be used to iterate through the nodes
 * of a subtree.
 */
export interface TraverserInternal extends Traverser {
  _activeFlag: boolean
  _root: Node
  _whatToShow: WhatToShow
  _filter: NodeFilter | null
}

/**
 * Represents an object which can be used to iterate through the nodes
 * of a subtree.
 */
export interface NodeIteratorInternal extends TraverserInternal, NodeIterator {
  _iteratorCollection: Collection
  _reference: Node
  _pointerBeforeReference: boolean
}

/**
 * Represents the nodes of a subtree and a position within them.
 */
export interface TreeWalkerInternal extends TraverserInternal, TreeWalker {
  _current: Node
}

/**
 * Represents a node filter.
 */
export interface NodeFilterInternal extends NodeFilter {

}

/**
 * Represents a token set.
 */
export interface DOMTokenListInternal extends DOMTokenList {
  _tokenSet: Set<string>
  _element: Element
  _localName: string
}

/**
 * Represents a mixin that extends non-element parent nodes. This mixin
 * is implemented by {@link Document} and {@link DocumentFragment}.
 */
export interface NonElementParentNodeInternal extends NonElementParentNode {

}

/**
 * Represents a mixin for an interface to be used to share APIs between
 * documents and shadow roots. This mixin is implemented by
 * {@link Document} and {@link ShadowRoot}.
 */
export interface DocumentOrShadowRootInternal extends DocumentOrShadowRoot {

}

/**
 * Represents a mixin that extends parent nodes that can have children.
 * This mixin is implemented by {@link Element}, {@link Document} and
 * {@link DocumentFragment}.
 */
export interface ParentNodeInternal extends ParentNode {

}

/**
 * Represents a mixin that extends child nodes that can have siblings
 * other than doctypes. This mixin is implemented by {@link Element} and
 * {@link CharacterData}.
 */
export interface NonDocumentTypeChildNodeInternal extends NonDocumentTypeChildNode {

}

/**
 * Represents a mixin that extends child nodes that can have siblings
 * including doctypes. This mixin is implemented by {@link Element},
 * {@link CharacterData} and {@link DocumentType}.
 */
export interface ChildNodeInternal extends ChildNode {

}

/**
 * Represents a mixin that allows nodes to become the contents of
 * a <slot> element. This mixin is implemented by {@link Element} and
 * {@link Text}.
 */
export interface SlotableInternal extends Slotable {
  _name: string
  _assignedSlot: HTMLSlotElement | null
}