import $$ from '../../TestHelpers'

describe('import()', () => {

  test('document', () => {
    const root = $$.create('roster')
    root.com('fighter pilots')

    const pilot1 = $$.create('pilot', 'Pete Mitchell', { 'callsign': 'Maverick', 'rank': 'Lieutenant' })
    const pilot2 = $$.create('pilot', 'Nick Bradshaw', { 'callsign': 'Goose', 'rank': 'Lieutenant (j.g.)' })
    const pilot3 = $$.create('pilot', 'Tom Kazansky', { 'callsign': 'Iceman', 'rank': 'Lieutenant' })
    
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
    const root = $$.create('roster')
    root.com('fighter pilots')

    const pilots = $$.fragment()
      .ele('pilot', 'Pete Mitchell', { 'callsign': 'Maverick', 'rank': 'Lieutenant' }).up()
      .ele('pilot', 'Nick Bradshaw', { 'callsign': 'Goose', 'rank': 'Lieutenant (j.g.)' }).up()
      .ele('pilot', 'Tom Kazansky', { 'callsign': 'Iceman', 'rank': 'Lieutenant' }).up()
    
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
    const root = $$.create('roster')
    root.com('fighter pilots')

    const pilot1 = $$.create('pilot', 'Pete Mitchell', { 'callsign': 'Maverick', 'rank': 'Lieutenant' })
    const pilot2 = $$.create('pilot', 'Nick Bradshaw', { 'callsign': 'Goose', 'rank': 'Lieutenant (j.g.)' })
    const pilot3 = $$.create('pilot', 'Tom Kazansky', { 'callsign': 'Iceman', 'rank': 'Lieutenant' })
    
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
