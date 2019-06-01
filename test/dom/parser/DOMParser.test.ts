import $$ from '../../TestHelpers'
import { DOMParser, MimeType } from '../../../src/dom/parser'

describe('DOMParser - XML', function () {

  test('HTML parser not yet supported', function () {
    const parser = new DOMParser()
    expect(() => parser.parseFromString('', MimeType.HTML)).toThrow()
  })

  test('basic', function () {
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
    const doc = $$.parse(xmlStr)

    expect($$.printTree(doc.doc())).toBe($$.t`
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

  test('closing tag should match', function () {
    const xmlStr = $$.t`
      <root>
        <node att="val"/>
      </notroot>
      `

    expect(() => $$.parse(xmlStr)).toThrow()
  })

  test('default namespace', function () {
    const xmlStr = '<root xmlns="uri:myns"><node1><node2>text</node2></node1></root>'
    expect($$.printTree($$.parse(xmlStr))).toBe($$.t`
      root (ns:uri:myns)
        node1 (ns:uri:myns)
          node2 (ns:uri:myns)
            # text    
    `)
  })

  test('namespace prefix', function () {
    const xmlStr =
      '<root xmlns="uri:myns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="uri:myschema.xsd">' +
      '<node1><node2>text</node2></node1>' +
      '</root>'

    expect($$.printTree($$.parse(xmlStr))).toBe($$.t`
      root (ns:uri:myns) xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" (ns:http://www.w3.org/2000/xmlns/) xsi:schemaLocation="uri:myschema.xsd" (ns:http://www.w3.org/2001/XMLSchema-instance)
        node1 (ns:uri:myns)
          node2 (ns:uri:myns)
            # text
      `)
  })

  test('explicit namespace declaration', function () {
    const xmlStr =
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
      '<script type="text/ecmascript" xlink:href="foo.js"/>' +
      '</svg>'
    expect($$.printTree($$.parse(xmlStr))).toBe($$.t`
      svg (ns:http://www.w3.org/2000/svg) xmlns:xlink="http://www.w3.org/1999/xlink" (ns:http://www.w3.org/2000/xmlns/)
        script (ns:http://www.w3.org/2000/svg) type="text/ecmascript" xlink:href="foo.js" (ns:http://www.w3.org/1999/xlink)
      `)
  })

  test('empty default namespace', function () {
    const xmlStr =
      '<svg xmlns="http://www.w3.org/2000/svg">' +
      '<script xmlns=""/>' +
      '</svg>'
    expect($$.printTree($$.parse(xmlStr))).toBe($$.t`
      svg (ns:http://www.w3.org/2000/svg)
        script
      `)
  })

  test('default namespace override', function () {
    const xmlStr =
      '<svg xmlns="http://www.w3.org/2000/svg">' +
      '<script xmlns="http://www.w3.org/1999/xlink"/>' +
      '</svg>'
    expect($$.printTree($$.parse(xmlStr))).toBe($$.t`
      svg (ns:http://www.w3.org/2000/svg)
        script (ns:http://www.w3.org/1999/xlink)
      `)
  })

  test('prefixed namespace override', function () {
    const xmlStr =
      '<p:root xmlns:p="uri:my ns1">' +
      '<p:node><p:child/></p:node>' +
      '<p:node xmlns:p="uri:my ns2"><p:child/></p:node>' +
      '<p:node><p:child/></p:node>' +
      '</p:root>'
    expect($$.printTree($$.parse(xmlStr))).toBe($$.t`
      p:root (ns:uri:my ns1) xmlns:p="uri:my ns1" (ns:http://www.w3.org/2000/xmlns/)
        p:node (ns:uri:my ns1)
          p:child (ns:uri:my ns1)
        p:node (ns:uri:my ns2) xmlns:p="uri:my ns2" (ns:http://www.w3.org/2000/xmlns/)
          p:child (ns:uri:my ns2)
        p:node (ns:uri:my ns1)
          p:child (ns:uri:my ns1)
      `)
  })

})