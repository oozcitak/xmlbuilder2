import $$ from '../TestHelpers'

$$.suite('fragment()', () => {

  $$.test('ele', () => {
    const frag = $$.fragment()
    const node1 = frag.ele('node1')
    const node2 = frag.ele('node2')
    node1.ele('node1-1').att("att1-1", "val1-1")
    node1.ele('node1-2').att("att1-2", "val1-2")
    node2.ele('node2-1').att("att2-1", "val2-1")
    node2.ele('node2-2').att("att2-2", "val2-2")
    $$.deepEqual($$.printTree(frag.node), $$.t`
      node1
        node1-1 att1-1="val1-1"
        node1-2 att1-2="val1-2"
      node2
        node2-1 att2-1="val2-1"
        node2-2 att2-2="val2-2"
    `)
  })

  $$.test('JS object', () => {
    const obj = {
      node1: {
        "node1-1": { "@att1-1": "val1-1" },
        "node1-2": { "@att1-2": "val1-2" }
      },
      node2: {
        "node2-1": { "@att2-1": "val2-1" },
        "node2-2": { "@att2-2": "val2-2" }
      }
    }
    const frag = $$.fragment(obj)
    $$.deepEqual($$.printTree(frag.node), $$.t`
      node1
        node1-1 att1-1="val1-1"
        node1-2 att1-2="val1-2"
      node2
        node2-1 att2-1="val2-1"
        node2-2 att2-2="val2-2"
    `)
  })

  $$.test('JS object with array', () => {
    const obj = [
      { node1: "val1" },
      { node2: "val2" }
    ]
    const frag = $$.fragment(obj)
    $$.deepEqual($$.printTree(frag.node), $$.t`
      node1
        # val1
      node2
        # val2
    `)
    const root = $$.create().ele("root")
    root.import(frag)
    $$.deepEqual($$.printTree(root.node), $$.t`
      root
        node1
          # val1
        node2
          # val2
    `)
  })

  $$.test('JSON string', () => {
    const obj = {
      node1: {
        "node1-1": { "@att1-1": "val1-1" },
        "node1-2": { "@att1-2": "val1-2" }
      },
      node2: {
        "node2-1": { "@att2-1": "val2-1" },
        "node2-2": { "@att2-2": "val2-2" }
      }
    }
    const frag = $$.fragment(JSON.stringify(obj))
    $$.deepEqual($$.printTree(frag.node), $$.t`
      node1
        node1-1 att1-1="val1-1"
        node1-2 att1-2="val1-2"
      node2
        node2-1 att2-1="val2-1"
        node2-2 att2-2="val2-2"
    `)
  })

  $$.test('XML string', () => {
    const str = $$.t`
      <node1>
        <node1-1 att1-1="val1-1"/>
        <node1-2 att1-2="val1-2"/>
      </node1>
      <node2>
        <node2-1 att2-1="val2-1"/>
        <node2-2 att2-2="val2-2"/>
      </node2>
      `
    const frag = $$.fragment(str)
    $$.deepEqual($$.printTree(frag.node), $$.t`
      node1
        node1-1 att1-1="val1-1"
        node1-2 att1-2="val1-2"
      node2
        node2-1 att2-1="val2-1"
        node2-2 att2-2="val2-2"
    `)
  })

  $$.test('end', () => {
    const frag = $$.fragment()
    const node1 = frag.ele('node1')
    const node2 = frag.ele('node2')
    node1.ele('node1-1').att("att1-1", "val1-1")
    node1.ele('node1-2').att("att1-2", "val1-2")
    node2.ele('node2-1').att("att2-1", "val2-1")
    node2.ele('node2-2').att("att2-2", "val2-2")
    $$.deepEqual(frag.end( { prettyPrint: true }), $$.t`
      <node1>
        <node1-1 att1-1="val1-1"/>
        <node1-2 att1-2="val1-2"/>
      </node1>
      <node2>
        <node2-1 att2-1="val2-1"/>
        <node2-2 att2-2="val2-2"/>
      </node2>
    `)
  })

})
