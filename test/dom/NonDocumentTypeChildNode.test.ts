import $$ from './TestHelpers'

describe('NonDocumentTypeChildNode', function () {

  const doc = $$.dom.createDocument('myns', 'n:root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const de = doc.documentElement

  const child1 = doc.createElement('child1')
  const child2 = doc.createTextNode('child2')
  const child3 = doc.createElement('child3')
  const child4 = doc.createTextNode('child4')
  de.appendChild(child1)
  de.appendChild(child2)
  de.appendChild(child3)
  de.appendChild(child4)

  test('previousElementSibling', function () {
    expect(child4.previousElementSibling).toBe(child3)
    expect(child3.previousElementSibling).toBe(child1)
    expect(child1.previousElementSibling).toBeNull()
  })

  test('nextElementSibling', function () {
    expect(child1.nextElementSibling).toBe(child3)
    expect(child3.nextElementSibling).toBeNull()
  })

})