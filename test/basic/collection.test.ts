import $$ from '../TestHelpers'

describe('collection', () => {

  test('each()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    let str = ''
    root.each(child => str += child.node.nodeName)
    expect(str).toBe('node1node2node3')
  })

  test('each() - single node', () => {
    const root = $$.create().ele('root')
    let str = ''
    root.each(child => str += child.node.nodeName, true, true)
    expect(str).toBe('root')
  })

  test('each() - recursive', () => {
    const root = $$.create().ele('root')
      .ele('node1')
        .ele('child').up()
      .up()
      .ele('node2').up()
      .ele('node3').up()
    let str = ''
    root.each(child => str += child.node.nodeName, false, true)
    expect(str).toBe('node1childnode2node3')
  })

  test('each() - self and recursive', () => {
    const root = $$.create().ele('root')
      .ele('node1')
        .ele('child')
          .ele('grandchild').up()
        .up()
      .up()
      .ele('node2').up()
      .ele('node3').up()
    let str = ''
    root.each(child => str += child.node.nodeName + ' ', true, true)
    expect(str).toBe('root node1 child grandchild node2 node3 ')
  })

  test('map()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    const arr = root.map(child => child.node.nodeName)
    expect(arr).toEqual(['node1', 'node2', 'node3'])
  })

  test('map() - self and recursive', () => {
    const root = $$.create().ele('root')
      .ele('node1')
        .ele('child').up()
      .up()
      .ele('node2').up()
      .ele('node3').up()
    const arr = root.map(child => child.node.nodeName, true, true)
    expect(arr).toEqual(['root', 'node1', 'child', 'node2', 'node3'])
  })

  test('reduce()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    const str = root.reduce((value, child) => value + child.node.nodeName, '')
    expect(str).toBe('node1node2node3')
  })

  test('reduce() - self and recursive', () => {
    const root = $$.create().ele('root')
      .ele('node1')
        .ele('child').up()
      .up()
      .ele('node2').up()
      .ele('node3').up()
    const str = root.reduce((value, child) => value + child.node.nodeName, '', true, true)
    expect(str).toBe('rootnode1childnode2node3')
  })

  test('find()', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    const node2 = root.ele('node2')
    const node3 = root.ele('node3')
    const n1 = root.find(child => child.node.nodeName === 'node2')
    if (!n1) throw new Error('node is undefined')
    expect(n1.node).toBe(node2.node)
    const n2 = root.find(child => child.node.nodeName === 'x')
    expect(n2).toBeUndefined()
  })

  test('find() - self and recursive', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    const child = node1.ele('child')
    const node2 = root.ele('node2')
    const node3 = root.ele('node3')
    const n1 = root.find(child => child.node.nodeName === 'child', true, true)
    if (!n1) throw new Error('node is undefined')
    expect(n1.node).toBe(child.node)
    const n2 = root.find(child => child.node.nodeName === 'root', true, true)
    if (!n2) throw new Error('node is undefined')
    expect(n2.node).toBe(root.node)
  })

  test('filter()', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    const node2 = root.ele('diode2')
    const node3 = root.ele('node3')
    const arr = root.filter(child => child.node.nodeName.startsWith('n'))
    expect(arr.map(n => n.node)).toEqual([node1.node, node3.node])
  })

  test('filter() - self and recursive', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    const child = node1.ele('child')
    const node2 = root.ele('diode2')
    const node3 = root.ele('node3')
    const arr = root.filter(child => child.node.nodeName.startsWith('n'), true, true)
    expect(arr.map(n => n.node)).toEqual([node1.node, node3.node])
  })
  
  test('every()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    const test1 = root.every(child => child.node.nodeName.startsWith('n'))
    expect(test1).toBe(true)
    const test2 = root.every(child => child.node.nodeName.startsWith('n'), true)
    expect(test2).toBe(false)
  })

  test('every() - self and recursive', () => {
    const root = $$.create().ele('nut')
    const node1 = root.ele('node1')
    const child = node1.ele('nils')
    const node2 = root.ele('node2')
    const node3 = root.ele('node3')
    const test1 = root.every(child => child.node.nodeName.startsWith('n'), true, true)
    expect(test1).toBe(true)
    const test2 = root.every(child => child.node.nodeName.endsWith('n'), true, true)
    expect(test2).toBe(false)
  })

  test('some()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('diode2').up()
      .ele('node3').up()
    const test1 = root.some(child => child.node.nodeName.startsWith('n'))
    expect(test1).toBe(true)
    const test2 = root.some(child => child.node.nodeName.startsWith('x'), true)
    expect(test2).toBe(false)
  })

  test('some() - self and recursive', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('diode2').up()
      .ele('node3').up()
    const test1 = root.some(child => child.node.nodeName.startsWith('n'), true, true)
    expect(test1).toBe(true)
    const test2 = root.some(child => child.node.nodeName.startsWith('x'), true, true)
    expect(test2).toBe(false)
  })
  
  test('toArray()', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    const node2 = root.ele('node2')
    const node3 = root.ele('node3')
    const arr = root.toArray()
    expect(arr.map(n => n.node)).toEqual([node1.node, node2.node, node3.node])
  })

  test('toArray() - self and recursive', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    const child = node1.ele('child')
    const node2 = root.ele('node2')
    const node3 = root.ele('node3')
    const arr = root.toArray(true, true)
    expect(arr.map(n => n.node)).toEqual([root.node, node1.node, child.node, node2.node, node3.node])
  })

  test('this inside callback', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()
      .ele('node3').up()
    
    root.each(function(this: number) { expect(this).toBe(42) }, false, false, 42)
  })

  test('each() index and level', () => {
    const root = $$.create().ele('node1')
      .ele('node11')
        .ele('node111')
          .ele('node1111').up()
        .up()
      .up()
      .ele('node12')
        .ele('node121').up()
      .up()
      .ele('node13').up()
    const names: string[] = []
    const indices: number[] = []
    const levels: number[] = []
    root.each((child, index, level) => {
      names.push(child.node.nodeName)
      indices.push(index)
      levels.push(level)
    }, true, true)
    expect(names.join(" ")).toBe("node1 node11 node111 node1111 node12 node121 node13")
    expect(indices.join(" ")).toBe("0 0 0 0 1 0 2")
    expect(levels.join(" ")).toBe("0 1 2 3 1 2 1")
  })

})
