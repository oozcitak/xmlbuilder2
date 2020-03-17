import $$ from '../TestHelpers'

describe('parse()', () => {

  test('XML string', (done) => {
    const str = '<root att="val">text</root>'

    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele(str).end()

    $$.expectCBResult(xmlStream, $$.t`
    <root att="val">
      text
    </root>
    `, done)
  })


})
