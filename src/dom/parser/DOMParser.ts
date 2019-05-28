import { XMLStringLexer } from "./XMLStringLexer"
import { TokenType } from './interfaces'
import { DocumentImpl } from '../DocumentImpl'
import { Document, Node, Element } from "../interfaces"
import {
  DocTypeToken, CDATAToken, CommentToken, TextToken, PIToken,
  ElementToken, ClosingTagToken
} from "./XMLToken"
import { Namespace } from "../spec";

/**
 * Represents a parser for XML and HTML content.
 * See: https://www.ibm.com/support/knowledgecenter/en/SS6SG3_4.2.0/com.ibm.entcobol.doc_4.2/PGandLR/ref/rpxml26e.htm
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

            let qName = Namespace.extractQName(element.name)
            let namespace = context.lookupNamespaceURI(qName.prefix)

            const elementNode = (namespace ?
              doc.createElementNS(namespace, element.name) :
              doc.createElement(element.name))

            context.appendChild(elementNode)

            for (let [attName, attValue] of Object.entries(element.attributes)) {
              qName = Namespace.extractQName(attName)
              let namespace = elementNode.lookupNamespaceURI(qName.prefix)
              if (namespace) {
                elementNode.setAttributeNS(namespace, attName, attValue)
              } else {
                elementNode.setAttribute(attName, attValue)
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