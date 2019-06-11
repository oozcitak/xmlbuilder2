import $$ from './TestHelpers'

describe('Element', function () {

  const doc = $$.dom.createDocument('myns', 'root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const de = doc.documentElement

  const ele1 = doc.createElementNS('myns', 'n:root')
  de.appendChild(ele1)
  ele1.id = 'uniq'
  ele1.setAttribute('att1', 'value1')
  ele1.setAttribute('att2', 'value2')
  ele1.setAttributeNS('http://www.w3.org/1999/xhtml', 'ns:name', 'value')
  const ele2 = doc.createElement('withclass')
  de.appendChild(ele2)
  ele2.setAttribute('class', 'a b c')
  const ele3 = doc.createElement('withslot')
  de.appendChild(ele3)
  ele3.setAttribute('slot', 'x')
  const ele4 = doc.createElement('withtext')
  de.appendChild(ele4)
  ele4.appendChild(doc.createTextNode('master'))
  ele4.appendChild(doc.createTextNode('of'))
  ele4.appendChild(doc.createComment('puppity'))
  ele4.appendChild(doc.createTextNode('puppets'))
  const ele5 = doc.createElement('tag')
  de.appendChild(ele5)
  ele5.setAttribute('att1', 'value1')
  ele5.setAttribute('att2', 'value2')
  ele5.appendChild(doc.createTextNode('has'))
  ele5.appendChild(doc.createTextNode('text'))
  ele5.appendChild(doc.createProcessingInstruction('this', 'one'))
  const ele6 = doc.createElement('tag')
  de.appendChild(ele6)
  ele6.setAttribute('att1', 'value1')
  ele6.setAttribute('att2', 'value2')
  ele6.appendChild(doc.createTextNode('has'))
  ele6.appendChild(doc.createTextNode('text'))
  ele6.appendChild(doc.createProcessingInstruction('this', 'one'))

  test('constructor()', function () {
    expect(ele1.nodeType).toBe(1)
    expect(ele1.nodeName).toBe('n:root')
    expect(ele1.tagName).toBe('n:root')
    expect(ele1.namespaceURI).toBe('myns')
    expect(ele1.prefix).toBe('n')
    expect(ele1.localName).toBe('root')
  })

  test('id', function () {
    expect(ele1.id).toBe('uniq')
    ele1.id = 'N0M'
    expect(ele1.id).toBe('N0M')
  })

  test('className', function () {
    expect(ele2.className).toBe('a b c')
    ele2.className = 'd e f'
    expect(ele2.className).toBe('d e f')
    expect(ele1.className).toBe('')
    expect(ele1.slot).toBe('')
  })

  test('classList', function () {
    expect(ele2.classList.length).toBe(3)
  })

  test('slot', function () {
    expect(ele3.slot).toBe('x')
    ele3.slot = 'z'
    expect(ele3.slot).toBe('z')
  })

  test('attributes', function () {
    expect(ele1.attributes.length).toBe(4)
  })

  test('hasAttributes()', function () {
    expect(ele1.hasAttributes()).toBeTruthy()
    expect(ele4.hasAttributes()).toBeFalsy()
  })

  test('getAttributeNames()', function () {
    expect(ele1.getAttributeNames()).toEqual(['id', 'att1', 'att2', 'ns:name'])
  })

  test('getAttribute()', function () {
    expect(ele1.getAttribute('att1')).toBe('value1')
  })

  test('getAttributeNS()', function () {
    expect(ele1.getAttributeNS('http://www.w3.org/1999/xhtml', 'name')).toBe('value')
    expect(ele1.getAttributeNS('my ns', 'non')).toBeNull()
  })

  test('setAttribute()', function () {
    ele1.setAttribute('att1', 'newvalue1')
    expect(ele1.getAttribute('att1')).toBe('newvalue1')
    ele1.setAttribute('att100', 'newvalue100')
    expect(ele1.attributes.length).toBe(5)
    expect(ele1.getAttribute('att100')).toBe('newvalue100')
  })

  test('setAttributeNS()', function () {
    ele1.setAttributeNS('http://www.w3.org/1999/xhtml', 'name', 'newvalue')
    expect(ele1.getAttributeNS('http://www.w3.org/1999/xhtml', 'name')).toBe('newvalue')
    ele1.setAttributeNS('http://www.w3.org/1999/xhtml', 'name101', 'newvalue101')
    expect(ele1.attributes.length).toBe(6)
    expect(ele1.getAttributeNS('http://www.w3.org/1999/xhtml', 'name101')).toBe('newvalue101')
  })

  test('removeAttribute()', function () {
    ele1.removeAttribute('att100')
    expect(ele1.attributes.length).toBe(5)
  })

  test('removeAttributeNS()', function () {
    ele1.removeAttributeNS('http://www.w3.org/1999/xhtml', 'name101')
    expect(ele1.attributes.length).toBe(4)
  })

  test('hasAttribute()', function () {
    expect(ele1.hasAttribute('att1')).toBeTruthy()
    expect(ele1.hasAttribute('nope')).toBeFalsy()
  })

  test('hasAttributeNS()', function () {
    expect(ele1.hasAttributeNS('http://www.w3.org/1999/xhtml', 'name')).toBeTruthy()
    expect(ele1.hasAttributeNS('http://www.w3.org/1999/xhtml', 'nope')).toBeFalsy()
  })

  test('getAttributeNode()', function () {
    const attr = ele1.getAttributeNode('att1')
    expect(attr).not.toBeNull()
    if (attr) {
      expect(attr.value).toBe('newvalue1')
    }
    expect(ele1.getAttributeNode('none')).toBeNull()
  })

  test('getAttributeNodeNS()', function () {
    const attr = ele1.getAttributeNodeNS('http://www.w3.org/1999/xhtml', 'name')
    expect(attr).not.toBeNull()
    if (attr) {
      expect(attr.value).toBe('newvalue')
    }
    expect(ele1.getAttributeNodeNS('http://www.w3.org/1999/xhtml', 'none')).toBeNull()
  })

  test('setAttributeNode()', function () {
    const newAttr = doc.createAttribute('att1')
    newAttr.value = 'newold'
    ele1.setAttributeNode(newAttr)
    expect(ele1.getAttribute('att1')).toBe('newold')
    const newAttr2 = doc.createAttribute('newatt')
    newAttr2.value = 'brandnew'
    ele1.setAttributeNode(newAttr2)
    expect(ele1.attributes.length).toBe(5)
    expect(ele1.getAttribute('newatt')).toBe('brandnew')
  })

  test('setAttributeNS()', function () {
    const newAttr = doc.createAttributeNS('http://www.w3.org/1999/xhtml', 'name')
    newAttr.value = 'newold'
    ele1.setAttributeNodeNS(newAttr)
    expect(ele1.getAttributeNS('http://www.w3.org/1999/xhtml', 'name')).toBe('newold')
    const newAttr2 = doc.createAttributeNS('http://www.w3.org/1999/xhtml', 'newatt')
    newAttr2.value = 'brandnew'
    ele1.setAttributeNodeNS(newAttr2)
    expect(ele1.attributes.length).toBe(6)
    expect(ele1.getAttributeNS('http://www.w3.org/1999/xhtml', 'newatt')).toBe('brandnew')
  })

  test('removeAttributeNode()', function () {
    const newAttr = ele1.getAttributeNode('newatt')
    if (newAttr) {
      ele1.removeAttributeNode(newAttr)
    }
    expect(ele1.attributes.length).toBe(5)
    const newAttr2 = ele1.getAttributeNodeNS('http://www.w3.org/1999/xhtml', 'newatt')
    if (newAttr2) {
      ele1.removeAttributeNode(newAttr2)
    }
    expect(ele1.attributes.length).toBe(4)
  })

  test('textContent', function () {
    expect(ele4.textContent).toBe('masterofpuppets')
    ele4.textContent = 'masterofbobbitts'
    expect(ele4.childNodes.length).toBe(1)
    const txt = ele4.firstChild
    if(!txt)
      throw new Error("Text node  empty")
    expect(txt.textContent).toBe('masterofbobbitts')
  })

  test('textContent with empty child', function () {
    const doct = $$.dom.createDocument('myns', 'root')

    if (!doct.documentElement)
      throw new Error("documentElement is null")
  
    const node = doct.createProcessingInstruction('program', 'instruction')
    doct.documentElement.appendChild(doc.createTextNode('a'))
    doct.documentElement.appendChild(doc.createTextNode(''))
    doct.documentElement.appendChild(doc.createTextNode('b'))
    doct.documentElement.appendChild(doc.createComment('comment'))
    doct.documentElement.appendChild(doc.createTextNode('c'))
  
    expect(doct.documentElement.textContent).toBe('abc')
  })

  test('textContent with empty content', function () {
    const doct = $$.dom.createDocument('myns', 'root')

    if (!doct.documentElement)
      throw new Error("documentElement is null")
  
    const node = doct.createProcessingInstruction('program', 'instruction')
    doct.documentElement.appendChild(doc.createTextNode('a'))
    doct.documentElement.appendChild(doc.createTextNode(''))
    doct.documentElement.appendChild(doc.createTextNode('b'))
    doct.documentElement.appendChild(doc.createComment('comment'))
    doct.documentElement.appendChild(doc.createTextNode('c'))
    doct.documentElement.textContent = null
    expect(doct.documentElement.textContent).toBe('')
  })

  test('closest()', function () {
    expect(() => ele1.closest('*')).toThrow()
  })

  test('matches()', function () {
    expect(() => ele1.matches('*')).toThrow()
  })

  test('cloneNode()', function () {
    const clonedNode = <any>ele5.cloneNode()
    expect(clonedNode.attributes.length).toBe(2)
    expect(clonedNode.childNodes.length).toBe(0)
    const clonedNodeDeep = <any>ele5.cloneNode(true)
    expect(clonedNodeDeep.attributes.length).toBe(2)
    expect(clonedNodeDeep.childNodes.length).toBe(3)
  })

  test('isEqualNode()', function () {
    expect(ele5.isEqualNode(ele6)).toBeTruthy()
    expect(ele5.isEqualNode(ele1)).toBeFalsy()

    const en_ele1 = doc.createElementNS('ns1', 'p1:name1')
    const en_ele2 = doc.createElementNS('ns2', 'p2:name2')
    expect(en_ele1.isEqualNode(en_ele2)).toBeFalsy()

    const en_ele3 = doc.createElementNS('ns1', 'p1:name1')
    en_ele3.setAttributeNS('ns1', 'n1:name1', 'val1')
    const en_ele4 = doc.createElementNS('ns1', 'p1:name1')
    en_ele4.setAttributeNS('ns2', 'n2:name2', 'val2')
    expect(en_ele3.isEqualNode(en_ele4)).toBeFalsy()
  })

  test('getElementsByTagName()', function () {
    expect(de.getElementsByTagName('withtext')[0]).toBe(ele4)
  })

  test('getElementsByTagNameNS()', function () {
    expect(de.getElementsByTagNameNS('myns', 'root')[0]).toBe(ele1)
  })

  test('getElementsByClassName()', function () {
    expect(de.getElementsByClassName('d e f')[0]).toBe(ele2)
  })

  test('insertAdjacentElement()', function () {
    const iaedoc = $$.dom.createDocument(null, 'root')

    if (!iaedoc.documentElement)
      throw new Error("documentElement is null")

    const iaede = iaedoc.documentElement
    const ele = doc.createElement('node')
    iaede.appendChild(ele)
    ele.insertAdjacentElement('beforebegin', iaedoc.createElement('one'))
    iaede.insertAdjacentElement('afterbegin', iaedoc.createElement('two'))
    iaede.insertAdjacentElement('beforeend', iaedoc.createElement('three'))
    ele.insertAdjacentElement('afterend', iaedoc.createElement('four'))

    expect($$.printTree(iaedoc)).toBe($$.t`
      root
        two
        one
        node
        four
        three
      `)
  })

  test('insertAdjacentElement() with null parent', function () {
    const iaedoc = $$.dom.createDocument(null, 'root')

    if (!iaedoc.documentElement)
      throw new Error("documentElement is null")

    const iaede = iaedoc.documentElement
    const ele = doc.createElement('node')
    iaede.appendChild(ele)
    ele.remove()
    const cn1 = iaedoc.createElement('one')
    const cn2 = iaedoc.createElement('two')

    expect(ele.insertAdjacentElement('beforebegin', cn1)).toBeNull()
    expect(ele.insertAdjacentElement('afterend', cn2)).toBeNull()

    expect($$.printTree(iaedoc)).toBe($$.t`
      root
      `)
  })

  test('insertAdjacentText()', function () {
    const iaedoc = $$.dom.createDocument(null, 'root')

    if (!iaedoc.documentElement)
      throw new Error("documentElement is null")

    const iaede = iaedoc.documentElement
    const ele = doc.createElement('node')
    iaede.appendChild(ele)
    ele.insertAdjacentText('beforebegin', 'one')
    iaede.insertAdjacentText('afterbegin', 'two')
    iaede.insertAdjacentText('beforeend', 'three')
    ele.insertAdjacentText('afterend', 'four')

    expect($$.printTree(iaedoc)).toBe($$.t`
      root
        # two
        # one
        node
        # four
        # three
      `)
  })

  test('insertAdjacentText() with null parent', function () {
    const iaedoc = $$.dom.createDocument(null, 'root')

    if (!iaedoc.documentElement)
      throw new Error("documentElement is null")

    const iaede = iaedoc.documentElement
    const ele = doc.createElement('node')
    iaede.appendChild(ele)
    ele.remove()

    expect(ele.insertAdjacentText('beforebegin', 'one')).toBeUndefined()
    expect(ele.insertAdjacentText('afterend', 'two')).toBeUndefined()

    expect($$.printTree(iaedoc)).toBe($$.t`
      root
      `)
  })

  test('lookupPrefix()', function () {
    expect(ele1.lookupPrefix('myns')).toBe('n')
    expect(ele1.lookupPrefix('none')).toBeNull()

    const nsdoc = $$.dom.createDocument('myns', 'root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele = doc.createElementNS('myns', 'n:root')
    de.appendChild(ele)
    ele.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'ns1')
    ele.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:name', 'ns2')
    expect(ele.lookupPrefix('ns2')).toBe('name')
    expect(ele.lookupPrefix('')).toBeNull()
  })

  test('lookupNamespaceURI()', function () {
    expect(ele1.lookupNamespaceURI('n')).toBe('myns')
    expect(ele1.lookupNamespaceURI('none')).toBeNull()

    const nsdoc = $$.dom.createDocument('myns', 'root')
    if (!doc.documentElement)
      throw new Error("documentElement is null")
    const de = doc.documentElement
    const ele = doc.createElementNS('myns', 'n:root')
    de.appendChild(ele)
    ele.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'ns1')
    ele.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:name', 'ns2')
    ele.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:namez', '')
    expect(ele.lookupNamespaceURI(null)).toBe('ns1')
    expect(ele.lookupNamespaceURI('name')).toBe('ns2')
    expect(ele.lookupNamespaceURI('namez')).toBeNull()
  })

  test('attachShadow()', function () {
    const doc = $$.dom.createHTMLDocument('my doc')
    const body = doc.getElementsByTagName('body')[0]
    if (!body)
      throw new Error("body element is null")
    const custom = doc.createElementNS('http://www.w3.org/1999/xhtml', 'my-custom-element')
    body.appendChild(custom)
    const shadow = custom.attachShadow({ mode: 'open' })
    expect(shadow.mode).toBe('open')
    expect(shadow.host).toBe(custom)
    expect(() => custom.attachShadow({ mode: 'open' })).toThrow()
  })

  test('attachShadow() non-html namespace', function () {
    const xmldoc = $$.dom.createDocument('ns', 'root')
    if (!xmldoc.documentElement)
      throw new Error("documentElement is null")
    const xmlde = xmldoc.documentElement
    const custom2 = xmldoc.createElementNS('somens', 'my-custom-element')
    xmlde.appendChild(custom2)
    expect(() => custom2.attachShadow({ mode: 'open' })).toThrow()
  })

  test('attachShadow() invalid element name', function () {
    const doc = $$.dom.createHTMLDocument('my doc')
    const body = doc.getElementsByTagName('body')[0]
    if (!body)
      throw new Error("body element is null")
    const custom = doc.createElementNS('http://www.w3.org/1999/xhtml', 'nonono')
    body.appendChild(custom)
    expect(() => custom.attachShadow({ mode: 'open' })).toThrow()
  })

  test('attachShadow() reserved element name', function () {
    const doc = $$.dom.createHTMLDocument('my doc')
    const body = doc.getElementsByTagName('body')[0]
    if (!body)
      throw new Error("body element is null")
    const custom = doc.createElementNS('http://www.w3.org/1999/xhtml', 'font-face')
    body.appendChild(custom)
    expect(() => custom.attachShadow({ mode: 'open' })).toThrow()
  })

  test('shadowRoot', function () {
    const doc = $$.dom.createHTMLDocument('my doc')
    const body = doc.getElementsByTagName('body')[0]
    if (!body)
      throw new Error("body element is null")
    const custom = doc.createElementNS('http://www.w3.org/1999/xhtml', 'my-custom-element')
    body.appendChild(custom)
    custom.attachShadow({ mode: 'open' })
    const shadow = custom.shadowRoot
    if (!shadow)
      throw new Error("shadow root is null")
    expect(shadow.mode).toBe('open')
    expect(shadow.host).toBe(custom)
  })

})