import $$ from '../TestHelpers'

describe('Document', function () {

  const doctype = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
  const doc = $$.dom.createDocument('myns', 'root', doctype)
  const ele = doc.createElement('node_with_id')
  ele.id = 'uniq'
  const tele1 = doc.createElement('tagged')
  tele1.id = 'tele1'
  const tele2 = doc.createElement('tagged')
  tele2.id = 'tele2'
  if (doc.documentElement) {
    doc.documentElement.appendChild(tele1)
    doc.documentElement.appendChild(ele)
    doc.documentElement.appendChild(tele2)
  }

  test('constructor()', function () {
    expect($$.printTree(doc)).toBe($$.t`
      !DOCTYPE qname PUBLIC pubid SYSTEM sysid
      root
        tagged id="tele1"
        node_with_id id="uniq"
        tagged id="tele2"
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

  test('getElementsByTagName()', function () {
    const list = doc.getElementsByTagName('tagged')
    expect(list.length).toBe(2)
    expect(list.item(0)).toBe(tele1)
    expect(list.item(1)).toBe(tele2)
  })

})