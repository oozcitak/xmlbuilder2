import { XMLBuilder, XMLBuilderOptions } from "../interfaces"
import { createParser, sanitizeInput, throwIfParserError } from "../builder/dom"
import { XMLBuilderImpl } from "../builder/XMLBuilderImpl"

/**
 * Parses XML nodes from JSON string.
 */
export class XMLReader {

  /**
   * Parses the given document represenatation.
   * 
   * @param node - node receive parsed XML nodes
   * @param str - XML document string to parse
   */
  parse(node: XMLBuilder, str: string): XMLBuilder {

    const ele = node as any
    const options = node.options

    let lastChild: XMLBuilder | null = null

    // parse XML string
    const contents = "<TEMP_ROOT>" + str + "</TEMP_ROOT>"
    const domParser = createParser()
    const doc = domParser.parseFromString(
      sanitizeInput(contents, options.invalidCharReplacement), "text/xml")
    /* istanbul ignore next */
    if (doc.documentElement === null) {
      throw new Error("Document element is null.")
    }
    throwIfParserError(doc)
    for (const child of doc.documentElement.childNodes) {
      const newChild = ele._doc.importNode(child, true)
      lastChild = new XMLBuilderImpl(newChild)
      ele._domNode.appendChild(newChild)
    }

    if (lastChild === null) {
      throw new Error("Could not create any elements with: " + str.toString() + ". " + ele._debugInfo())
    }

    return lastChild
  }
}
