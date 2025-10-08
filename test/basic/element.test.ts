import $$ from '../TestHelpers'

$$.suite('ele()', () => {

  $$.test('string name', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    node1.ele('node1-1')
    node1.ele('node1-2')
    const node2 = root.ele('node2')
    node2.ele('node2-1')
    node2.ele('node2-2')
    node2.ele('node2-3')

    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      root
        node1
          node1-1
          node1-2
        node2
          node2-1
          node2-2
          node2-3
      `)
  })

  $$.test('null name', () => {
    $$.throws(() => $$.create().ele(null as any))
  })

  $$.test('element namespace cannot be overwritten', () => {
    const root = $$.create().ele('ns1', 'root@ns2')
    $$.deepEqual((root.node as any).namespaceURI, 'ns1')
  })

  $$.test('from JS object', () => {
    const root = $$.create().ele('root')
    root.ele({
      'node1': { 'node1-1': '', 'node1-2': '' },
      'node2': { 'node2-1': '', 'node2-2': '', 'node2-3': '' }
    })

    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      root
        node1
          node1-1
          node1-2
        node2
          node2-1
          node2-2
          node2-3
      `)
  })

  $$.test('from XML string', () => {
    const root = $$.create().ele('root')
    root.ele('<node1><node1-1/><node1-2/></node1><node2><node2-1/><node2-2/><node2-3/></node2>')

    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      root
        node1
          node1-1
          node1-2
        node2
          node2-1
          node2-2
          node2-3
      `)
  })

  $$.test('from JSON string', () => {
    const root = $$.create().ele('root')
    root.ele(`{
      "node1": { "node1-1": "", "node1-2": "" },
      "node2": { "node2-1": "", "node2-2": "", "node2-3": "" }
    }`)
    $$.deepEqual($$.printTree(root.doc().node), $$.t`
      root
        node1
          node1-1
          node1-2
        node2
          node2-1
          node2-2
          node2-3
      `)
  })

})
