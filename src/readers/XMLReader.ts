import { XMLStringLexer } from "@oozcitak/dom/lib/parser/XMLStringLexer"
import {
  TokenType, DeclarationToken, DocTypeToken, CDATAToken, CommentToken, 
  TextToken, PIToken, ElementToken, ClosingTagToken
} from "@oozcitak/dom/lib/parser/interfaces"
import { namespace as infraNamespace } from "@oozcitak/infra"
import {
  namespace_extractQName
} from "@oozcitak/dom/lib/algorithm"
import { XMLBuilder } from "../interfaces"
import { sanitizeInput } from "../builder/dom"
import { BaseReader } from "./BaseReader"

/**
 * Parses XML nodes from an XML document string.
 */
export class XMLReader extends BaseReader<string> {

  /**
   * Parses the given document representation.
   * 
   * @param node - node receive parsed XML nodes
   * @param str - XML document string to parse
   */
  _parse(node: XMLBuilder, str: string): XMLBuilder {
    const lexer = new XMLStringLexer(str, { skipWhitespaceOnlyText: true })

    let context = node
    let token = lexer.nextToken()
    while (token.type !== TokenType.EOF) {
      switch (token.type) {
        case TokenType.Declaration:
          const declaration = <DeclarationToken>token
          if (declaration.version !== "1.0") {
            throw new Error("Invalid xml version: " + declaration.version)
          }
          break
        case TokenType.DocType:
          const doctype = <DocTypeToken>token
          context = this.docType(context, doctype.name, doctype.pubId, doctype.sysId) || context
          break
        case TokenType.CDATA:
          const cdata = <CDATAToken>token
          context = this.cdata(context, cdata.data) || context
          break
        case TokenType.Comment:
          const comment = <CommentToken>token
          context = this.comment(context, comment.data) || context
          break
        case TokenType.PI:
          const pi = <PIToken>token
          context = this.instruction(context, pi.target, pi.data) || context
          break
        case TokenType.Text:
          const text = <TextToken>token
          context = this.text(context, text.data) || context
          break
        case TokenType.Element:
          const element = <ElementToken>token

          // inherit namespace from parent
          const [prefix] = namespace_extractQName(
            sanitizeInput(element.name, this._builderOptions.invalidCharReplacement))
          let namespace = context.node.lookupNamespaceURI(prefix)

          // override namespace if there is a namespace declaration
          // attribute
          // also lookup namespace declaration attributes
          const nsDeclarations: { [key: string]: string } = {}
          for (let [attName, attValue] of element.attributes) {
            attName = sanitizeInput(attName, this._builderOptions.invalidCharReplacement)
            attValue = sanitizeInput(attValue, this._builderOptions.invalidCharReplacement)
            if (attName === "xmlns") {
              namespace = attValue
            } else {
              const [attPrefix, attLocalName] = namespace_extractQName(attName)
              if (attPrefix === "xmlns") {
                if (attLocalName === prefix) {
                  namespace = attValue
                }
                nsDeclarations[attLocalName] = attValue
              }
            }
          }

          // create the DOM element node
          const elementNode = (namespace !== null ?
            this.element(context, namespace, element.name) :
            this.element(context, undefined, element.name))
          if(elementNode === undefined) break

          // assign attributes
          for (let [attName, attValue] of element.attributes) {
            attName = sanitizeInput(attName, this._builderOptions.invalidCharReplacement)
            attValue = sanitizeInput(attValue, this._builderOptions.invalidCharReplacement)
            const [attPrefix, attLocalName] = namespace_extractQName(attName)
            let attNamespace: string | null = null
            if (attPrefix === "xmlns" || (attPrefix === null && attLocalName === "xmlns")) {
              // namespace declaration attribute
              attNamespace = infraNamespace.XMLNS
            } else {
              attNamespace = elementNode.node.lookupNamespaceURI(attPrefix)
              if (attNamespace !== null && elementNode.node.isDefaultNamespace(attNamespace)) {
                attNamespace = null
              } else if (attNamespace === null && attPrefix !== null) {
                attNamespace = nsDeclarations[attPrefix] || null
              }
            }

            if (attNamespace !== null)
              this.attribute(elementNode, attNamespace, attName, attValue)
            else
              this.attribute(elementNode, undefined, attName, attValue)
          }

          if (!element.selfClosing) {
            context = elementNode
          }
          break
        case TokenType.ClosingTag:
          /* istanbul ignore else */
          if (context.node.parentNode) {
            context = context.up()
          }
          break
      }

      token = lexer.nextToken()
    }
    return context
  }
}
