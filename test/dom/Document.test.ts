import $$ from '../TestHelpers'

describe('Document', function () {

  const doctype = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
  const doc = $$.dom.createDocument('myns', 'root', doctype)
  const ele = doc.createElement('node_with_id')
  ele.id = 'uniq'
  if (doc.documentElement)
    doc.documentElement.appendChild(ele)

  test('constructor()', function () {
    expect($$.printTree(doc)).toBe($$.t`
      !DOCTYPE qname PUBLIC pubid SYSTEM sysid
      root
        node_with_id id="uniq"
      `)
    expect(doc.URL).toBe('about:blank')
    expect(doc.documentURI).toBe('about:blank')
    expect(doc.origin).toBe('')
    expect(doc.compatMode).toBe('CSS1Compat')
    expect(doc.characterSet).toBe('UTF-8')
    expect(doc.charset).toBe('UTF-8')
    expect(doc.inputEncoding).toBe('UTF-8')
    expect(doc.contentType).toBe('application/xml')
    expect(doc.nodeType).toBe(9)
    expect(doc.nodeName).toBe('#document')
    expect(doc.doctype).toBe(doctype)
    expect(doc.documentElement && doc.documentElement.tagName).toBe('root')

  })

  test('getElementById()', function () {
    expect(doc.getElementById('uniq')).toBe(ele)
  })
})