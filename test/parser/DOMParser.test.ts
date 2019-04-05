import $$ from '../TestHelpers'
import { DOMParser, MimeType } from '../../src/parser/DOMParser'

describe('DOMParser', function () {

  test('HTML parser not yet supported', function () {
    const parser = new DOMParser()
    expect(() => parser.parseFromString('', MimeType.HTML)).toThrow()
  })

  test('XML parser', function () {
    const xmlStr = $$.t`
      <?xml version="1.0"?>
      <!DOCTYPE root PUBLIC "pubid" "sysid">
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

    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlStr, MimeType.XML)

    expect($$.printTree(doc)).toBe($$.t`
      !DOCTYPE root PUBLIC pubid SYSTEM sysid
      root
        node att="val"
        !  same node below 
        node att="val" att2="val2"
        ? kidding itwas="different"
        ? forreal
        [ here be dragons
        text
          # alien's pinky toe
      `)
  })

  test('XML parser - closing tag should match', function () {
    const xmlStr = $$.t`
      <root>
        <node att="val"/>
      </notroot>
      `

    const parser = new DOMParser()
    expect(() => parser.parseFromString(xmlStr, MimeType.XML)).toThrow()
  })

})