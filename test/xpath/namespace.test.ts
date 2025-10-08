import $$ from '../TestHelpers'
import { select } from 'xpath'

$$.suite('XPath with Namespaces', () => {

  $$.test('select', () => {
    const doc = $$.create("<book><title xmlns='myns'>Harry Potter</title></book>")
    const node = select("//*[local-name(.)='title' and namespace-uri(.)='myns']", doc.node as any) as any

    $$.deepEqual(node[0].namespaceURI, "myns")
  })

})
