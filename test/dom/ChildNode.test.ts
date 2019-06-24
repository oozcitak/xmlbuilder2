import $$ from './TestHelpers'

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
      !DOCTYPE qname PUBLIC pubid sysid
      n:root (ns:myns)
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

  test('before() with single node', function () {
    const doc = $$.dom.createDocument('myns', 'n:root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele = doc.createElement('ele')
    de.appendChild(ele)
    const txt = doc.createTextNode('txt')
    de.appendChild(txt)
    
    ele.before('text1')
    txt.before('text2')

    expect($$.printTree(doc)).toBe($$.t`
      n:root (ns:myns)
        # text1
        ele
        # text2
        # txt
      `)
  })

  test('before() with own node', function () {
    const doc = $$.dom.createDocument('myns', 'n:root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele1 = doc.createElement('ele1')
    const ele2 = doc.createElement('ele2')
    const ele3 = doc.createElement('ele3')
    const ele4 = doc.createElement('ele4')
    de.appendChild(ele1)
    de.appendChild(ele2)
    de.appendChild(ele3)
    de.appendChild(ele4)
    
    ele4.before(ele3, ele2, ele1)

    expect($$.printTree(doc)).toBe($$.t`
      n:root (ns:myns)
        ele3
        ele2
        ele1
        ele4
      `)
  })

  test('before() with removed node', function () {
    const doc = $$.dom.createDocument('myns', 'n:root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele1 = doc.createElement('ele1')
    const ele2 = doc.createElement('ele2')
    const ele3 = doc.createElement('ele3')
    const ele4 = doc.createElement('ele4')
    de.appendChild(ele1)
    de.appendChild(ele2)
    de.appendChild(ele3)
    de.appendChild(ele4)

    ele4.remove()
    // no-op
    ele4.before(ele1)

    expect($$.printTree(doc)).toBe($$.t`
      n:root (ns:myns)
        ele1
        ele2
        ele3
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
      !DOCTYPE qname PUBLIC pubid sysid
      ! comment1
      n:root (ns:myns)
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

  test('after() with own node', function () {
    const doc = $$.dom.createDocument('myns', 'n:root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele1 = doc.createElement('ele1')
    const ele2 = doc.createElement('ele2')
    const ele3 = doc.createElement('ele3')
    const ele4 = doc.createElement('ele4')
    de.appendChild(ele1)
    de.appendChild(ele2)
    de.appendChild(ele3)
    de.appendChild(ele4)
    
    ele1.after(ele4, ele3, ele2)

    expect($$.printTree(doc)).toBe($$.t`
      n:root (ns:myns)
        ele1
        ele4
        ele3
        ele2
      `)
  })

  test('after() with removed node', function () {
    const doc = $$.dom.createDocument('myns', 'n:root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele1 = doc.createElement('ele1')
    const ele2 = doc.createElement('ele2')
    const ele3 = doc.createElement('ele3')
    const ele4 = doc.createElement('ele4')
    de.appendChild(ele1)
    de.appendChild(ele2)
    de.appendChild(ele3)
    de.appendChild(ele4)

    ele4.remove()
    // no-op
    ele4.after(ele1)

    expect($$.printTree(doc)).toBe($$.t`
      n:root (ns:myns)
        ele1
        ele2
        ele3
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
      n:root (ns:myns)
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

  test('replaceWith() with own node', function () {
    const doc = $$.dom.createDocument('myns', 'n:root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele1 = doc.createElement('ele1')
    const ele2 = doc.createElement('ele2')
    const ele3 = doc.createElement('ele3')
    const ele4 = doc.createElement('ele4')
    de.appendChild(ele1)
    de.appendChild(ele2)
    de.appendChild(ele3)
    de.appendChild(ele4)
    
    ele1.replaceWith(ele4, ele3, ele2)

    expect($$.printTree(doc)).toBe($$.t`
      n:root (ns:myns)
        ele4
        ele3
        ele2
      `)
  })

  test('replaceWith() with self node', function () {
    const doc = $$.dom.createDocument('myns', 'n:root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele1 = doc.createElement('ele1')
    const ele2 = doc.createElement('ele2')
    const ele3 = doc.createElement('ele3')
    const ele4 = doc.createElement('ele4')
    de.appendChild(ele1)
    de.appendChild(ele2)
    de.appendChild(ele3)
    de.appendChild(ele4)
    
    ele1.replaceWith(ele4, ele3, ele2, ele1)

    expect($$.printTree(doc)).toBe($$.t`
      n:root (ns:myns)
        ele4
        ele3
        ele2
        ele1
      `)
  })

  test('replaceWith() with removed node', function () {
    const doc = $$.dom.createDocument('myns', 'n:root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele1 = doc.createElement('ele1')
    const ele2 = doc.createElement('ele2')
    const ele3 = doc.createElement('ele3')
    const ele4 = doc.createElement('ele4')
    de.appendChild(ele1)
    de.appendChild(ele2)
    de.appendChild(ele3)
    de.appendChild(ele4)

    ele4.remove()
    // no-op
    ele4.replaceWith(ele1)

    expect($$.printTree(doc)).toBe($$.t`
      n:root (ns:myns)
        ele1
        ele2
        ele3
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
      n:root (ns:myns)
      `)
  })

  test('remove() with removed node', function () {
    const doc = $$.dom.createDocument('myns', 'n:root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele1 = doc.createElement('ele1')
    const ele2 = doc.createElement('ele2')
    const ele3 = doc.createElement('ele3')
    const ele4 = doc.createElement('ele4')
    de.appendChild(ele1)
    de.appendChild(ele2)
    de.appendChild(ele3)
    de.appendChild(ele4)

    ele4.remove()
    // no-op
    ele4.remove()

    expect($$.printTree(doc)).toBe($$.t`
      n:root (ns:myns)
        ele1
        ele2
        ele3
      `)
  })

})