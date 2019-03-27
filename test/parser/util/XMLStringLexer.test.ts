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
        <node att="val" att2='val2'/>
        <?kidding itwas="different"?>
        <?forreal?>
        <![CDATA[here be dragons]]>
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
      new Token.PIToken('forreal', ''),
      new Token.TextToken('\n  '),
      new Token.CDATAToken('here be dragons'),
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

  test('with insignificant whitespace', function () {
    const xmlStr = $$.t`
      <?xml version = "1.0" ?>
      <!DOCTYPE root >
      <root >
        <node  att = "val" />
        <!-- same node below -->
        <node att= "val"   att2 = 'val2' />
        <?kidding itwas="different"?>
        <![CDATA[here be dragons]]>
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
      new Token.CDATAToken('here be dragons'),
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

  test('public DTD', function () {
    const xmlStr = $$.t`
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <!DOCTYPE root PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
      <root/>
      `
    const tokens = [
      new Token.DeclarationToken('1.0', 'UTF-8', 'yes'),
      new Token.TextToken('\n'), // lexer preserves whitespace
      new Token.DocTypeToken('root', '-//W3C//DTD HTML 4.01//EN', 'http://www.w3.org/TR/html4/strict.dtd'),
      new Token.TextToken('\n'),
      new Token.ElementToken('root', {}, true)
    ]
    let i = 0
    const lexer = new XMLStringLexer(xmlStr)
    for (const token of lexer) {
      expect(token).toEqual(tokens[i])
      i++
    }
    expect(i).toBe(tokens.length)
  })

  test('system DTD', function () {
    const xmlStr = $$.t`
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <!DOCTYPE root SYSTEM "http://www.w3.org/Math/DTD/mathml1/mathml.dtd">
      <root/>
      `
    const tokens = [
      new Token.DeclarationToken('1.0', 'UTF-8', 'yes'),
      new Token.TextToken('\n'), // lexer preserves whitespace
      new Token.DocTypeToken('root', '', 'http://www.w3.org/Math/DTD/mathml1/mathml.dtd'),
      new Token.TextToken('\n'),
      new Token.ElementToken('root', {}, true)
    ]
    let i = 0
    const lexer = new XMLStringLexer(xmlStr)
    for (const token of lexer) {
      expect(token).toEqual(tokens[i])
      i++
    }
    expect(i).toBe(tokens.length)
  })

  test('DTD with internal subset', function () {
    const xmlStr = $$.t`
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <!DOCTYPE root[ <!ELEMENT root (#PCDATA)> ]>
      <root/>
      `
    const tokens = [
      new Token.DeclarationToken('1.0', 'UTF-8', 'yes'),
      new Token.TextToken('\n'), // lexer preserves whitespace
      new Token.DocTypeToken('root', '', ''),
      new Token.TextToken('\n'),
      new Token.ElementToken('root', {}, true)
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