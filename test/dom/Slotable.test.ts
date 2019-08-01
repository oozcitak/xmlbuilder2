import $$ from './TestHelpers'

describe('Slotable', function () {

  const doc = $$.dom.createDocument('myns', 'n:root')

  if (!doc.documentElement)
    throw new Error("documentElement is null")

  const de = doc.documentElement

  const child1 = doc.createTextNode('child1')
  const child2 = doc.createElement('child2')
  de.appendChild(child1)
  de.appendChild(child2)

  test('assignedSlot', function () {
    expect(child1.assignedSlot).toBeNull()
    expect(child2.assignedSlot).toBeNull()
  })

})