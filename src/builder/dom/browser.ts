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
export function getParser(version: "1.0" | "1.1"): DOMParser {
  return new DOMParser()
}
