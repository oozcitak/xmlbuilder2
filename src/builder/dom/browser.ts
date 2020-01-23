/// <reference lib="dom" />

/**
 * Returns a DOM implementation.
 */
export function getImplementation(): DOMImplementation {
  return window.document.implementation
}

/**
 * Returns a DOM parser.
 */
export function getParser(): DOMParser {
  return new DOMParser()
}
