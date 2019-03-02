import $$ from '../TestHelpers'

describe('DOMImplementation', function () {

  test('createDocumentType()', function () {
    const doctype = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
    expect($$.printTree(doctype)).toBe($$.t`
      !DOCTYPE qname PUBLIC pubid SYSTEM sysid
      `)
  })

  test('createDocument()', function () {
    const doctype = $$.dom.createDocumentType('qname', 'pubid', 'sysid')
    const doc = $$.dom.createDocument('myns', 'qname', doctype)
    expect(doc.contentType).toBe('application/xml')

    expect($$.printTree(doc)).toBe($$.t`
      !DOCTYPE qname PUBLIC pubid SYSTEM sysid
      qname
      `)
  })

  test('createHTMLDocument()', function () {
    const doc = $$.dom.createHTMLDocument('htmldoc')
    expect(doc.contentType).toBe('application/xhtml+xml')
    expect($$.printTree(doc)).toBe($$.t`
      !DOCTYPE html
      html
        head
          title
            # htmldoc
        body
      `)
  })

  test('hasFeature()', function () {
    expect($$.dom.hasFeature()).toBe(true)
  })

})