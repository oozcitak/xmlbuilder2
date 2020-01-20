import $$ from '../TestHelpers'

describe('collection', () => {

  test('each()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    let str = ''
    root.each(child => str += child.as.node.nodeName)
    expect(str).toBe('node1node2node3')
  })

  test('each() - single node', () => {
    const root = $$.document().ele('root')
    let str = ''
    root.each(child => str += child.as.node.nodeName, true, true)
    expect(str).toBe('root')
  })

  test('each() - recursive', () => {
    const root = $$.document().ele('root')
      .ele('node1')
        .ele('child').up()
      .up()
      .ele('node2').up()
      .ele('node3').up()
    let str = ''
    root.each(child => str += child.as.node.nodeName, false, true)
    expect(str).toBe('node1childnode2node3')
  })

  test('each() - self and recursive', () => {
    const root = $$.document().ele('root')
      .ele('node1')
        .ele('child')
          .ele('grandchild').up()
        .up()
      .up()
      .ele('node2').up()
      .ele('node3').up()
    let str = ''
    root.each(child => str += child.as.node.nodeName + ' ', true, true)
    expect(str).toBe('root node1 child grandchild node2 node3 ')
  })

  test('map()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    const arr = root.map(child => child.as.node.nodeName)
    expect(arr).toEqual(['node1', 'node2', 'node3'])
  })

  test('map() - self and recursive', () => {
    const root = $$.document().ele('root')
      .ele('node1')
        .ele('child').up()
      .up()
      .ele('node2').up()
      .ele('node3').up()
    const arr = root.map(child => child.as.node.nodeName, true, true)
    expect(arr).toEqual(['root', 'node1', 'child', 'node2', 'node3'])
  })

  test('reduce()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    const str = root.reduce((value, child) => value + child.as.node.nodeName, '')
    expect(str).toBe('node1node2node3')
  })

  test('reduce() - self and recursive', () => {
    const root = $$.document().ele('root')
      .ele('node1')
        .ele('child').up()
      .up()
      .ele('node2').up()
      .ele('node3').up()
    const str = root.reduce((value, child) => value + child.as.node.nodeName, '', true, true)
    expect(str).toBe('rootnode1childnode2node3')
  })

  test('find()', () => {
    const root = $$.document().ele('root')
    const node1 = root.ele('node1')
    const node2 = root.ele('node2')
    const node3 = root.ele('node3')
    const n1 = root.find(child => child.as.node.nodeName === 'node2')
    if (!n1) throw new Error('node is undefined')
    expect(n1.as.node).toBe(node2.as.node)
    const n2 = root.find(child => child.as.node.nodeName === 'x')
    expect(n2).toBeUndefined()
  })

  test('find() - self and recursive', () => {
    const root = $$.document().ele('root')
    const node1 = root.ele('node1')
    const child = node1.ele('child')
    const node2 = root.ele('node2')
    const node3 = root.ele('node3')
    const n1 = root.find(child => child.as.node.nodeName === 'child', true, true)
    if (!n1) throw new Error('node is undefined')
    expect(n1.as.node).toBe(child.as.node)
    const n2 = root.find(child => child.as.node.nodeName === 'root', true, true)
    if (!n2) throw new Error('node is undefined')
    expect(n2.as.node).toBe(root.as.node)
  })

  test('filter()', () => {
    const root = $$.document().ele('root')
    const node1 = root.ele('node1')
    const node2 = root.ele('diode2')
    const node3 = root.ele('node3')
    const arr = root.filter(child => child.as.node.nodeName.startsWith('n'))
    expect(arr.map(n => n.as.node)).toEqual([node1.as.node, node3.as.node])
  })

  test('filter() - self and recursive', () => {
    const root = $$.document().ele('root')
    const node1 = root.ele('node1')
    const child = node1.ele('child')
    const node2 = root.ele('diode2')
    const node3 = root.ele('node3')
    const arr = root.filter(child => child.as.node.nodeName.startsWith('n'), true, true)
    expect(arr.map(n => n.as.node)).toEqual([node1.as.node, node3.as.node])
  })
  
  test('every()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    const test1 = root.every(child => child.as.node.nodeName.startsWith('n'))
    expect(test1).toBe(true)
    const test2 = root.every(child => child.as.node.nodeName.startsWith('n'), true)
    expect(test2).toBe(false)
  })

  test('every() - self and recursive', () => {
    const root = $$.document().ele('nut')
    const node1 = root.ele('node1')
    const child = node1.ele('nils')
    const node2 = root.ele('node2')
    const node3 = root.ele('node3')
    const test1 = root.every(child => child.as.node.nodeName.startsWith('n'), true, true)
    expect(test1).toBe(true)
    const test2 = root.every(child => child.as.node.nodeName.endsWith('n'), true, true)
    expect(test2).toBe(false)
  })

  test('some()', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('diode2').up()
      .ele('node3').up()
    const test1 = root.some(child => child.as.node.nodeName.startsWith('n'))
    expect(test1).toBe(true)
    const test2 = root.some(child => child.as.node.nodeName.startsWith('x'), true)
    expect(test2).toBe(false)
  })

  test('some() - self and recursive', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('diode2').up()
      .ele('node3').up()
    const test1 = root.some(child => child.as.node.nodeName.startsWith('n'), true, true)
    expect(test1).toBe(true)
    const test2 = root.some(child => child.as.node.nodeName.startsWith('x'), true, true)
    expect(test2).toBe(false)
  })
  
  test('toArray()', () => {
    const root = $$.document().ele('root')
    const node1 = root.ele('node1')
    const node2 = root.ele('node2')
    const node3 = root.ele('node3')
    const arr = root.toArray()
    expect(arr.map(n => n.as.node)).toEqual([node1.as.node, node2.as.node, node3.as.node])
  })

  test('toArray() - self and recursive', () => {
    const root = $$.document().ele('root')
    const node1 = root.ele('node1')
    const child = node1.ele('child')
    const node2 = root.ele('node2')
    const node3 = root.ele('node3')
    const arr = root.toArray(true, true)
    expect(arr.map(n => n.as.node)).toEqual([root.as.node, node1.as.node, child.as.node, node2.as.node, node3.as.node])
  })

  test('this inside callback', () => {
    const root = $$.document().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    
    root.each(function(this: number) { expect(this).toBe(42) }, false, false, 42)
  })

})
