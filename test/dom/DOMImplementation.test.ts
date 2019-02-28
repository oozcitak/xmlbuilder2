import { DOMImplementation } from '../../lib/dom.js'

const dom = new DOMImplementation()

describe('DOMImplementation', function () {
  test('new DOMImplementation()', function () {
    expect(dom.hasFeature()).toBe(true)
  })

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

    expect(doc.documentElement).not.toBeNull()
    if (doc.documentElement)
      expect(doc.documentElement.namespaceURI).toBe('myns')
    expect(doc.contentType).toBe('application/xml')
    expect(doc.doctype).not.toBeNull()
    if (doc.doctype) {
      expect(doc.doctype.nodeName).toBe('qname')
      expect(doc.doctype.name).toBe('qname')
      expect(doc.doctype.publicId).toBe('pub_id')
      expect(doc.doctype.systemId).toBe('sys_id')
    }
  })

  test('createHTMLDocument()', function () {
    let doc = dom.createHTMLDocument('htmldoc')

    expect(doc.contentType).toBe('application/xhtml+xml')
    expect(doc.doctype && doc.doctype.nodeName).toBe('html')
    expect(doc.documentElement && doc.documentElement.tagName).toBe('html')
    expect(doc.documentElement && doc.documentElement.firstChild &&
      doc.documentElement.firstChild.nodeName).toBe('head')
    expect(doc.documentElement && doc.documentElement.firstChild &&
      doc.documentElement.firstChild.firstChild && 
      doc.documentElement.firstChild.firstChild.nodeName).toBe('title')
    expect(doc.documentElement && doc.documentElement.firstChild &&
      doc.documentElement.firstChild.firstChild && 
      doc.documentElement.firstChild.firstChild.firstChild &&
      doc.documentElement.firstChild.firstChild.firstChild.nodeValue).toBe('htmldoc')
    expect(doc.documentElement && doc.documentElement.firstChild &&
      doc.documentElement.firstChild.nextSibling && 
      doc.documentElement.firstChild.nextSibling.nodeName).toBe('body')
    })
})