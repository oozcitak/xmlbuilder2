import $$ from "../TestHelpers";
import { XMLBuilder } from "../../src/interfaces";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/25
  $$.test("#25 - Custom converter", () => {
    const obj = {
      'root': {
        '-ns:ns1:some/uri': {
          'node1': 'Some text',
          'node2': 1234
        }
      }
    }

    let prefix: string | undefined
    let ns: string | undefined
    const doc = $$.create({
      parser: {
        element: function(this: any, parent: XMLBuilder, namespace: string | null | undefined, name: string): XMLBuilder | undefined {
          if (name.startsWith('-ns:')) {
            let [elePrefix, eleNS] = name.substring(4).split(':')
            if (eleNS === undefined) {
              prefix = undefined
              ns = undefined
              return undefined
            } else {
              prefix = elePrefix
              ns = eleNS
              return parent.att('xmlns:' + prefix, eleNS)
            }
          } else {
            return prefix ? parent.ele(prefix + ':' + name) : parent.ele(name)
          }
        }
      }
    }, obj);

    $$.deepEqual(doc.end({ headless: true, prettyPrint: true }), $$.t`
      <root xmlns:ns1="some/uri">
        <ns1:node1>Some text</ns1:node1>
        <ns1:node2>1234</ns1:node2>
      </root>
    `)

    $$.deepEqual((doc.root().first().node as any).namespaceURI, 'some/uri')
    $$.deepEqual((doc.root().last().node as any).namespaceURI, 'some/uri')
  })

})
