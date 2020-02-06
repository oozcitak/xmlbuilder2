import $$ from '../TestHelpers'
import { empty } from '@oozcitak/infra/lib/List'

describe('import()', () => {

  test('document', () => {
    const root = $$.create().ele('roster')
    root.com('fighter pilots')

    const pilot1 = $$.create().ele('pilot', { 'callsign': 'Maverick', 'rank': 'Lieutenant' }).txt('Pete Mitchell')
    const pilot2 = $$.create().ele('pilot', { 'callsign': 'Goose', 'rank': 'Lieutenant (j.g.)' }).txt('Nick Bradshaw')
    const pilot3 = $$.create().ele('pilot', { 'callsign': 'Iceman', 'rank': 'Lieutenant' }).txt('Tom Kazansky')
    
    root.import(pilot1.doc())
    root.import(pilot2.doc())
    root.import(pilot3.doc())

    expect($$.printTree(root.doc().node)).toBe($$.t`
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

  test('invalid document', () => {
    const root = $$.create().ele('roster')
    root.com('fighter pilots')

    const emptyDoc = $$.create()
    
    expect(() => root.import(emptyDoc)).toThrow()
  })

  test('document fragment', () => {
    const root = $$.create().ele('roster')
    root.com('fighter pilots')

    const pilots = $$.fragment()
      .ele('pilot', { 'callsign': 'Maverick', 'rank': 'Lieutenant' }).txt('Pete Mitchell').up()
      .ele('pilot', { 'callsign': 'Goose', 'rank': 'Lieutenant (j.g.)' }).txt('Nick Bradshaw').up()
      .ele('pilot', { 'callsign': 'Iceman', 'rank': 'Lieutenant' }).txt('Tom Kazansky').up()
    
    root.import(pilots)

    expect($$.printTree(root.doc().node)).toBe($$.t`
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
    const root = $$.create().ele('roster')
    root.com('fighter pilots')

    const pilot1 = $$.create().ele('pilot', { 'callsign': 'Maverick', 'rank': 'Lieutenant' }).txt('Pete Mitchell')
    const pilot2 = $$.create().ele('pilot', { 'callsign': 'Goose', 'rank': 'Lieutenant (j.g.)' }).txt('Nick Bradshaw')
    const pilot3 = $$.create().ele('pilot', { 'callsign': 'Iceman', 'rank': 'Lieutenant' }).txt('Tom Kazansky')
    
    root.import(pilot1)
    root.import(pilot2)
    root.import(pilot3)

    expect($$.printTree(root.doc().node)).toBe($$.t`
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
