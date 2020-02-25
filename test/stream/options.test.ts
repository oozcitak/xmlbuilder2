import $$ from '../TestHelpers'
import { XMLBuilderStreamImpl } from '../../src/stream'

describe('XMLStream options', () => {

  test('options defaults', () => {
    const xmlStream = new XMLBuilderStreamImpl({
      data: ((chunk, level) => { }),
      end: (() => { })
    }) as any

    const options = xmlStream._options

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
  })

  test('no options', (done) => {
    const xmlStream = $$.createStream()

    xmlStream.dec().ele('root').end()

    $$.expectStreamResult(xmlStream, `<?xml version="1.0"?><root/>`, done)
  })

  test('prettyPrint', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true })

    xmlStream.dec().ele('root').end()

    $$.expectStreamResult(xmlStream, $$.t`
      <?xml version="1.0"?>
      <root/>`, done)
  })

  test('wellFormed', (done) => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    $$.expectStreamError(xmlStream, () => xmlStream.com('--'), done)
  })

  test('indent', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true, indent: "    " })
    xmlStream.ele('root').ele('node').end()
    $$.expectStreamResult(xmlStream, $$.t`
      <root>
          <node/>
      </root>`, done)
  })

  test('newline', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true, indent: '', newline: "!" })
    xmlStream.ele('root').ele('node').end()
    $$.expectStreamResult(xmlStream, `<root>!<node/>!</root>`, done)
  })

  test('offset', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true, offset: 2 })
    xmlStream.ele('root').ele('node').end()
    $$.expectStreamResult(xmlStream,
      '    <root>\n' +
      '      <node/>\n' +
      '    </root>', done)
  })

  test('allowEmptyTags', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true, allowEmptyTags: true })
    xmlStream.ele('root').ele('node').end()
    $$.expectStreamResult(xmlStream, $$.t`
      <root>
        <node></node>
      </root>`, done)
  })

  test('spaceBeforeSlash', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true, spaceBeforeSlash: true })
    xmlStream.ele('root').ele('node').end()
    $$.expectStreamResult(xmlStream, $$.t`
      <root>
        <node />
      </root>`, done)
  })

  test('width', (done) => {
    const xmlStream = $$.createStream({ prettyPrint: true, width: 20 })
    xmlStream.ele('test').ele('node', { "first": "1", "second": "2" }).end()
    $$.expectStreamResult(xmlStream, $$.t`
      <test>
        <node first="1"
          second="2"/>
      </test>`, done)
  })

})
