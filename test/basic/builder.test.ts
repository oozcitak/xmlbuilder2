import $$ from '../TestHelpers'
import { Document, NodeType } from "@oozcitak/dom/lib/dom/interfaces"

describe('builder()', () => {

  test('wrap node', () => {
    const doc = $$.document()
    const root = (doc.node as Document).createElement('root')
    const builder = $$.builder(root)
    const ele = builder.ele('ele')
    expect(ele.toString()).toBe('<ele/>')
  })

  test('invalid wrapper', () => {
    const doc = $$.document()
    const root = (doc.node as Document).createElement('root')
    expect(() => $$.builder({ version: "1.0" } as any)).toThrow()
  })

  test('node', () => {
    const node = $$.document().ele('root').ele('node')
    expect(node.node.nodeType).toBe(NodeType.Element)
  })

})
