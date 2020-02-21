import $$ from '../TestHelpers'

describe('XMLStream options', () => {

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

  test('wellFormed', () => {
    const xmlStream = $$.createStream({ wellFormed: true })
    xmlStream.ele('ns', 'root')
    expect(() => xmlStream.com('--')).toThrow()
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
    xmlStream.ele('test').ele('node', { "first":"1", "second":"2" }).end()
    $$.expectStreamResult(xmlStream, $$.t`
      <test>
        <node first="1"
          second="2"/>
      </test>`, done)
  })

})
