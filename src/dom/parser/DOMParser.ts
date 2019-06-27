import { XMLStringLexer } from "./XMLStringLexer"
import { TokenType } from './interfaces'
import { DocumentImpl } from '../DocumentImpl'
import { Document, Node } from "../interfaces"
import {
  DocTypeToken, CDATAToken, CommentToken, TextToken, PIToken,
  ElementToken, ClosingTagToken
} from "./XMLToken"
import { Namespace } from "../spec"

/**
 * Represents a parser for XML and HTML content.
 */
export class DOMParser {
  /**
   * Parses the given string and returns a document object.
   * 
   * @param source - the string containing the document tree.
   * @param mimeType - the mime type of the document
   */
  parseFromString(source: string, mimeType: MimeType): Document {
    if (mimeType === MimeType.HTML) {
      throw new Error('HTML parser not implemented.')
    } else {
      const lexer = new XMLStringLexer(source)
      lexer.skipWhitespaceOnlyText = true

      const doc = new DocumentImpl()
      doc._contentType = mimeType

      let context: Node = doc
      for (const token of lexer) {
        switch (token.type) {
          case TokenType.Declaration:
            // no-op
            break
          case TokenType.DocType:
            const doctype = <DocTypeToken>token
            context.appendChild(doc.implementation.createDocumentType(
              doctype.name, doctype.pubId, doctype.sysId))
            break
          case TokenType.CDATA:
            const cdata = <CDATAToken>token
            context.appendChild(doc.createCDATASection(cdata.data))
            break
          case TokenType.Comment:
            const comment = <CommentToken>token
            context.appendChild(doc.createComment(comment.data))
            break
          case TokenType.PI:
            const pi = <PIToken>token
            context.appendChild(doc.createProcessingInstruction(
              pi.target, pi.data))
            break
          case TokenType.Text:
            const text = <TextToken>token
            context.appendChild(doc.createTextNode(text.data))
            break
          case TokenType.Element:
            const element = <ElementToken>token

            // inherit namespace from parent
            const qName = Namespace.extractQName(element.name)
            let namespace = context.lookupNamespaceURI(qName.prefix)

            // override namespace if there is a namespace declaration
            // attribute
            for (let [attName, attValue] of Object.entries(element.attributes)) {
              if (attName === "xmlns")
              {
                namespace = attValue
              } else {
                const attQName = Namespace.extractQName(attName)
                if (attQName.prefix === "xmlns" && attQName.localName === qName.prefix) {
                  namespace = attValue
                }
              }
            }

            // create the DOM element node
            const elementNode = (namespace !== null ?
              doc.createElementNS(namespace, element.name) :
              doc.createElement(element.name))

            context.appendChild(elementNode)

            // assign attributes
            for (let [attName, attValue] of Object.entries(element.attributes)) {
              // skip the default namespace declaration attribute
              if (attName === "xmlns") {
                continue
              }
              
              const attQName = Namespace.extractQName(attName)
              if (attQName.prefix === "xmlns") {
                // prefixed namespace declaration attribute
                elementNode.setAttributeNS(Namespace.XMLNS, attName, attValue)
              } else {
                const attNamespace = elementNode.lookupNamespaceURI(attQName.prefix)
                if (attNamespace !== null && !elementNode.isDefaultNamespace(attNamespace)) {
                  elementNode.setAttributeNS(attNamespace, attName, attValue)
                } else {
                  elementNode.setAttribute(attName, attValue)
                }
              }
            }

            if (!element.selfClosing) {
              context = <Node>elementNode
            }
            break
          case TokenType.ClosingTag:
            const closingTag = <ClosingTagToken>token
            if (closingTag.name !== context.nodeName) {
              throw new Error('Closing tag name does not match opening tag name.')
            }
            if (context.parentNode) {
              context = context.parentNode
            }
            break
        }
      }
      return doc
    }
  }
}

/**
 * Defines the mime type of the document.
 */
export enum MimeType {
  HTML = 'text/html',
  TextXML = 'text/xml',
  XML = 'application/xml',
  XHTML = 'application/xhtml+xml',
  SVG = 'image/svg+xml'
}