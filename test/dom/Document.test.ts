import { Document } from '../../src/dom/Document'
import { Node } from '../../src/dom/Node'

describe('Document', function () {
  test('constructor()', function () {
    let doc = new Document()

    expect(doc.nodeType).toBe(Node.Document)
    expect(doc.nodeName).toBe('#document')
  })
})