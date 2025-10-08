import $$ from '../TestHelpers'

$$.suite('dtd()', () => {

  $$.test('without identifiers', () => {
    const root = $$.create().ele('root').dtd()
    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      !DOCTYPE root
      root
      `)
  })

  $$.test('public identifier', () => {
    const root = $$.create().ele('root').dtd({ pubID: 'pub' })
    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      !DOCTYPE root PUBLIC pub
      root
      `)
  })

  $$.test('system identifier', () => {
    const root = $$.create().ele('root').dtd({ sysID: 'sys' })
    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      !DOCTYPE root SYSTEM sys
      root
      `)
  })

  $$.test('both identifiers', () => {
    const root = $$.create().ele('root').dtd({ pubID: 'pub', sysID: 'sys' })
    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      !DOCTYPE root PUBLIC pub sys
      root
      `)
  })

  $$.test('replace doctype', () => {
    const root = $$.create().ele('root').dtd({ pubID: "pub", sysID: "sys" })
    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      !DOCTYPE root PUBLIC pub sys
      root
      `)

    root.dtd({ pubID: 'newpub', sysID: 'newsys' })
    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      !DOCTYPE root PUBLIC newpub newsys
      root
      `)
  })

  $$.test('name must match document element node', () => {
    const doc = $$.create().ele('root')
    $$.throws(() => doc.dtd({ name: 'newroot' }))
  })

  $$.test('update when element node changes', () => {
    const doc = $$.create().dtd({ pubID: "pub", sysID: "sys" })
    doc.ele('newroot')
    $$.deepEqual($$.printTree(doc.node), $$.t`
      !DOCTYPE newroot PUBLIC pub sys
      newroot
      `)
  })

})
