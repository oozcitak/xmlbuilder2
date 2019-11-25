import $$ from '../TestHelpers'

describe('examples in README', () => {

  test('with functions', () => {
    const root = $$.document().ele('topgun')
      .ele('pilots')
        .ele('pilot', { 'callsign': 'Iceman', 'rank': 'Lieutenant' }).txt('Tom Kazansky').up()
        .ele('pilot', { 'callsign': 'Maverick', 'rank': 'Lieutenant' }).txt('Pete Mitchell').up()
        .ele('pilot', { 'callsign': 'Goose', 'rank': 'Lieutenant (j.g.)' }).txt('Nick Bradshaw').up()
      .up()
      .ele('hangar')
        .ele('aircraft').txt('F-14 Tomcat').up()
        .ele('aircraft').txt('MiG-28').up()
      .up()
    .up()

    expect(root.end( { prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <topgun>
        <pilots>
          <pilot callsign="Iceman" rank="Lieutenant">Tom Kazansky</pilot>
          <pilot callsign="Maverick" rank="Lieutenant">Pete Mitchell</pilot>
          <pilot callsign="Goose" rank="Lieutenant (j.g.)">Nick Bradshaw</pilot>
        </pilots>
        <hangar>
          <aircraft>F-14 Tomcat</aircraft>
          <aircraft>MiG-28</aircraft>
        </hangar>
      </topgun>
    `)
  })

  test('from JS object', () => {
    const obj = {
      topgun: {
        pilots: {
          pilot: [
            { '@callsign': 'Iceman', '@rank': 'Lieutenant', '#': 'Tom Kazansky' },
            { '@callsign': 'Maverick', '@rank': 'Lieutenant', '#': 'Pete Mitchell' },
            { '@callsign': 'Goose', '@rank': 'Lieutenant (j.g.)', '#': 'Nick Bradshaw' }
          ]
        },
        hangar: {
          aircraft: [ 'F-14 Tomcat', 'MiG-28']
        }
      }
    }

    const root = $$.document(obj)
    expect(root.end( { prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <topgun>
        <pilots>
          <pilot callsign="Iceman" rank="Lieutenant">Tom Kazansky</pilot>
          <pilot callsign="Maverick" rank="Lieutenant">Pete Mitchell</pilot>
          <pilot callsign="Goose" rank="Lieutenant (j.g.)">Nick Bradshaw</pilot>
        </pilots>
        <hangar>
          <aircraft>F-14 Tomcat</aircraft>
          <aircraft>MiG-28</aircraft>
        </hangar>
      </topgun>
    `)
  })

  test('parsing', () => {
    const xmlStr = '<root att="val"><foo><bar>foobar</bar></foo></root>'
    const doc = $$.document(xmlStr)
    doc.root().ele("baz")

    expect(doc.end( { prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <root att="val">
        <foo>
          <bar>foobar</bar>
        </foo>
        <baz/>
      </root>
    `)
  })

  test('serializing', () => {
    const xmlStr = '<root att="val"><foo><bar>foobar</bar></foo></root>'
    const doc = $$.document(xmlStr)
    doc.root().ele("baz")

    expect(doc.end( { format: "object" })).toEqual(
      {
        "root": {
          "@att": "val",
          "foo": {
            "bar": "foobar"
          },
          "baz": {}
        }
      }
    )
  })

  test('processing', () => {
    const root = $$.document().ele('squares')
    root.com('f(x) = x^2')
    for(let i = 1; i <= 5; i++)
    {
      const item = root.ele('data') as any
      item.att('x', i)
      item.att('y', i * i)
    }

    expect(root.end( { prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <squares>
        <!--f(x) = x^2-->
        <data x="1" y="1"/>
        <data x="2" y="4"/>
        <data x="3" y="9"/>
        <data x="4" y="16"/>
        <data x="5" y="25"/>
      </squares>
    `)
  })

})

