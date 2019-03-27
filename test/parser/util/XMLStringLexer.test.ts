import $$ from '../../TestHelpers'
import { XMLStringLexer } from '../../../src/parser/util/XMLStringLexer'
import * as Token from '../../../src/parser/util/XMLToken'

describe('XMLStringLexer', function () {

  test('basic', function () {
    const xmlStr = $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root>
      <root>
        <node att="val"/>
        <!-- same node below -->
        <node att="val" att2="val2"/>
        <?kidding itwas="different"?>
        <text>alien's pinky toe</text>
      </root>
      `
    const tokens = [
      new Token.DeclarationToken('1.0', '', ''),
      new Token.TextToken('\n'), // lexer preserves whitespace
      new Token.DocTypeToken('root', '', ''),
      new Token.TextToken('\n'),
      new Token.ElementToken('root', {}, false),
      new Token.TextToken('\n  '),
      new Token.ElementToken('node', { 'att': 'val' }, true),
      new Token.TextToken('\n  '),
      new Token.CommentToken(' same node below '),
      new Token.TextToken('\n  '),
      new Token.ElementToken('node', { 'att': 'val', 'att2': 'val2' }, true),
      new Token.TextToken('\n  '),
      new Token.PIToken('kidding', 'itwas="different"'),
      new Token.TextToken('\n  '),
      new Token.ElementToken('text', { }, false),
      new Token.TextToken('alien\'s pinky toe'),
      new Token.ClosingTagToken('text'),
      new Token.TextToken('\n'),
      new Token.ClosingTagToken('root')
    ]
    let i = 0
    const lexer = new XMLStringLexer(xmlStr)
    for (const token of lexer) {
      expect(token).toEqual(tokens[i])
      i++
    }
    expect(i).toBe(tokens.length)
  })

})