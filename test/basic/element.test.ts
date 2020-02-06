import $$ from '../TestHelpers'

describe('ele()', () => {

  test('string name', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    node1.ele('node1-1')
    node1.ele('node1-2')
    const node2 = root.ele('node2')
    node2.ele('node2-1')
    node2.ele('node2-2')
    node2.ele('node2-3')

    expect($$.printTree(root.doc().node)).toBe($$.t`
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

  test('from JS object', () => {
    const root = $$.create().ele('root')
    root.ele({
      'node1': { 'node1-1': '', 'node1-2': '' },
      'node2': { 'node2-1': '', 'node2-2': '', 'node2-3': '' }
    })

    expect($$.printTree(root.doc().node)).toBe($$.t`
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

  test('from XML string', () => {
    const root = $$.create().ele('root')
    root.ele('<node1><node1-1/><node1-2/></node1><node2><node2-1/><node2-2/><node2-3/></node2>')

    expect($$.printTree(root.doc().node)).toBe($$.t`
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

  test('from XML string error', () => {
    const root = $$.create().ele('root')
    expect(() => root.ele('<?xml version="1.0"?>')).toThrow()
  })

  test('from JSON string', () => {
    const root = $$.create().ele('root')
    root.ele(`{
      "node1": { "node1-1": "", "node1-2": "" },
      "node2": { "node2-1": "", "node2-2": "", "node2-3": "" }
    }`)
    expect($$.printTree(root.doc().node)).toBe($$.t`
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
