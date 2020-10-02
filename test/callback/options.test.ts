import $$ from '../TestHelpers'
import { XMLBuilderCBImpl } from '../../src/builder'

describe('XMLStream options', () => {

  test('options defaults', () => {
    const xmlStream = new XMLBuilderCBImpl({
      data: (() => { }),
      end: (() => { }),
      error: (() => { })
    }) as any

    const options = xmlStream._options

    expect(typeof options.data).toBe('function')
    expect(typeof options.end).toBe('function')
    expect(typeof options.error).toBe('function')
    expect(options.wellFormed).toBe(false)
    expect(options.prettyPrint).toBe(false)
    expect(options.indent).toBe("  ")
    expect(options.newline).toBe("\n")
    expect(options.offset).toBe(0)
    expect(options.width).toBe(0)
    expect(options.allowEmptyTags).toBe(false)
    expect(options.spaceBeforeSlash).toBe(false)
    expect(options.defaultNamespace).toEqual({
      ele: undefined,
      att: undefined
    })
    expect(options.namespaceAlias).toEqual({
      html: "http://www.w3.org/1999/xhtml",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/",
      mathml: "http://www.w3.org/1998/Math/MathML",
      svg: "http://www.w3.org/2000/svg",
      xlink: "http://www.w3.org/1999/xlink"
    })

    // this won't throw; errors should be handled in error function
    xmlStream.ele('\0')
  })

  test('no options', (done) => {
    const xmlStream = $$.createCB()

    xmlStream.dec().ele('root').end()

    $$.expectCBResult(xmlStream, `<?xml version="1.0"?><root/>`, done)
  })

  test('prettyPrint', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec().ele('root').end()

    $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <root/>`, done)
  })

  test('wellFormed', (done) => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectCBError(xmlStream, () => xmlStream.com('--'), done)
  })

  test('indent', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true, indent: "    " })
    xmlStream.ele('root').ele('node').end()
    $$.expectCBResult(xmlStream, $$.t`
      <root>
          <node/>
      </root>`, done)
  })

  test('newline', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true, indent: '', newline: "!" })
    xmlStream.ele('root').ele('node').end()
    $$.expectCBResult(xmlStream, `<root>!<node/>!</root>`, done)
  })

  test('offset', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true, offset: 2 })
    xmlStream.ele('root').ele('node').end()
    $$.expectCBResult(xmlStream,
      '    <root>\n' +
      '      <node/>\n' +
      '    </root>', done)
  })

  test('allowEmptyTags', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true, allowEmptyTags: true })
    xmlStream.ele('root').ele('node').end()
    $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node></node>
      </root>`, done)
  })

  test('spaceBeforeSlash', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true, spaceBeforeSlash: true })
    xmlStream.ele('root').ele('node').end()
    $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node />
      </root>`, done)
  })

  test('width', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true, width: 20 })
    xmlStream.ele('test').ele('node', { "first": "1", "second": "2" }).end()
    $$.expectCBResult(xmlStream, $$.t`
      <test>
        <node first="1"
          second="2"/>
      </test>`, done)
  })

  test('skip null and undefined att values', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })
    xmlStream.ele({
      root: {
        node1: {
          '@att': 'val',
          '@att1': 'val1',
          '@att2': null,
          '@att3': undefined
        }
      }
    }).end()

    $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node1 att="val" att1="val1"/>
      </root>`, done)
  })

  test('keep null att value with keepNullAttributes flag', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true, keepNullAttributes: true })
    xmlStream.ele({
      root: {
        node1: {
          '@att': 'val',
          '@att1': 'val1',
          '@att2': null,
          '@att3': undefined
        }
      }
    }).end()

    $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node1 att="val" att1="val1" att2="" att3=""/>
      </root>`, done)
  })

  test('skip null and undefined node value', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })
    xmlStream.ele({
      root: {
        node1: '',
        node2: {},
        node3: null,
        node4: undefined,
        '#1': null,
        '#2': undefined,
        '!1': null,
        '!2': undefined,
        '$1': null,
        '$2': undefined,
        '?pi1': null,
        '?pi2': undefined
      }
    }).end()

    $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node1/>
        <node2/>
      </root>`, done)
  })

  test('keep null node value with keepNullNodes flag', (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true, keepNullNodes: true })
    xmlStream.ele({
      root: {
        node1: '',
        node2: {},
        node3: null,
        node4: undefined,
        '#1': null,
        '#2': undefined,
        '!1': null,
        '!2': undefined,
        '$1': null,
        '$2': undefined,
        '?1': null,
        '?2': undefined        
      }
    }).end()

    $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node1/>
        <node2/>
        <node3/>
        <node4/>
        <!---->
        <!---->
        <![CDATA[]]>
        <![CDATA[]]>
      </root>`, done)
  })

  test('custom converter', (done) => {
    const obj = {
      'root': {
        '_att': 'val',
        '#': '42'
      }
    }
    const xmlStream = $$.createCB({ convert: { att: '_' } })
    xmlStream.ele(obj).end()
    $$.expectCBResult(xmlStream, '<root att="val">42</root>', done)
  })

})
