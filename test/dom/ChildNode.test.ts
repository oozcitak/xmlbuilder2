import $$ from '../TestHelpers'

describe('ChildNode', function () {

  test('before()', function () {
    const doctype = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
    const doc = $$.dom.createDocument('myns', 'n:root', doctype)
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele = doc.createElement('ele')
    de.appendChild(ele)
    const txt = doc.createTextNode('txt')
    de.appendChild(txt)
    
    const nodes1 = [ doc.createElement('node1'), doc.createTextNode('text1'), 'text2', doc.createTextNode('text3'), doc.createElement('node2') ]
    ele.before(nodes1)
    const nodes2 = [ doc.createElement('node1'), doc.createTextNode('text1'), 'text2', doc.createTextNode('text3'), doc.createElement('node2') ]
    txt.before(nodes2)
    const nodes3 = [ doc.createComment('comment1') ]
    doctype.before(nodes3)
    expect($$.printTree(doc)).toBe($$.t`
      ! comment1
      !DOCTYPE qname PUBLIC pubid SYSTEM sysid
      n:root
        node1
        # text1
        # text2
        # text3
        node2
        ele
        node1
        # text1
        # text2
        # text3
        node2
        # txt
      `)
  })

})