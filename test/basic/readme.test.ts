import $$ from '../TestHelpers'

describe('examples in README', () => {

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
        script: {
          monologue: {
            '#1': 'Talk to me Goose!',
            cut: 'dog tag shot',
            '#2': 'Talk to me...'
          }
        },
        hangar: {
          '#': [
            { aircraft: 'F-14 Tomcat' },
            { '!': 'Fictional; MiGs use odd numbers for fighters.' },
            { '$': '<a href="https://topgun.fandom.com/wiki/MiG-28"/>' },
            { aircraft: 'MiG-28' }
          ]
        }
      }
    }

    const root = $$.xml().document(obj)
    expect(root.end( { prettyPrint: true })).toBe($$.t`
      <?xml version="1.0"?>
      <topgun>
        <pilots>
          <pilot callsign="Iceman" rank="Lieutenant">Tom Kazansky</pilot>
          <pilot callsign="Maverick" rank="Lieutenant">Pete Mitchell</pilot>
          <pilot callsign="Goose" rank="Lieutenant (j.g.)">Nick Bradshaw</pilot>
        </pilots>
        <script>
          <monologue>
            Talk to me Goose!
            <cut>dog tag shot</cut>
            Talk to me...
          </monologue>
        </script>
        <hangar>
          <aircraft>F-14 Tomcat</aircraft>
          <!--Fictional; MiGs use odd numbers for fighters.-->
          <![CDATA[<a href="https://topgun.fandom.com/wiki/MiG-28"/>]]>
          <aircraft>MiG-28</aircraft>
        </hangar>
      </topgun>
    `)
  })

})

