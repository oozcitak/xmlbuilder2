import $$ from '../TestHelpers'
import { WhatToShow, FilterResult } from '../../../src/dom/interfaces'
import { Traverse } from '../../../src/dom/util/Traverse'

describe('Traverse', function () {

  const doc = $$.dom.createDocument(null, 'root')
  const root = doc.documentElement
  if (!root)
    throw new Error("documentElement is null")

  const node1 = doc.createElement('node1')
  root.appendChild(node1)
  const child1 = doc.createElement('child1')
  node1.appendChild(child1)
  node1.appendChild(doc.createTextNode('text'))
  const child2 = doc.createElement('child2')
  node1.appendChild(child2)
  node1.appendChild(doc.createComment('comment'))
  const node2 = doc.createElement('node2')
  root.appendChild(node2)
  const node3 = doc.createElement('node3')
  root.appendChild(node3)
  const child31 = doc.createElement('child3_1')
  node3.appendChild(child31)
  child31.appendChild(doc.createElement('child3_1_1'))
  child31.appendChild(doc.createElement('child3_1_2'))
  const child32 = doc.createElement('child3_2')
  node3.appendChild(child32)

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
    const iter = doc.createTreeWalker(node1, WhatToShow.Element, function (node): FilterResult {
      return node.nodeName.endsWith('1') ? FilterResult.Accept : FilterResult.Reject
    })

    expect(Traverse.filterNode(iter, node1)).toBe(FilterResult.Accept)
  })

  test('filterNode() recursion check', function () {
    const iter = doc.createTreeWalker(node1, WhatToShow.Element, function (node): FilterResult {
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

    let [node, ref, beforeNode] = Traverse.traverse(iter, false)

    expect(node).toBeNull()
    expect(ref).toBe(root)
    expect(beforeNode).toBeTruthy()
  })

  test('traverseChildren() first child', function () {
    const iter = doc.createTreeWalker(root, WhatToShow.Element, function (node): FilterResult {
      return node.nodeName.startsWith('c') ? FilterResult.Accept : FilterResult.Skip
    })

    let [node, ref] = Traverse.traverseChildren(iter, true)

    expect(node).toBe(child1)
    expect(ref).toBe(child1)
  })

  test('traverseChildren() sibling of first child', function () {
    const iter = doc.createTreeWalker(root, WhatToShow.Element, function (node): FilterResult {
      return node.nodeName.startsWith('c') && node.nodeName.endsWith('2') ? FilterResult.Accept : FilterResult.Skip
    })

    let [node, ref] = Traverse.traverseChildren(iter, true)

    expect(node).toBe(child2)
    expect(ref).toBe(child2)
  })

  test('traverseChildren() without matching children null', function () {
    const iter = doc.createTreeWalker(root, WhatToShow.Element, function (node): FilterResult {
      return node.nodeName.startsWith('x') ? FilterResult.Accept : FilterResult.Skip
    })

    let [node, ref] = Traverse.traverseChildren(iter, true)

    expect(node).toBeNull()
  })

  test('traverseChildren() without children returns null', function () {
    const iter = doc.createTreeWalker(child2)

    let [node, ref] = Traverse.traverseChildren(iter, true)

    expect(node).toBeNull()
  })

  test('traverseSiblings() next sibling', function () {
    const iter = doc.createTreeWalker(root, WhatToShow.Element)

    iter.currentNode = node1
    let [node, ref] = Traverse.traverseSiblings(iter, true)

    expect(node).toBe(node2)
  })

  test('traverseSiblings() previous sibling', function () {
    const iter = doc.createTreeWalker(root, WhatToShow.Element)

    iter.currentNode = node2
    let [node, ref] = Traverse.traverseSiblings(iter, false)

    expect(node).toBe(node1)
  })

  test('traverseSiblings() at root returns null', function () {
    const iter = doc.createTreeWalker(root)

    let [node, ref] = Traverse.traverseSiblings(iter, true)

    expect(node).toBeNull()
  })

  test('traverseSiblings() without siblings returns null', function () {
    const iter = doc.createTreeWalker(root)

    iter.currentNode = child32
    let [node, ref] = Traverse.traverseSiblings(iter, true)

    expect(node).toBeNull()
  })

  test('traverseSiblings() without siblings returns null', function () {
    const iter = doc.createTreeWalker(root)

    iter.currentNode = node3
    let [node, ref] = Traverse.traverseSiblings(iter, true)

    expect(node).toBeNull()
  })

})