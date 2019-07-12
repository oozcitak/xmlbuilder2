import { Node, Attr } from "../interfaces"

/**
 * Represents an XML serializer.
 */
export interface XMLSerializer {

  /**
   * Produces an XML serialization of `root`.
   * 
   * @param root - node to serialize
   */
  serializeToString(root: Node): string 
}

/**
 * Represents an object that is passed between serializer functions. Some
 * functions may replace values in the object.
 */
export interface SerializerNodeRef {
  /**
   * Contains namespaceURIs and their most recent prefix associations.
   */
  namespacePrefixMap: Map<string | null, string>

  /**
   * Stores a number to produce a unique prefix value when no suitable existing
   * namespace prefix is available to serialize a namespaceURI.
   */
  generatedNamespacePrefixIndex: number
}

/**
 * Represents an object that is passed between serializer functions. Some
 * functions may replace values in the object.
 */
export interface RecordNamespaceRef {
  /**
   * Contains namespaceURIs and their most recent prefix associations.
   */
  namespacePrefixMap: Map<string | null, string>
  /**
   * This list is local to each element. Its purpose is to ensure that there are
   * no conflicting prefixes should a new namespace prefix attribute need to be
   * generated.
   */
  elementPrefixesList: string[]
  /**
   * Duplicate namespace prefix definition.
   */
  duplicatePrefixDefinition: string | null
}

/**
 * Represents an attribute ready to be serialized.
 */
export interface PreSerializedAttr {
  attr?: Attr
  name: string
  value: string
}

/**
 * Represents a node ready to be serialized.
 */
export interface PreSerializedNode<T extends Node> {
  node: T
  level: number
  name?: string
  attributes: PreSerializedAttr[]
  children: PreSerializedNode<Node>[]
}