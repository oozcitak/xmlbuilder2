import dedent from "dedent"

export default class TestHelpers {
  /**
   * De-indents template literals.
   */
  static t = dedent

  /**
   * Returns a string representation of the XML tree rooted at `node`.
   * 
   * @param node - the root node of the tree
   * @param level - indentation level
   */
  static printTree(node: any, level?: number | undefined): string {
    const removeLastNewline = (level === undefined)
    level = level || 0
    const indent = '  '.repeat(level)
    let str = ''
    switch (node.nodeType) {
      case 1: // Element
        str = `${indent}${node.tagName}`
        if(node.namespaceURI) {
          str += ` (ns:${node.namespaceURI})`
        }
        for (const attr of node.attributes) {
          str += ` ${attr.name}="${attr.value}"`
          if(attr.namespaceURI) {
            str += ` (ns:${attr.namespaceURI})`
          }
        }
        str += `\n`
        break
      case 3: // Text
        str = `${indent}# ${node.data}\n`
        break
      case 4: // CData
        str = `${indent}$ ${node.data}\n`
        break
      case 7: // ProcessingInstruction
        if (node.data) {
          str = `${indent}? ${node.target} ${node.data}\n`
        } else {
          str = `${indent}? ${node.target}\n`
        }
        break
      case 8: // Comment
        str = `${indent}! ${node.data}\n`
        break
      case 9: // Document
      case 11: // DocumentFragment
        level = -1
        break
      case 10: // DocumentType
        str = `${indent}!DOCTYPE ${node.name}`
        if (node.publicId && node.systemId)
          str += ` PUBLIC ${node.publicId} ${node.systemId}`
        else if (node.publicId)
          str += ` PUBLIC ${node.publicId}`
        else if (node.systemId)
          str += ` SYSTEM ${node.systemId}`
        str += `\n`
        break
      default:
        throw new Error('Unknown node type')
    }
    for (const child of node.childNodes) {
      str += TestHelpers.printTree(child, level + 1)
    }

    // remove last newline
    if (removeLastNewline)
      str = str.slice(0, -1)

    return str
  }
}