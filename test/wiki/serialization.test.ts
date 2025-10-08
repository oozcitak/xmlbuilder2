import $$ from '../TestHelpers'

$$.suite('serialization examples in wiki', () => {

  const xmlStr = $$.t`
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
    `
  const doc = $$.create(xmlStr)

  $$.test('JS object', () => {
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
          aircraft: [
            'F-14 Tomcat',
            'MiG-28'
          ]
        }
      }
    }

    $$.deepEqual(doc.end({ format: "object" }), obj)
  })

  $$.test('XML string', () => {
    const serializedXML = $$.t`
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
    `

    $$.deepEqual(doc.end({ format: "xml", prettyPrint: true }), serializedXML)
  })

  $$.test('JSON', () => {
    const jsonString = $$.t`{
      "topgun": {
        "pilots": {
          "pilot": [
            {
              "@callsign": "Iceman",
              "@rank": "Lieutenant",
              "#": "Tom Kazansky"
            },
            {
              "@callsign": "Maverick",
              "@rank": "Lieutenant",
              "#": "Pete Mitchell"
            },
            {
              "@callsign": "Goose",
              "@rank": "Lieutenant (j.g.)",
              "#": "Nick Bradshaw"
            }
          ]
        },
        "hangar": {
          "aircraft": [
            "F-14 Tomcat",
            "MiG-28"
          ]
        }
      }
    }`

    $$.deepEqual(doc.end({ format: "json", prettyPrint: true }), jsonString)
  })

  $$.test('YAML', () => {
    const yamlString = $$.t`
    ---
    "topgun":
      "pilots":
        "pilot":
        - "@callsign": "Iceman"
          "@rank": "Lieutenant"
          "#": "Tom Kazansky"
        - "@callsign": "Maverick"
          "@rank": "Lieutenant"
          "#": "Pete Mitchell"
        - "@callsign": "Goose"
          "@rank": "Lieutenant (j.g.)"
          "#": "Nick Bradshaw"
      "hangar":
        "aircraft":
        - "F-14 Tomcat"
        - "MiG-28"`

    $$.deepEqual(doc.end({ format: "yaml" }), yamlString)
  })

  $$.test('Map', () => {
    const pilots = new Map<string, any>()
    pilots.set("pilot", [
      new Map([['@callsign', 'Iceman'], ['@rank', 'Lieutenant'], ['#', 'Tom Kazansky']]),
      new Map([['@callsign', 'Maverick'], ['@rank', 'Lieutenant'], ['#', 'Pete Mitchell']]),
      new Map([['@callsign', 'Goose'], ['@rank', 'Lieutenant (j.g.)'], ['#', 'Nick Bradshaw']])
    ])

    const hangar = new Map<string, any>()
    hangar.set("aircraft", ['F-14 Tomcat', 'MiG-28'])

    const topgun = new Map<string, any>()
    topgun.set("pilots", pilots)
    topgun.set("hangar", hangar)

    const obj = new Map<string, any>()
    obj.set("topgun", topgun)

    $$.deepEqual(doc.end({ format: "map" }), obj)
  })

  $$.test('group settings', () => {
    const doc2 = $$.create().ele('root').att({ foo: 'bar', fizz: 'buzz' })

    $$.deepEqual(doc2.end({ format: "object", group: true }),
      {
        root: { '@': { foo: 'bar', fizz: 'buzz' }}
      })

    $$.deepEqual(doc2.end({ format: "object", group: false }),
      {
        root: { '@foo': 'bar', '@fizz': 'buzz' }
      })
  })

  $$.test('verbose settings', () => {
    const doc2 = $$.create().ele('root').ele('node').txt('text').up().ele('node');

    $$.deepEqual(doc2.end({ format: "object", verbose: true }),
      {
        root: [
          {
            node: [
              "text",
              {}
            ]
          }
        ]
      })

    $$.deepEqual(doc2.end({ format: "object", verbose: false }),
      {
        root: {
          node: [
            "text",
            {}
          ]
        }
      })
  })

})

