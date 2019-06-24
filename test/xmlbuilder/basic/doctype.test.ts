import $$ from '../TestHelpers'

describe('dtd()', () => {

  test('without identifiers', () => {
    const root = $$.create('root').dtd()
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root
      root
      `)
  })

  test('public identifier', () => {
    const root = $$.create('root').dtd('pub')
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root PUBLIC pub
      root
      `)
  })

  test('system identifier', () => {
    const root = $$.create('root').dtd('', 'sys')
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root SYSTEM sys
      root
      `)
  })

  test('both identifiers', () => {
    const root = $$.create('root').dtd('pub', 'sys')
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root PUBLIC pub sys
      root
      `)
  })

  test('replace doctype', () => {
    const root = $$.withOptions({ pubID: "pub", sysID: "sys" }).create('root')
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root PUBLIC pub sys
      root
      `)

    root.dtd('newpub', 'newsys')
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root PUBLIC newpub newsys
      root
      `)
  })

})
