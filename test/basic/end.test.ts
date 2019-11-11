import $$ from '../TestHelpers'

describe('end()', () => {

  test('simple document', () => {
    const xml = $$.xml({ docType: { pubID: "pub", sysID: "sys" } })
      .document()
      .ele('root')
      .com('comment')
      .ins('target', 'content')
      .dat('cdata node')
      .txt('some text')
      .ele('node', {att: 'val', att2: 'val2'})
        .txt('more text')
        .end()
        
    expect(xml).toBe(
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

})
