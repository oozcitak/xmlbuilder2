import $$ from '../TestHelpers'

describe('Document', function () {

  let doc = $$.dom.createDocument('myns', 'root')
  let ele = doc.createElement('node_with_id')
  ele.id = 'uniq'
  if (doc.documentElement)
    doc.documentElement.appendChild(ele)

  test('constructor()', function () {
    expect($$.printTree(doc)).toBe($$.t`
      root
        node_with_id id="uniq"
      `)
  })

  test('getElementById()', function () {
    expect(doc.getElementById('uniq')).toBe(ele)
  })
})