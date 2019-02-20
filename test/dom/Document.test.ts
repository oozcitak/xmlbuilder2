import { Document, Node } from '../../lib/dom.js'

describe('Document', function () {
  test('constructor()', function () {
    let doc = new Document()

    expect(doc.nodeType).toBe(Node.Document)
    expect(doc.nodeName).toBe('#document')
  })
})