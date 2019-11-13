import $$ from '../TestHelpers'
import { dom } from '@oozcitak/dom'

describe('cast', () => {

  test('any', () => {
    const node = $$.document().ele('root').ele('node')
    expect(node.as.any.nodeType).toBe(dom.Interfaces.NodeType.Element)
  })

  test('node', () => {
    const node = $$.document().ele('root').ele('node')
    expect(node.as.node.nodeType).toBe(dom.Interfaces.NodeType.Element)
  })

  test('document', () => {
    const node = $$.document()
    expect(node.as.document.nodeType).toBe(dom.Interfaces.NodeType.Document)
  })

  test('documentType', () => {
    const node = $$.document().dtd().first()
    expect(node.as.documentType.nodeType).toBe(dom.Interfaces.NodeType.DocumentType)
  })

  test('documentFragment', () => {
    const node = $$.fragment()
    expect(node.as.documentFragment.nodeType).toBe(dom.Interfaces.NodeType.DocumentFragment)
  })

  test('attr', () => {
    const node = $$.document().ele('root').att('node', 'val')
    for (const att of node.traverseAttributes()) {
      expect(att.as.attr.nodeType).toBe(dom.Interfaces.NodeType.Attribute)
    }
  })

  test('text', () => {
    const node = $$.document().ele('root').txt('node').first()
    expect(node.as.text.nodeType).toBe(dom.Interfaces.NodeType.Text)
  })

  test('cdataSection', () => {
    const node = $$.document().ele('root').dat('node').first()
    expect(node.as.cdataSection.nodeType).toBe(dom.Interfaces.NodeType.CData)
  })

  test('comment', () => {
    const node = $$.document().ele('root').com('node').first()
    expect(node.as.comment.nodeType).toBe(dom.Interfaces.NodeType.Comment)
  })

  test('processingInstruction', () => {
    const node = $$.document().ele('root').ins('node', 'val').first()
    expect(node.as.processingInstruction.nodeType).toBe(dom.Interfaces.NodeType.ProcessingInstruction)
  })

  test('element', () => {
    const node = $$.document().ele('root').ele('node')
    expect(node.as.element.nodeType).toBe(dom.Interfaces.NodeType.Element)
  })

  test('guards', () => {
    const ele = $$.document().ele('node')
    expect(() => ele.as.document).toThrow()
    const doc = $$.document()
    expect(() => doc.as.documentType).toThrow()
    expect(() => doc.as.documentFragment).toThrow()
    expect(() => doc.as.attr).toThrow()
    expect(() => doc.as.text).toThrow()
    expect(() => doc.as.cdataSection).toThrow()
    expect(() => doc.as.comment).toThrow()
    expect(() => doc.as.processingInstruction).toThrow()
    expect(() => doc.as.element).toThrow()
  })

})
