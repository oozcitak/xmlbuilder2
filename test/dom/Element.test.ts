import $$ from '../TestHelpers'

describe('Element', function () {

  const doc = $$.dom.createDocument('myns', 'root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const ele1 = doc.createElementNS('myns', 'n:root')
  doc.documentElement.appendChild(ele1)
  ele1.id = 'uniq'
  ele1.setAttribute('att1', 'value1')
  ele1.setAttribute('att2', 'value2')
  ele1.setAttributeNS('http://www.w3.org/1999/xhtml', 'ns:name', 'value')
  const ele2 = doc.createElement('withclass')
  doc.documentElement.appendChild(ele2)
  ele2.setAttribute('class', 'a b c')
  const ele3 = doc.createElement('withslot')
  doc.documentElement.appendChild(ele3)
  ele3.setAttribute('slot', 'x')
  const ele4 = doc.createElement('withtext')
  doc.documentElement.appendChild(ele4)
  ele4.appendChild(doc.createTextNode('let'))
  ele4.appendChild(doc.createTextNode('me'))
  ele4.appendChild(doc.createComment('never'))
  ele4.appendChild(doc.createTextNode('smash'))

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

})