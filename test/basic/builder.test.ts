import $$ from '../TestHelpers'
import { Document, NodeType } from "@oozcitak/dom/lib/dom/interfaces"

$$.suite('builder()', () => {

  $$.test('wrap node', () => {
    const doc = $$.create()
    const root = (doc.node as Document).createElement('root')
    const builder = $$.builder(root)
    const ele = builder.ele('ele')
    $$.deepEqual(ele.toString(), '<ele/>')
  })

  $$.test('invalid wrapper', () => {
    const doc = $$.create()
    const root = (doc.node as Document).createElement('root')
    $$.throws(() => $$.builder({ version: "1.0" } as any))
  })

  $$.test('node', () => {
    const node = $$.create().ele('root').ele('node')
    $$.deepEqual(node.node.nodeType, NodeType.Element)
  })

})
