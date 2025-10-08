import $$ from '../TestHelpers'
import { XMLBuilderCBImpl } from '../../src/builder'

$$.suite('XMLStream options', () => {

  $$.test('options defaults', () => {
    const xmlStream = new XMLBuilderCBImpl({
      data: (() => { }),
      end: (() => { }),
      error: (() => { })
    }) as any

    const options = xmlStream._options

    $$.deepEqual(typeof options.data, 'function')
    $$.deepEqual(typeof options.end, 'function')
    $$.deepEqual(typeof options.error, 'function')
    $$.deepEqual(options.wellFormed, false)
    $$.deepEqual(options.prettyPrint, false)
    $$.deepEqual(options.indent, "  ")
    $$.deepEqual(options.newline, "\n")
    $$.deepEqual(options.offset, 0)
    $$.deepEqual(options.width, 0)
    $$.deepEqual(options.allowEmptyTags, false)
    $$.deepEqual(options.spaceBeforeSlash, false)
    $$.deepEqual(options.defaultNamespace, {
      ele: undefined,
      att: undefined
    })
    $$.deepEqual(options.namespaceAlias, {
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

  $$.test('no options', async () => {
    const xmlStream = $$.createCB()

    xmlStream.dec().ele('root').end()

    await $$.expectCBResult(xmlStream, `<?xml version="1.0"?><root/>`)
  })

  $$.test('prettyPrint', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.dec().ele('root').end()

    await $$.expectCBResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <root/>`)
  })

  $$.test('wellFormed', async () => {
    const xmlStream = $$.createCB({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    await $$.expectCBError(xmlStream, () => xmlStream.com('--'))
  })

  $$.test('indent', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true, indent: "    " })
    xmlStream.ele('root').ele('node').end()
    await $$.expectCBResult(xmlStream, $$.t`
      <root>
          <node/>
      </root>`)
  })

  $$.test('newline', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true, indent: '', newline: "!" })
    xmlStream.ele('root').ele('node').end()
    await $$.expectCBResult(xmlStream, `<root>!<node/>!</root>`)
  })

  $$.test('offset', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true, offset: 2 })
    xmlStream.ele('root').ele('node').end()
    await $$.expectCBResult(xmlStream,
      '    <root>\n' +
      '      <node/>\n' +
      '    </root>')
  })

  $$.test('allowEmptyTags', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true, allowEmptyTags: true })
    xmlStream.ele('root').ele('node').end()
    await $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node></node>
      </root>`)
  })

  $$.test('spaceBeforeSlash', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true, spaceBeforeSlash: true })
    xmlStream.ele('root').ele('node').end()
    await $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node />
      </root>`)
  })

  $$.test('width', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true, width: 20 })
    xmlStream.ele('test').ele('node', { "first": "1", "second": "2" }).end()
    await $$.expectCBResult(xmlStream, $$.t`
      <test>
        <node first="1"
          second="2"/>
      </test>`)
  })

  $$.test('skip null and undefined att values', async () => {
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

    await $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node1 att="val" att1="val1"/>
      </root>`)
  })

  $$.test('keep null att value with keepNullAttributes flag', async () => {
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

    await $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node1 att="val" att1="val1" att2="" att3=""/>
      </root>`)
  })

  $$.test('skip null and undefined node value', async () => {
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

    await $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node1/>
        <node2/>
      </root>`)
  })

  $$.test('keep null node value with keepNullNodes flag', async () => {
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

    await $$.expectCBResult(xmlStream, $$.t`
      <root>
        <node1/>
        <node2/>
        <node3/>
        <node4/>
        <!---->
        <!---->
        <![CDATA[]]>
        <![CDATA[]]>
      </root>`)
  })

  $$.test('custom converter', async () => {
    const obj = {
      'root': {
        '_att': 'val',
        '#': '42'
      }
    }
    const xmlStream = $$.createCB({ convert: { att: '_' } })
    xmlStream.ele(obj).end()
    await $$.expectCBResult(xmlStream, '<root att="val">42</root>')
  })

})
