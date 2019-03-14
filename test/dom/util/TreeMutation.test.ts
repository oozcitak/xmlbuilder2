import $$ from '../../TestHelpers'
import { TreeMutation } from '../../../src/dom/util/TreeMutation';

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
    const com7 = doc5.createComment('comment1')
    const com7a = doc5.createComment('comment2')
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


})