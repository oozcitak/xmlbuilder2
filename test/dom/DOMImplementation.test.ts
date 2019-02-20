import { DOMImplementation } from '../../lib/dom.js'

const dom = new DOMImplementation()

describe('DOMImplementation', function () {
  test('createDocumentType()', function () {
    let doctype = dom.createDocumentType('qname', 'pub_id', 'sys_id')

    expect(doctype.nodeName).toBe('qname')
    expect(doctype.name).toBe('qname')
    expect(doctype.publicId).toBe('pub_id')
    expect(doctype.systemId).toBe('sys_id')
  })

  test('createDocument()', function () {
    let doctype = dom.createDocumentType('qname', 'pub_id', 'sys_id')
    let doc = dom.createDocument('myns', 'qname', doctype)

    expect(doc.documentElement).toBeDefined()
    if (doc.documentElement)
      expect(doc.documentElement.namespaceURI).toBe('myns')
    expect(doc.doctype).toBeDefined()
    expect(doc.contentType).toBe('application/xml')
    if (doc.doctype) {
      expect(doc.doctype.nodeName).toBe('qname')
      expect(doc.doctype.name).toBe('qname')
      expect(doc.doctype.publicId).toBe('pub_id')
      expect(doc.doctype.systemId).toBe('sys_id')
    }
  })
})