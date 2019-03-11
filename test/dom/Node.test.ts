import $$ from '../TestHelpers'

describe('Node', function () {

  const doc = $$.dom.createDocument('myns', 'root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const de = doc.documentElement

  const ele1 = doc.createElement('ele')
  const anyEle = <any>ele1
  anyEle._baseURI = 'http://www.example.com'  
  de.appendChild(ele1)
  const child1 = doc.createElement('child1')
  const child2 = doc.createElement('child2')
  const child3 = doc.createElement('child3')
  const child4 = doc.createElement('child4')
  ele1.appendChild(child1)
  ele1.appendChild(child2)
  ele1.appendChild(child3)
  ele1.appendChild(child4)
  child4.appendChild(doc.createTextNode('master'))
  child4.appendChild(doc.createTextNode('of'))
  child4.appendChild(doc.createComment('puppity'))
  child4.appendChild(doc.createTextNode('puppets'))

  test('baseURI', function () {
    expect(ele1.baseURI).toBe('http://www.example.com')
  })

  test('isConnected', function () {
    expect(ele1.isConnected).toBeTruthy()
    expect(doc.isConnected).toBeFalsy()
  })

  test('ownerDocument', function () {
    expect(ele1.ownerDocument).toBe(doc)
    expect(doc.ownerDocument).toBe(doc)
  })

  test('getRootNode()', function () {
    expect(ele1.getRootNode()).toBe(doc)
  })

  test('parentNode', function () {
    expect(ele1.parentNode).toBe(de)
    expect(doc.parentElement).toBeNull()
  })

  test('parentElement', function () {
    expect(ele1.parentElement).toBe(de)
    expect(doc.parentElement).toBeNull()
  })

  test('hasChildNodes', function () {
    expect(ele1.hasChildNodes).toBeTruthy()
  })

  test('childNodes', function () {
    expect(ele1.childNodes.length).toBe(4)
  })

  test('firstChild', function () {
    expect(ele1.firstChild).toBe(child1)
  })

  test('lastChild', function () {
    expect(ele1.lastChild).toBe(child4)
  })

  test('previousSibling', function () {
    expect(child3.previousSibling).toBe(child2)
  })

  test('nextSibling', function () {
    expect(child3.nextSibling).toBe(child4)
  })

  test('nodeValue', function () {
    const charNode = child4.firstChild
    if (!charNode)
      throw new Error("charNode is null")
  
    expect(charNode.nodeValue).toBe('master')
    charNode.nodeValue = 'maestro'
    expect(charNode.nodeValue).toBe('maestro')
    charNode.nodeValue = 'master'
  })

  test('textContent', function () {
    expect(child4.textContent).toBe('masterofpuppets')
    child4.textContent = 'masterofbobbitts'
    expect(child4.childNodes.length).toBe(1)

    const charNode = child4.firstChild
    if (!charNode)
      throw new Error("charNode is null")

    expect(charNode.textContent).toBe('masterofbobbitts')
  })

})