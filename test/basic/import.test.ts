import $$ from '../TestHelpers'

describe('import()', () => {

  test('document', () => {
    const root = $$.xml().document().ele('roster')
    root.com('fighter pilots')

    const pilot1 = $$.xml().document().ele('pilot', { 'callsign': 'Maverick', 'rank': 'Lieutenant' }).txt('Pete Mitchell')
    const pilot2 = $$.xml().document().ele('pilot', { 'callsign': 'Goose', 'rank': 'Lieutenant (j.g.)' }).txt('Nick Bradshaw')
    const pilot3 = $$.xml().document().ele('pilot', { 'callsign': 'Iceman', 'rank': 'Lieutenant' }).txt('Tom Kazansky')
    
    root.import(pilot1.doc())
    root.import(pilot2.doc())
    root.import(pilot3.doc())

    expect($$.printTree(root.doc())).toBe($$.t`
      roster
        ! fighter pilots
        pilot callsign="Maverick" rank="Lieutenant"
          # Pete Mitchell
        pilot callsign="Goose" rank="Lieutenant (j.g.)"
          # Nick Bradshaw
        pilot callsign="Iceman" rank="Lieutenant"
          # Tom Kazansky
      `)
  })

  test('document fragment', () => {
    const root = $$.xml().document().ele('roster')
    root.com('fighter pilots')

    const pilots = $$.xml().fragment()
      .ele('pilot', { 'callsign': 'Maverick', 'rank': 'Lieutenant' }).txt('Pete Mitchell').up()
      .ele('pilot', { 'callsign': 'Goose', 'rank': 'Lieutenant (j.g.)' }).txt('Nick Bradshaw').up()
      .ele('pilot', { 'callsign': 'Iceman', 'rank': 'Lieutenant' }).txt('Tom Kazansky').up()
    
    root.import(pilots)

    expect($$.printTree(root.doc())).toBe($$.t`
      roster
        ! fighter pilots
        pilot callsign="Maverick" rank="Lieutenant"
          # Pete Mitchell
        pilot callsign="Goose" rank="Lieutenant (j.g.)"
          # Nick Bradshaw
        pilot callsign="Iceman" rank="Lieutenant"
          # Tom Kazansky
      `)
  })

  test('node', () => {
    const root = $$.xml().document().ele('roster')
    root.com('fighter pilots')

    const pilot1 = $$.xml().document().ele('pilot', { 'callsign': 'Maverick', 'rank': 'Lieutenant' }).txt('Pete Mitchell')
    const pilot2 = $$.xml().document().ele('pilot', { 'callsign': 'Goose', 'rank': 'Lieutenant (j.g.)' }).txt('Nick Bradshaw')
    const pilot3 = $$.xml().document().ele('pilot', { 'callsign': 'Iceman', 'rank': 'Lieutenant' }).txt('Tom Kazansky')
    
    root.import(pilot1)
    root.import(pilot2)
    root.import(pilot3)

    expect($$.printTree(root.doc())).toBe($$.t`
      roster
        ! fighter pilots
        pilot callsign="Maverick" rank="Lieutenant"
          # Pete Mitchell
        pilot callsign="Goose" rank="Lieutenant (j.g.)"
          # Nick Bradshaw
        pilot callsign="Iceman" rank="Lieutenant"
          # Tom Kazansky
      `)
  })

})
