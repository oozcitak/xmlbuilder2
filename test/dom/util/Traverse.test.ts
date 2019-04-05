import $$ from '../../TestHelpers'
import { WhatToShow, FilterResult } from '../../../src/dom/interfaces'
import { Traverse } from '../../../src/dom/util/Traverse'

describe('Traverse', function () {

  const doc = $$.dom.createDocument('', 'root')
  const root = doc.documentElement
  if (!root)
    throw new Error("documentElement is null")

  const node1 = doc.createElement('node1')
  root.appendChild(node1)
  node1.appendChild(doc.createElement('child1'))
  node1.appendChild(doc.createTextNode('text'))
  node1.appendChild(doc.createElement('child2'))
  node1.appendChild(doc.createComment('comment'))
  root.appendChild(doc.createElement('node2'))
  const node3 = doc.createElement('node3')
  root.appendChild(node3)
  const child31 = doc.createElement('child3_1')
  node3.appendChild(child31)
  child31.appendChild(doc.createElement('child3_1_1'))
  child31.appendChild(doc.createElement('child3_1_2'))
  node3.appendChild(doc.createElement('child3_2'))

  expect($$.printTree(doc)).toBe($$.t`
    root
      node1
        child1
        # text
        child2
        ! comment
      node2
      node3
        child3_1
          child3_1_1
          child3_1_2
        child3_2
    `)

  test('filterNode()', function () {
    const iter = doc.createTreeWalker(node1, WhatToShow.Element, function(node): FilterResult {
      return node.nodeName.endsWith('1') ? FilterResult.Accept : FilterResult.Reject
    })

    expect(Traverse.filterNode(iter, node1)).toBe(FilterResult.Accept)
  })

  test('filterNode() recursion check', function () {
    const iter = doc.createTreeWalker(node1, WhatToShow.Element, function(node): FilterResult {
      return Traverse.filterNode(iter, node1)
    })

    expect(() => Traverse.filterNode(iter, node1)).toThrow()
  })

  test('traverse() forward', function () {
    const iter = doc.createNodeIterator(root, WhatToShow.Element)

    iter.nextNode() // skip root
    let [node, ref, beforeNode] = Traverse.traverse(iter, true)

    expect(node).toBe(node1)
    expect(ref).toBe(node1)
    expect(beforeNode).toBe(false)
  })

  test('traverse() backward', function () {
    const iter = doc.createNodeIterator(root, WhatToShow.Element)

    iter.previousNode() // skip root
    let [node, ref, beforeNode] = Traverse.traverse(iter, false)

    expect(node).toBeNull()
    expect(ref).toBe(root)
    expect(beforeNode).toBeTruthy()
  })

})