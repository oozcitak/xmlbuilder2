import $$ from '../TestHelpers'

$$.suite('custom parser examples in wiki', () => {

  $$.test('skip comments', () => {
    const xmlString = `
      <?xml version="1.0"?>
      <!-- records read from database -->
      <records>
        <!-- 3 nodes follow -->
        <record id="1"/>
        <record id="2"/>
        <!-- node 3 not found -->
        <record id="4"/>
      </records>`;

    const doc = $$.create({ parser: { comment: () => undefined } }, xmlString);

    $$.deepEqual(doc.end({ prettyPrint: true }), $$.t`
      <?xml version="1.0"?>
      <records>
        <record id="1"/>
        <record id="2"/>
        <record id="4"/>
      </records>
    `)
  })

  $$.test("namespace scope", () => {
    const obj = {
      'root': {
        '-ns1:some/uri': { // namespace scope - prefix: ns1, ns: some/uri
          'node1': '',
          'node2': ''
        },
        '-': { // no namespace
          'node3': ''
        }
      }
    }

    let prefix: string | undefined
    let ns: string | undefined
    const elementParser = function(this: any, parent: any, namespace: string | null | undefined, name: string): any | undefined {
      if (name.startsWith('-')) {
        let [elePrefix, eleNS] = name.substring(1).split(':')
        if (eleNS === undefined) {
          prefix = undefined
          ns = undefined
          return parent
        } else {
          prefix = elePrefix
          ns = eleNS
          return parent.att('xmlns:' + prefix, eleNS)
        }
      } else {
        return prefix ? parent.ele(prefix + ':' + name) : parent.ele(name)
      }
    }

    const doc = $$.create({ parser: { element: elementParser } }, obj);

    $$.deepEqual(doc.end({ headless: true, prettyPrint: true }), $$.t`
      <root xmlns:ns1="some/uri">
        <ns1:node1/>
        <ns1:node2/>
        <node3/>
      </root>
    `)
  })

})

