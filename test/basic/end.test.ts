import $$ from '../TestHelpers'

$$.suite('end()', () => {

  $$.test('simple document', () => {
    const xml = $$.create()
      .dtd({ pubID: "pub", sysID: "sys" })
      .ele('root')
      .com('comment')
      .ins('target', 'content')
      .dat('cdata node')
      .txt('some text')
      .ele('node', {att: 'val', att2: 'val2'})
        .txt('more text')
        .end()

    $$.deepEqual(xml,
      '<?xml version="1.0"?>' +
      '<!DOCTYPE root PUBLIC "pub" "sys">' +
      '<root>' +
        '<!--comment-->' +
        '<?target content?>' +
        '<![CDATA[cdata node]]>' +
        'some text' +
        '<node att="val" att2="val2">' +
          'more text' +
        '</node>' +
      '</root>'
      )
  })

  $$.test('invalid writer format', () => {
    const xml = $$.create() as any
    $$.throws(() => xml.end({ format: "invalid" }))
  })

})
