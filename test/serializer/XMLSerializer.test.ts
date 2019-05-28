import $$ from '../TestHelpers'
import { XMLSerializer } from '../../src/dom/serializer'
import { Document } from '../../src/dom/interfaces'

describe('XMLSerializer', function () {

  test('XML serializer', function () {
    const doc = $$.create()
      .ele('root')
      .ele('node', { att: 'val' })
      .up()
      .com('same node below')
      .ele('node', { att: 'val', att2: 'val2' })
      .up()
      .ins('kidding', 'itwas="different"')
      .ins('for', 'real')
      .ele('text', 'alien\'s pinky toe')
      .doc()

    const serializer = new XMLSerializer()
    expect(serializer.serializeToString(<Document><unknown>doc)).toBe(
      '<root>' + 
        '<node att="val"/>' + 
        '<!--same node below-->' + 
        '<node att="val" att2="val2"/>' + 
        '<?kidding itwas="different"?>' + 
        '<?for real?>' + 
        '<text>alien\'s pinky toe</text>' + 
      '</root>'
    )
  })

  test('XML serializer + parser', function () {
    const xmlStr= 
      '<section xmlns="http://www.ibm.com/events"' +
        ' xmlns:bk="urn:loc.gov:books"' +
        ' xmlns:pi="urn:personalInformation"' +
        ' xmlns:isbn="urn:ISBN:0-395-36341-6">' +
        '<title>Book-Signing Event</title>' +
        '<signing>' +
          '<bk:author pi:title="Mr" pi:name="Jim Ross"/>' +
          '<book bk:title="Writing COBOL for Fun and Profit" isbn:number="0426070806"/>' +
          '<comment xmlns="">What a great issue!</comment>' +
        '</signing>' +
      '</section>'

    const doc = $$.parse(xmlStr)
    const serializer = new XMLSerializer()
    expect(serializer.serializeToString(<Document><unknown>doc)).toBe(xmlStr)
  })

})