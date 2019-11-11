import $$ from '../TestHelpers'

describe('dtd()', () => {

  test('without identifiers', () => {
    const root = $$.xml().document().ele('root').dtd()
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root
      root
      `)
  })

  test('public identifier', () => {
    const root = $$.xml().document().ele('root').dtd({ pubID: 'pub' })
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root PUBLIC pub
      root
      `)
  })

  test('system identifier', () => {
    const root = $$.xml().document().ele('root').dtd({ sysID: 'sys' })
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root SYSTEM sys
      root
      `)
  })

  test('both identifiers', () => {
    const root = $$.xml().document().ele('root').dtd({ pubID: 'pub', sysID: 'sys' })
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root PUBLIC pub sys
      root
      `)
  })

  test('replace doctype', () => {
    const root = $$.xml().document().ele('root').dtd({ pubID: "pub", sysID: "sys" })
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root PUBLIC pub sys
      root
      `)

    root.dtd({ pubID: 'newpub', sysID: 'newsys' })
    expect($$.printTree(root.doc())).toBe($$.t`
      !DOCTYPE root PUBLIC newpub newsys
      root
      `)
  })

  test('update when element node changes', () => {
    const doc = $$.xml().document().dtd({ pubID: "pub", sysID: "sys" })
    doc.ele('newroot')
    expect($$.printTree(doc)).toBe($$.t`
      !DOCTYPE newroot PUBLIC pub sys
      newroot
      `)
  })

})
