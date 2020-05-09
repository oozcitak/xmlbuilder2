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

  test('document - inherit namespace', () => {
    const root = $$.create().ele('root', { 'xmlns:a': 'nsa', 'xmlns:b': 'nsb' })

    const doc1 = $$.create().ele('a:node').txt('texta').ele('a:childnode', { 'a:att': 'vala' }).doc()
    const doc2 = $$.create().ele('b:node').txt('textb').ele('b:childnode', { 'b:att': 'valb' }).doc()
    const doc3 = $$.create().ele('node').txt('text').ele('childnode', { 'att': 'val' }).doc()
    
    root.import(doc1)
    root.import(doc2)
    root.import(doc3)

    expect($$.printTree(root.doc().node)).toBe($$.t`
      root xmlns:a="nsa" (ns:http://www.w3.org/2000/xmlns/) xmlns:b="nsb" (ns:http://www.w3.org/2000/xmlns/)
        a:node (ns:nsa)
          # texta
          a:childnode (ns:nsa) a:att="vala" (ns:nsa)
        b:node (ns:nsb)
          # textb
          b:childnode (ns:nsb) b:att="valb" (ns:nsb)
        node
          # text
          childnode att="val"
      `)
  })

  test('fragment - inherit namespace', () => {
    const root = $$.create().ele('root', { 'xmlns:a': 'nsa', 'xmlns:b': 'nsb' })

    const frag1 = $$.fragment().ele('a:node').txt('texta').ele('a:childnode', { 'a:att': 'vala' }).doc()
    const frag2 = $$.fragment().ele('b:node').txt('textb').ele('b:childnode', { 'b:att': 'valb' }).doc()
    const frag3 = $$.fragment().ele('node').txt('text').ele('childnode', { 'att': 'val' }).doc()
    
    root.import(frag1)
    root.import(frag2)
    root.import(frag3)

    expect($$.printTree(root.doc().node)).toBe($$.t`
      root xmlns:a="nsa" (ns:http://www.w3.org/2000/xmlns/) xmlns:b="nsb" (ns:http://www.w3.org/2000/xmlns/)
        a:node (ns:nsa)
          # texta
          a:childnode (ns:nsa) a:att="vala" (ns:nsa)
        b:node (ns:nsb)
          # textb
          b:childnode (ns:nsb) b:att="valb" (ns:nsb)
        node
          # text
          childnode att="val"          
      `)
  })

})
