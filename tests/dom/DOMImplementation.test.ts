import { dom, expect } from '../common'

describe('DOMImplementation', function () {
  it('createDocument()', function () {
    let doc = dom.createDocument('myns', 'qname', null)
    expect('doc.documentElement.namespaceURI').equal('myns');
  })
})