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
    
    ele.before(doc.createElement('node1'), 
      doc.createTextNode('text1'), 
      'text2', 
      doc.createTextNode('text3'), 
      doc.createElement('node2'))

    txt.before(doc.createElement('node1'),
      doc.createTextNode('text1'), 
      'text2', 
      doc.createTextNode('text3'), 
      doc.createElement('node2'))

    doctype.before(doc.createComment('comment1'))

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

  test('after()', function () {
    const doctype = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
    const doc = $$.dom.createDocument('myns', 'n:root', doctype)
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele = doc.createElement('ele')
    de.appendChild(ele)
    const txt = doc.createTextNode('txt')
    de.appendChild(txt)
    
    ele.after(doc.createElement('node1'), 
      doc.createTextNode('text1'), 
      'text2', 
      doc.createTextNode('text3'), 
      doc.createElement('node2'))
      
    txt.after(doc.createElement('node1'),
      doc.createTextNode('text1'), 
      'text2', 
      doc.createTextNode('text3'), 
      doc.createElement('node2'))

    doctype.after(doc.createComment('comment1'))

    expect($$.printTree(doc)).toBe($$.t`
      !DOCTYPE qname PUBLIC pubid SYSTEM sysid
      ! comment1
      n:root
        ele
        node1
        # text1
        # text2
        # text3
        node2
        # txt
        node1
        # text1
        # text2
        # text3
        node2
      `)
  })

  test('replaceWith()', function () {
    const doctype = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
    const doc = $$.dom.createDocument('myns', 'n:root', doctype)
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele = doc.createElement('ele')
    de.appendChild(ele)
    const txt = doc.createTextNode('txt')
    de.appendChild(txt)
    
    ele.replaceWith(doc.createElement('node1'), 
      doc.createTextNode('text1'), 
      'text2', 
      doc.createTextNode('text3'), 
      doc.createElement('node2'))
      
    txt.replaceWith(doc.createElement('node1'),
      doc.createTextNode('text1'), 
      'text2', 
      doc.createTextNode('text3'), 
      doc.createElement('node2'))

    doctype.replaceWith(doc.createComment('comment1'))

    expect($$.printTree(doc)).toBe($$.t`
      ! comment1
      n:root
        node1
        # text1
        # text2
        # text3
        node2
        node1
        # text1
        # text2
        # text3
        node2
      `)
  })

  test('remove()', function () {
    const doctype = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
    const doc = $$.dom.createDocument('myns', 'n:root', doctype)
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele = doc.createElement('ele')
    de.appendChild(ele)
    const txt = doc.createTextNode('txt')
    de.appendChild(txt)
    
    ele.remove()
    txt.remove()
    doctype.remove()

    expect($$.printTree(doc)).toBe($$.t`
      n:root
      `)
  })

})