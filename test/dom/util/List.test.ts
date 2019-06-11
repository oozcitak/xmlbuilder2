import $$ from '../TestHelpers'
import { List } from '../../../src/dom/util/List'

describe('List', function () {

  test('append()', function () {
    const node = new $$.Element(null, 'node', '')
    const child1 = new $$.Text(null, 'text1')
    const child2 = new $$.Text(null, 'text2')

    expect(node.childNodes.length).toBe(0)
    List.append(child1, node)
    expect(node.childNodes.length).toBe(1)
    List.append(child2, node)
    expect(node.childNodes.length).toBe(2)
    List.append(child2, node)
    expect(node.childNodes.length).toBe(2)

    expect($$.printTree(node)).toBe($$.t`
      node
        # text1
        # text2
      `)
  })

  test('insert()', function () {
    const node = new $$.Element(null, 'node', '')
    const child1 = new $$.Text(null, 'text1')
    const child2 = new $$.Text(null, 'text2')

    expect(node.childNodes.length).toBe(0)
    List.insert(child1, node, null)
    expect(node.childNodes.length).toBe(1)
    List.insert(child2, node, child1)
    expect(node.childNodes.length).toBe(2)
    List.insert(child2, node, child1)
    expect(node.childNodes.length).toBe(2)

    expect($$.printTree(node)).toBe($$.t`
      node
        # text2
        # text1
      `)
  })

  test('remove()', function () {
    const node = new $$.Element(null, 'node', '')
    const child1 = new $$.Text(null, 'text1')
    const child2 = new $$.Text(null, 'text2')
    List.append(child1, node)
    List.append(child2, node)

    expect(node.childNodes.length).toBe(2)
    List.remove(child1, node)
    expect(node.childNodes.length).toBe(1)
    List.remove(child2, node)
    expect(node.childNodes.length).toBe(0)
    List.remove(child2, node)

    expect($$.printTree(node)).toBe($$.t`
      node
      `)
  })

})