import $$ from '../TestHelpers'
import { TreeMutation } from '../../../src/dom/util/TreeMutation'
import { ElementInternal } from '../../../src/dom/interfacesInternal'

describe('TreeMutation', function () {

  test('ensurePreInsertionValidity()', function () {
    const doctype = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    const doc = $$.dom.createDocument('my ns', 'root', doctype)
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele = doc.createElement('element')
    de.appendChild(ele)
    const text = doc.createTextNode('text')
    de.appendChild(text)
    const node = doc.createElement('node')
    const attr = doc.createAttribute('att')

    // Only document, document fragment and element nodes can have
    // child nodes
    expect(() => TreeMutation.preInsert(node, text, null)).toThrow()
    // node should not be an ancestor of parent
    expect(() => TreeMutation.preInsert(de, ele, null)).toThrow()
    // insertion reference child node should be a child node of
    // parent
    expect(() => TreeMutation.preInsert(node, de, node)).toThrow()
    // only document fragment, document type, element, text,
    // processing instruction or comment nodes can be child nodes
    expect(() => TreeMutation.preInsert(attr, de, null)).toThrow()
    // a document node cannot have text child nodes
    expect(() => TreeMutation.preInsert(text, doc, null)).toThrow()
    // a document type node can only be parented to a document
    // node
    expect(() => TreeMutation.preInsert(doctype, de, null)).toThrow()

    // * if inserting under a document node:
    //   a) if node is a document fragment:
    //     it shouldn't have more than one element child
    const frag1 = doc.createDocumentFragment()
    frag1.appendChild(doc.createElement('ele1'))
    frag1.appendChild(doc.createElement('ele2'))
    expect(() => TreeMutation.preInsert(frag1, doc, null)).toThrow()
    //     it is  OK to have multiple comments node for example
    const frag6 = doc.createDocumentFragment()
    frag6.appendChild(doc.createComment('ele1'))
    frag6.appendChild(doc.createComment('ele2'))
    expect(() => TreeMutation.preInsert(frag6, doc, null)).not.toThrow()
    //     it shouldn't have a text child
    const frag2 = doc.createDocumentFragment()
    frag2.appendChild(doc.createTextNode('text'))
    expect(() => TreeMutation.preInsert(frag2, doc, null)).toThrow()
    //     the document shouldn't have an element child if the fragment
    //     contains one
    const frag3 = doc.createDocumentFragment()
    frag3.appendChild(doc.createElement('ele1'))
    expect(() => TreeMutation.preInsert(frag3, doc, null)).toThrow()
    //     the document shouldn't have a doctype child if the fragment
    //     tries to insert an element child before it
    const doctype4 = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    const doc4 = $$.dom.createDocument('my ns', '', doctype4)
    const frag4 = doc4.createDocumentFragment()
    frag4.appendChild(doc4.createElement('ele1'))
    expect(() => TreeMutation.preInsert(frag4, doc4, doctype4)).toThrow()
    //     child shouldn't have a doctype sibling if the fragment
    //     tries to insert an element child before it
    const doc5 = $$.dom.createDocument('my ns', '')
    const com5 = doc5.createComment('comment1')
    const com5a = doc5.createComment('comment2')
    const doctype5 = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    doc5.appendChild(com5)
    doc5.appendChild(com5a)
    doc5.appendChild(doctype5)
    const frag5 = doc5.createDocumentFragment()
    frag5.appendChild(doc5.createElement('ele1'))
    expect(() => TreeMutation.preInsert(frag5, doc5, com5)).toThrow()
    //   b) if node is an element node:
    //     parent document shouldn't already have an element child
    const doc6 = $$.dom.createDocument('my ns', 'root')
    const ele6 = doc6.createElement('ele')
    expect(() => TreeMutation.preInsert(ele6, doc6, null)).toThrow()
    //     cannot insert an element before a doctype node
    const doc7 = $$.dom.createDocument('my ns', '')
    const com7 = doc7.createComment('comment1')
    const com7a = doc7.createComment('comment2')
    const doctype7 = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    doc7.appendChild(com7)
    doc7.appendChild(com7a)
    doc7.appendChild(doctype7)
    const ele7 = doc7.createElement('ele')
    expect(() => TreeMutation.preInsert(ele7, doc7, doctype7)).toThrow()
    //     child shouldn't have a doctype sibling if the element
    //     tries to insert an element child before it
    expect(() => TreeMutation.preInsert(ele7, doc7, com7)).toThrow()
    //   c) if node is a document type node:
    //     parent document shouldn't already have a document type node
    const doc8 = $$.dom.createDocument('my ns', '')
    const doctype8 = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    doc8.appendChild(doctype8)
    const node8 = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    expect(() => TreeMutation.preInsert(node8, doc8, null)).toThrow()
    //     child shouldn't have an element sibling if inserting the 
    //     document type before it
    const doc9 = $$.dom.createDocument('my ns', '')
    const ele9 = doc9.createElement('ele1')
    const ele9a = doc9.createComment('ele2')
    const ele9b = doc9.createComment('ele3')
    doc9.appendChild(ele9)
    doc9.appendChild(ele9a)
    doc9.appendChild(ele9b)
    const node9 = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    expect(() => TreeMutation.preInsert(node9, doc9, ele9b)).toThrow()
    //     parent shouldn't have an element sibling if appending the 
    //     document type to its children
    expect(() => TreeMutation.preInsert(node9, doc9, null)).toThrow()

  })

  test('preInsert()', function () {
    const doc = $$.dom.createDocument('my ns', 'root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele1 = doc.createElement('element1')
    const ele2 = doc.createElement('element2')
    de.appendChild(ele1)
    de.appendChild(ele2)

    TreeMutation.preInsert(ele1, de, ele1)

    expect($$.printTree(doc)).toBe($$.t`
      root (ns:my ns)
        element1
        element2
      `)
  })

  test('replaceNode()', function () {
    // Only document, document fragment and element nodes can have
    // child nodes
    const doc1 = $$.dom.createDocument('my ns', '')
    const ele1 = doc1.createElement('element')
    const com1 = doc1.createComment('comment')
    doc1.appendChild(ele1)
    ele1.appendChild(com1)
    const node1 = doc1.createElement('node')
    expect(() => TreeMutation.replaceNode(com1, node1, com1)).toThrow()
    // node should not be an ancestor of parent
    const doc2 = $$.dom.createDocument('my ns', '')
    const ele2 = doc2.createElement('element')
    const com2 = doc2.createComment('comment')
    doc2.appendChild(ele2)
    ele2.appendChild(com2)
    const node2 = doc2.createElement('node')
    ele2.appendChild(node2)
    expect(() => TreeMutation.replaceNode(com2, ele2, node2)).toThrow()
    // removed child node should be a child node of parent
    const doc3 = $$.dom.createDocument('my ns', '')
    const ele3 = doc3.createElement('element')
    const com3 = doc3.createComment('comment')
    doc3.appendChild(ele3)
    ele3.appendChild(com3)
    const node3 = doc3.createElement('node')
    expect(() => TreeMutation.replaceNode(node3, node3, ele3)).toThrow()
    // only document fragment, document type, element, text,
    // processing instruction or comment nodes can be child nodes
    const doc10 = $$.dom.createDocument('my ns', '')
    const ele10 = doc10.createElement('element')
    const com10 = doc10.createComment('comment')
    doc10.appendChild(ele10)
    ele10.appendChild(com10)
    const node10 = doc10.createAttribute('node')
    expect(() => TreeMutation.replaceNode(com10, node10, ele10)).toThrow()
    // a document node cannot have text child nodes
    const doc15 = $$.dom.createDocument('my ns', '')
    const ele15 = doc10.createElement('element')
    doc15.appendChild(ele15)
    const node15 = doc10.createTextNode('node')
    expect(() => TreeMutation.replaceNode(ele15, node15, doc15)).toThrow()
    // a document type node can only be parented to a document
    // node
    const doc16 = $$.dom.createDocument('my ns', '')
    const ele16 = doc10.createElement('element')
    const com16 = doc10.createComment('comment')
    doc16.appendChild(ele16)
    ele16.appendChild(com16)
    const node16 = $$.dom.createDocumentType('node', 'pub', 'sys')
    expect(() => TreeMutation.replaceNode(com16, node16, ele16)).toThrow()
    // * if inserting under a document node:
    //   a) if node is a document fragment:
    //     it shouldn't have more than one element child
    const doc11 = $$.dom.createDocument('my ns', '')
    const ele11 = doc11.createElement('element')
    doc11.appendChild(ele11)
    const frag11 = doc11.createDocumentFragment()
    frag11.appendChild(doc11.createElement('ele1'))
    frag11.appendChild(doc11.createElement('ele2'))
    expect(() => TreeMutation.replaceNode(ele11, frag11, doc11)).toThrow()
    //     it is  OK to have multiple comments node for example
    const doc12 = $$.dom.createDocument('my ns', '')
    const ele12 = doc12.createElement('element')
    doc12.appendChild(ele12)
    const frag12 = doc12.createDocumentFragment()
    frag12.appendChild(doc12.createComment('ele1'))
    frag12.appendChild(doc12.createComment('ele2'))
    expect(() => TreeMutation.replaceNode(ele12, frag12, doc12)).not.toThrow()
    //     it shouldn't have a text child
    const doc13 = $$.dom.createDocument('my ns', '')
    const ele13 = doc13.createElement('element')
    doc13.appendChild(ele13)
    const frag13 = doc13.createDocumentFragment()
    frag13.appendChild(doc13.createTextNode('text'))
    expect(() => TreeMutation.replaceNode(ele13, frag13, doc13)).toThrow()
    //     the document shouldn't have an element child that is not 
    //     `child` if the fragment contains one
    const doc14 = $$.dom.createDocument('my ns', '')
    doc14.appendChild(doc14.createElement('ele1'))
    const ele14 = doc14.createComment('element')
    doc14.appendChild(ele14)
    const frag14 = doc14.createDocumentFragment()
    frag14.appendChild(doc14.createElement('ele1'))
    expect(() => TreeMutation.replaceNode(ele14, frag14, doc14)).toThrow()
    //     it can be replaced though
    const doc17 = $$.dom.createDocument('my ns', '')
    const ele17 = doc17.createElement('element')
    doc17.appendChild(ele17)
    const frag17 = doc17.createDocumentFragment()
    frag17.appendChild(doc17.createElement('ele1'))
    expect(() => TreeMutation.replaceNode(ele17, frag17, doc17)).not.toThrow()
    //     the document shouldn't have a doctype child if the fragment
    //     tries to insert an element child before it
    const doc4 = $$.dom.createDocument('my ns', '')
    const ele4 = doc4.createComment('element')
    const ele4a = doc4.createComment('element')
    const doctype4 = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    doc4.appendChild(ele4)
    doc4.appendChild(ele4a)
    doc4.appendChild(doctype4)
    const frag4 = doc4.createDocumentFragment()
    frag4.appendChild(doc4.createElement('ele1'))
    expect(() => TreeMutation.replaceNode(ele4, frag4, doc4)).toThrow()
    //   b) if node is an element node:
    //     parent document shouldn't already have an element child that
    //     is not `child`
    const doc6 = $$.dom.createDocument('my ns', '')
    const ele6 = doc6.createComment('element')
    const ele6a = doc6.createElement('element')
    doc6.appendChild(ele6)
    doc6.appendChild(ele6a)
    const node6 = doc6.createElement('ele')
    expect(() => TreeMutation.replaceNode(ele6, node6, doc6)).toThrow()
    //     cannot insert an element before a doctype node
    const doc7 = $$.dom.createDocument('my ns', '')
    const com7 = doc7.createComment('comment1')
    const com7a = doc7.createComment('comment2')
    const doctype7 = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    doc7.appendChild(com7)
    doc7.appendChild(com7a)
    doc7.appendChild(doctype7)
    const ele7 = doc7.createElement('ele')
    expect(() => TreeMutation.replaceNode(com7, ele7, doc7)).toThrow()
    //   c) if node is a document type node:
    //     parent document shouldn't already have a document type node
    //     that is not `child`
    const doc8 = $$.dom.createDocument('my ns', '')
    const com8 = doc8.createComment('comment1')
    const doctype8 = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    doc8.appendChild(com8)
    doc8.appendChild(doctype8)
    const node8 = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    expect(() => TreeMutation.replaceNode(com8, node8, doc8)).toThrow()
    //     child shouldn't have an element sibling if inserting the 
    //     document type before it
    const doc9 = $$.dom.createDocument('my ns', '')
    const ele9 = doc9.createElement('ele1')
    const ele9a = doc9.createComment('ele2')
    const ele9b = doc9.createComment('ele3')
    doc9.appendChild(ele9)
    doc9.appendChild(ele9a)
    doc9.appendChild(ele9b)
    const node9 = $$.dom.createDocumentType('name', 'pubId', 'sysId')
    expect(() => TreeMutation.replaceNode(ele9b, node9, doc9)).toThrow()
    // replace with self
    const doc18 = $$.dom.createDocument('my ns', '')
    const ele18 = doc18.createElement('ele1')
    const ele18a = doc18.createComment('a')
    const ele18b = doc18.createComment('b')
    doc18.appendChild(ele18)
    doc18.appendChild(ele18a)
    doc18.appendChild(ele18b)
    expect($$.printTree(doc18)).toBe($$.t`
      ele1
      ! a
      ! b
      `)
    TreeMutation.replaceNode(ele18a, ele18b, doc18)
    expect($$.printTree(doc18)).toBe($$.t`
      ele1
      ! b
      `)
  })

  test('replaceAllNode()', function () {
    const doc5 = $$.dom.createDocument('my ns', '')
    const ele5 = doc5.createElement('ele1')
    const ele5a = doc5.createComment('ele2')
    const ele5b = doc5.createComment('ele3')
    doc5.appendChild(ele5)
    ele5.appendChild(ele5a)
    ele5.appendChild(ele5b)
    // replace with document fragment
    const doc2 = $$.dom.createDocument('my ns', '')
    const ele2 = doc5.createElement('ele1')
    const ele2a = doc5.createComment('ele2')
    const ele2b = doc5.createComment('ele3')
    doc2.appendChild(ele2)
    ele2.appendChild(ele2a)
    ele2.appendChild(ele2b)
    const node2 = doc5.createDocumentFragment()
    const node2a = doc5.createComment('node2')
    const node2b = doc5.createComment('node3')
    node2.appendChild(node2a)
    node2.appendChild(node2b)
    expect($$.printTree(doc2)).toBe($$.t`
      ele1
        ! ele2
        ! ele3
      `)
    TreeMutation.replaceAllNode(node2, ele2)
    expect($$.printTree(doc2)).toBe($$.t`
      ele1
        ! node2
        ! node3
      `)
  })

  test('preRemoveNode()', function () {
    // node should be a child of parent
    const doc1 = $$.dom.createDocument('my ns', '')
    const ele1 = doc1.createElement('ele1')
    const node1 = doc1.createElement('name')
    expect(() => TreeMutation.preRemoveNode(node1, ele1)).toThrow()
    // remove node
    const doc2 = $$.dom.createDocument('my ns', '')
    const ele2 = doc1.createElement('ele1')
    doc2.appendChild(ele2)
    expect($$.printTree(doc2)).toBe($$.t`
      ele1
      `)
    TreeMutation.preRemoveNode(ele2, doc2)
    expect($$.printTree(doc2)).toBe($$.t`
      `)
  })

})