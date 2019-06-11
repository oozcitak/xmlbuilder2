import $$ from './TestHelpers'

describe('NonElementParentNode', function () {

  test('getElementById() on document', function () {
    const doc = $$.dom.createDocument('myns', 'n:root')

    if (!doc.documentElement)
      throw new Error("documentElement is null")
  
    const ele = doc.createElement('node_with_id')
    doc.documentElement.appendChild(ele)
    ele.id = 'uniq'
  
    expect(doc.getElementById('uniq')).toBe(ele)
    expect(doc.getElementById('none')).toBeNull()
  })

  test('getElementById() on document fragment', function () {
    const doc = $$.dom.createDocument('myns', 'n:root')
    const frag = doc.createDocumentFragment()

    const ele = doc.createElement('node_with_id')
    frag.appendChild(ele)
    ele.id = 'uniq'
  
    expect(frag.getElementById('uniq')).toBe(ele)
    expect(frag.getElementById('none')).toBeNull()
  })

})