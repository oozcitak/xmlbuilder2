import $$ from '../TestHelpers'

describe('parsing examples in wiki', () => {

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

  test('JS object', () => {
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

    const doc = $$.create(obj)
    expect(doc.end( { prettyPrint: true })).toBe(xmlStr)
  })

  test('XML string', () => {
    const serializedXML = `
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

    const doc = $$.create(serializedXML)
    expect(doc.end( { prettyPrint: true })).toBe(xmlStr)
  })

  test('JSON', () => {
    const jsonString = `{
      "topgun": {
        "pilots": {
          "pilot": [
            { "@callsign": "Iceman", "@rank": "Lieutenant", "#": "Tom Kazansky" },
            { "@callsign": "Maverick", "@rank": "Lieutenant", "#": "Pete Mitchell" },
            { "@callsign": "Goose", "@rank": "Lieutenant (j.g.)", "#": "Nick Bradshaw" }
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

    const doc = $$.create(jsonString)
    expect(doc.end( { prettyPrint: true })).toBe(xmlStr)
  })

  test('Map', () => {
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

    const doc = $$.create(obj)
    expect(doc.end( { prettyPrint: true })).toBe(xmlStr)
  })

})

