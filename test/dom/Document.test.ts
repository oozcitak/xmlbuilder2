import { Document, Node } from '../../lib/dom.js'

describe('Document', function () {
  test('constructor()', function () {
    let doc = new Document()
    let ele = doc.createElement('node')
    doc.appendChild(ele);

    expect(doc.nodeType).toBe(Node.Document)
    expect(doc.nodeName).toBe('#document')
    if (doc.documentElement) {
      expect(doc.documentElement.nodeType).toBe(Node.Element)
      expect(doc.documentElement.nodeName).toBe('node')
    }
  })
})